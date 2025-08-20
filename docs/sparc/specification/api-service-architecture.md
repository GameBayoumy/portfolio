# API Service Layer Architecture

## Service Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Components │ Hooks │ Contexts │ React Query │ State Mgmt   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                 Service Layer                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ GitHub API  │ │ Rate Limiter │ │ Data Processing       │ │
│  │ Service     │ │ Service      │ │ Service               │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ Cache       │ │ Error        │ │ Performance           │ │
│  │ Service     │ │ Service      │ │ Monitor               │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                Infrastructure Layer                         │
├─────────────────────────────────────────────────────────────┤
│  HTTP Client │ LocalStorage │ SessionStorage │ IndexedDB    │
└─────────────────────────────────────────────────────────────┘
```

## Core Service Classes

### 1. GitHubAPIService

```typescript
interface GitHubAPIConfig {
  baseURL: string;
  token?: string;
  timeout: number;
  userAgent: string;
}

interface APIResponse<T> {
  data: T;
  rateLimit: RateLimitInfo;
  etag?: string;
  lastModified?: string;
}

class GitHubAPIService {
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
  
  // Core API methods
  async fetchUser(username: string): Promise<APIResponse<GitHubUser>> {
    const cacheKey = `user:${username}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.cache.isExpired(cacheKey)) {
      return { data: cached, rateLimit: await this.getRateLimit() };
    }
    
    await this.rateLimiter.waitForSlot();
    
    try {
      const response = await this.httpClient.get(`/users/${username}`, {
        headers: cached ? { 'If-None-Match': cached.etag } : {}
      });
      
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
    } catch (error) {
      if (error.response?.status === 304 && cached) {
        return { data: cached, rateLimit: await this.getRateLimit() };
      }
      throw this.handleAPIError(error);
    }
  }
  
  async fetchRepositories(username: string, options: RepoFetchOptions = {}): Promise<APIResponse<Repository[]>> {
    const cacheKey = `repos:${username}:${JSON.stringify(options)}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.cache.isExpired(cacheKey)) {
      return { data: cached, rateLimit: await this.getRateLimit() };
    }
    
    const allRepos: Repository[] = [];
    let page = 1;
    const perPage = 100;
    
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
      
      const repos = response.data.map(this.validateRepository);
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
      rateLimit: this.extractRateLimit(response.headers)
    };
  }
  
  async fetchUserEvents(username: string, options: EventFetchOptions = {}): Promise<APIResponse<GitHubEvent[]>> {
    const cacheKey = `events:${username}:${JSON.stringify(options)}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.cache.isExpired(cacheKey)) {
      return { data: cached, rateLimit: await this.getRateLimit() };
    }
    
    await this.rateLimiter.waitForSlot();
    
    const response = await this.httpClient.get(`/users/${username}/events/public`, {
      params: {
        per_page: options.limit || 100,
        page: options.page || 1
      }
    });
    
    const events = response.data
      .map(this.validateEvent)
      .filter(this.isRelevantEvent);
    
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
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.cache.isExpired(cacheKey)) {
      return { data: cached, rateLimit: await this.getRateLimit() };
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
    
    const contributionData = this.processContributionData(response.data);
    
    await this.cache.set(cacheKey, contributionData, {
      ttl: 60 * 60 * 1000 // 1 hour
    });
    
    return {
      data: contributionData,
      rateLimit: this.extractRateLimit(response.headers)
    };
  }
  
  // Utility methods
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
    
    // Request interceptor for rate limiting
    client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitForSlot();
      return config;
    });
    
    // Response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
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
  
  private handleAPIError(error: any): APIError {
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
```

### 2. RateLimiter Service

```typescript
interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: Date;
  used: number;
}

class RateLimiter {
  private requestQueue: Array<() => void> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private rateLimit: RateLimitInfo | null = null;
  
  async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      // Check if we need to wait for rate limit reset
      if (this.rateLimit && this.rateLimit.remaining <= 10) {
        const waitTime = this.rateLimit.resetTime.getTime() - Date.now();
        if (waitTime > 0) {
          await this.sleep(waitTime);
          this.rateLimit = null; // Reset after waiting
        }
      }
      
      // Enforce minimum delay between requests (100ms)
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < 100) {
        await this.sleep(100 - timeSinceLastRequest);
      }
      
      const resolve = this.requestQueue.shift()!;
      this.lastRequestTime = Date.now();
      resolve();
    }
    
    this.isProcessing = false;
  }
  
  updateRateLimit(rateLimit: RateLimitInfo): void {
    this.rateLimit = rateLimit;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. CacheService

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

interface CacheOptions {
  ttl: number;
  etag?: string;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly MAX_MEMORY_ENTRIES = 1000;
  
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(key)) {
      return memoryEntry.data;
    }
    
    // Try localStorage for persistent cache
    try {
      const stored = localStorage.getItem(`github_cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - entry.timestamp < entry.ttl) {
          // Restore to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(`github_cache_${key}`);
        }
      }
    } catch (error) {
      // LocalStorage not available or quota exceeded
      console.warn('Cache storage error:', error);
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, options: CacheOptions): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
      etag: options.etag
    };
    
    // Store in memory cache
    this.memoryCache.set(key, entry);
    this.enforceMemoryLimit();
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`github_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      // Storage quota exceeded or not available
      if (error.name === 'QuotaExceededError') {
        this.clearOldestEntries();
        try {
          localStorage.setItem(`github_cache_${key}`, JSON.stringify(entry));
        } catch {
          // Still failing, continue without persistence
        }
      }
    }
  }
  
  isExpired(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp >= entry.ttl;
  }
  
  clear(pattern?: string): void {
    if (pattern) {
      // Clear entries matching pattern
      const regex = new RegExp(pattern);
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
          localStorage.removeItem(`github_cache_${key}`);
        }
      }
    } else {
      // Clear all cache
      this.memoryCache.clear();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('github_cache_')) {
          localStorage.removeItem(key);
        }
      }
    }
  }
  
  private enforceMemoryLimit(): void {
    if (this.memoryCache.size > this.MAX_MEMORY_ENTRIES) {
      // Remove oldest entries
      const entries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, this.memoryCache.size - this.MAX_MEMORY_ENTRIES);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }
  
  private clearOldestEntries(): void {
    const entries: Array<[string, number]> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('github_cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key)!);
          entries.push([key, entry.timestamp]);
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp and remove oldest 25%
    entries.sort(([, a], [, b]) => a - b);
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.25));
    toRemove.forEach(([key]) => localStorage.removeItem(key));
  }
}
```

## Error Classes

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class RateLimitError extends APIError {
  constructor(
    message: string,
    public resetTime: Date
  ) {
    super(message, 403, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

class NetworkError extends APIError {
  constructor(message: string) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
```

## Service Factory

```typescript
interface ServiceConfig {
  github: GitHubAPIConfig;
  cache: CacheConfig;
  rateLimiter: RateLimiterConfig;
}

class ServiceFactory {
  private static instance: ServiceFactory;
  private services = new Map<string, any>();
  
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }
  
  createGitHubService(config: GitHubAPIConfig): GitHubAPIService {
    const key = `github_${config.baseURL}`;
    if (!this.services.has(key)) {
      this.services.set(key, new GitHubAPIService(config));
    }
    return this.services.get(key);
  }
  
  createCacheService(config: CacheConfig): CacheService {
    const key = `cache_${config.namespace}`;
    if (!this.services.has(key)) {
      this.services.set(key, new CacheService(config));
    }
    return this.services.get(key);
  }
}
```

This API service architecture provides robust, scalable, and maintainable data access for the GitHub Live Visualizers with proper error handling, caching, and rate limiting.