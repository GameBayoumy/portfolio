import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  GitHubUser,
  Repository,
  GitHubEvent,
  ContributionData,
  APIResponse,
  GitHubAPIConfig,
  RateLimitInfo,
  RepoFetchOptions,
  EventFetchOptions
} from '../../types/github.types';
import { RateLimitError, NetworkError, NotFoundError, APIError, ValidationError } from './errors';
import { RateLimiter } from './rate-limiter';
import { CacheService } from './cache.service';

export class GitHubAPIService {
  private config: GitHubAPIConfig;
  private httpClient: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: CacheService;

  constructor(config: GitHubAPIConfig) {
    this.config = config;
    this.httpClient = this.createHttpClient();
    this.rateLimiter = new RateLimiter();
    this.cache = new CacheService();
  }

  async fetchUser(username: string): Promise<APIResponse<GitHubUser>> {
    const cacheKey = `user:${username}`;
    const cached = await this.cache.get<GitHubUser>(cacheKey);

    if (cached && !this.cache.isExpired(cacheKey)) {
      return { 
        data: cached, 
        rateLimit: await this.getCurrentRateLimit() 
      };
    }

    await this.rateLimiter.waitForSlot();

    try {
      const headers: Record<string, string> = {};
      const cachedEntry = await this.cache.getCacheEntry(cacheKey);
      if (cachedEntry?.etag) {
        headers['If-None-Match'] = cachedEntry.etag;
      }

      const response = await this.httpClient.get(`/users/${username}`, { headers });
      
      const user = this.validateUser(response.data);
      await this.cache.set(cacheKey, user, {
        ttl: 10 * 60 * 1000, // 10 minutes
        etag: response.headers.etag
      });

      return {
        data: user,
        rateLimit: this.extractRateLimit(response.headers),
        etag: response.headers.etag
      };
    } catch (error: any) {
      if (error.response?.status === 304 && cached) {
        return { 
          data: cached, 
          rateLimit: await this.getCurrentRateLimit() 
        };
      }
      throw this.handleAPIError(error);
    }
  }

  async fetchRepositories(username: string, options: RepoFetchOptions = {}): Promise<APIResponse<Repository[]>> {
    const cacheKey = `repos:${username}:${JSON.stringify(options)}`;
    const cached = await this.cache.get<Repository[]>(cacheKey);

    if (cached && !this.cache.isExpired(cacheKey)) {
      return { 
        data: cached, 
        rateLimit: await this.getCurrentRateLimit() 
      };
    }

    const allRepos: Repository[] = [];
    let page = options.page || 1;
    const perPage = options.per_page || 100;
    let lastResponse: AxiosResponse;

    while (true) {
      await this.rateLimiter.waitForSlot();

      const response = await this.httpClient.get(`/users/${username}/repos`, {
        params: {
          sort: options.sort || 'updated',
          direction: options.direction || 'desc',
          per_page: perPage,
          page,
          type: options.type || 'all'
        }
      });

      lastResponse = response;
      const repos = response.data.map((repo: any) => this.validateRepository(repo));
      allRepos.push(...repos);

      if (repos.length < perPage) break;
      page++;
    }

    // Fetch language data for each repository
    await this.enrichRepositoriesWithLanguages(allRepos);

    await this.cache.set(cacheKey, allRepos, {
      ttl: 5 * 60 * 1000 // 5 minutes
    });

    return {
      data: allRepos,
      rateLimit: this.extractRateLimit(lastResponse!.headers)
    };
  }

  async fetchUserEvents(username: string, options: EventFetchOptions = {}): Promise<APIResponse<GitHubEvent[]>> {
    const cacheKey = `events:${username}:${JSON.stringify(options)}`;
    const cached = await this.cache.get<GitHubEvent[]>(cacheKey);

    if (cached && !this.cache.isExpired(cacheKey)) {
      return { 
        data: cached, 
        rateLimit: await this.getCurrentRateLimit() 
      };
    }

    await this.rateLimiter.waitForSlot();

    const response = await this.httpClient.get(`/users/${username}/events/public`, {
      params: {
        per_page: options.limit || 100,
        page: options.page || 1
      }
    });

    const events = response.data
      .map((event: any) => this.validateEvent(event))
      .filter((event: GitHubEvent) => this.isRelevantEvent(event, options.types));

    await this.cache.set(cacheKey, events, {
      ttl: 2 * 60 * 1000 // 2 minutes
    });

    return {
      data: events,
      rateLimit: this.extractRateLimit(response.headers)
    };
  }

  async fetchContributions(username: string, year: number): Promise<APIResponse<ContributionData>> {
    const cacheKey = `contributions:${username}:${year}`;
    const cached = await this.cache.get<ContributionData>(cacheKey);

    if (cached && !this.cache.isExpired(cacheKey)) {
      return { 
        data: cached, 
        rateLimit: await this.getCurrentRateLimit() 
      };
    }

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      username,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`
    };

    await this.rateLimiter.waitForSlot();

    const response = await this.httpClient.post('/graphql', {
      query,
      variables
    });

    if (response.data.errors) {
      throw new APIError(`GraphQL errors: ${response.data.errors.map((e: any) => e.message).join(', ')}`);
    }

    const contributionData = this.processContributionData(response.data.data);

    await this.cache.set(cacheKey, contributionData, {
      ttl: 60 * 60 * 1000 // 1 hour
    });

    return {
      data: contributionData,
      rateLimit: this.extractRateLimit(response.headers)
    };
  }

  async checkRateLimit(): Promise<RateLimitInfo> {
    const response = await this.httpClient.get('/rate_limit');
    return this.extractRateLimit(response.headers);
  }

  clearCache(pattern?: string): void {
    this.cache.clear(pattern);
  }

  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': this.config.userAgent,
        ...(this.config.token && { 'Authorization': `token ${this.config.token}` })
      }
    });

    // Request interceptor
    client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitForSlot();
      return config;
    });

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        const rateLimit = this.extractRateLimit(response.headers);
        this.rateLimiter.updateRateLimit(rateLimit);
        return response;
      },
      (error) => Promise.reject(this.handleAPIError(error))
    );

    return client;
  }

  private async enrichRepositoriesWithLanguages(repos: Repository[]): Promise<void> {
    const languagePromises = repos.map(async (repo) => {
      try {
        await this.rateLimiter.waitForSlot();
        const response = await this.httpClient.get(`/repos/${repo.full_name}/languages`);
        repo.languages = response.data;
      } catch (error) {
        // Non-critical error, continue without language data
        repo.languages = {};
      }
    });

    await Promise.allSettled(languagePromises);
  }

  private validateUser(userData: any): GitHubUser {
    if (!userData || typeof userData !== 'object') {
      throw new ValidationError('Invalid user data format');
    }

    if (!userData.login || typeof userData.login !== 'string') {
      throw new ValidationError('Invalid user data: missing or invalid login');
    }

    if (typeof userData.id !== 'number') {
      throw new ValidationError('Invalid user data: missing or invalid id');
    }

    return {
      login: userData.login,
      id: userData.id,
      avatar_url: userData.avatar_url || '',
      name: userData.name || null,
      company: userData.company || null,
      location: userData.location || null,
      bio: userData.bio || null,
      public_repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString()
    };
  }

  private validateRepository(repoData: any): Repository {
    if (!repoData || typeof repoData !== 'object') {
      throw new ValidationError('Invalid repository data format');
    }

    if (!repoData.name || typeof repoData.name !== 'string') {
      throw new ValidationError('Invalid repository data: missing or invalid name');
    }

    return {
      id: repoData.id || 0,
      name: repoData.name,
      full_name: repoData.full_name || repoData.name,
      description: repoData.description || null,
      private: Boolean(repoData.private),
      html_url: repoData.html_url || '',
      created_at: repoData.created_at || new Date().toISOString(),
      updated_at: repoData.updated_at || new Date().toISOString(),
      pushed_at: repoData.pushed_at || new Date().toISOString(),
      stargazers_count: repoData.stargazers_count || 0,
      watchers_count: repoData.watchers_count || 0,
      forks_count: repoData.forks_count || 0,
      language: repoData.language || null,
      languages: repoData.languages || {},
      topics: repoData.topics || [],
      parent: repoData.parent ? {
        name: repoData.parent.name,
        owner: {
          login: repoData.parent.owner.login
        }
      } : undefined
    };
  }

  private validateEvent(eventData: any): GitHubEvent {
    if (!eventData || typeof eventData !== 'object') {
      throw new ValidationError('Invalid event data format');
    }

    return {
      id: eventData.id || '',
      type: eventData.type || 'UnknownEvent',
      created_at: eventData.created_at || new Date().toISOString(),
      repo: eventData.repo ? {
        name: eventData.repo.name,
        url: eventData.repo.url
      } : undefined,
      payload: eventData.payload || {}
    };
  }

  private isRelevantEvent(event: GitHubEvent, allowedTypes?: string[]): boolean {
    const relevantTypes = allowedTypes || [
      'PushEvent',
      'CreateEvent',
      'ForkEvent',
      'WatchEvent',
      'IssuesEvent',
      'PullRequestEvent',
      'ReleaseEvent'
    ];

    return relevantTypes.includes(event.type);
  }

  private processContributionData(graphqlData: any): ContributionData {
    const calendar = graphqlData.user?.contributionsCollection?.contributionCalendar;
    
    if (!calendar) {
      throw new ValidationError('Invalid contribution data format');
    }

    return {
      totalContributions: calendar.totalContributions || 0,
      weeks: calendar.weeks || []
    };
  }

  private extractRateLimit(headers: any): RateLimitInfo {
    return {
      remaining: parseInt(headers['x-ratelimit-remaining'] || '5000'),
      limit: parseInt(headers['x-ratelimit-limit'] || '5000'),
      resetTime: new Date(parseInt(headers['x-ratelimit-reset'] || '0') * 1000),
      used: parseInt(headers['x-ratelimit-limit'] || '5000') - parseInt(headers['x-ratelimit-remaining'] || '5000')
    };
  }

  private async getCurrentRateLimit(): Promise<RateLimitInfo> {
    try {
      return await this.checkRateLimit();
    } catch {
      // Fallback rate limit info
      return {
        remaining: 5000,
        limit: 5000,
        resetTime: new Date(Date.now() + 3600000),
        used: 0
      };
    }
  }

  private handleAPIError(error: any): Error {
    if (error.response) {
      const { status, data, headers } = error.response;

      if (status === 403 && headers['x-ratelimit-remaining'] === '0') {
        const resetTime = new Date(parseInt(headers['x-ratelimit-reset']) * 1000);
        return new RateLimitError('Rate limit exceeded', resetTime);
      }

      if (status === 404) {
        return new NotFoundError(data.message || 'Resource not found');
      }

      return new APIError(data.message || 'API request failed', status);
    }

    if (error.request) {
      return new NetworkError('Network request failed');
    }

    return new APIError('Unknown error occurred');
  }
}