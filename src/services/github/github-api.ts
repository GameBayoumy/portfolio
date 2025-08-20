// Complete GitHub API Service for GameBayoumy Portfolio

import type {
  GitHubUser,
  GitHubRepository,
  GitHubLanguages,
  GitHubEvent,
  GitHubTrafficViews,
  GitHubTrafficClones,
  GitHubTrafficReferrers,
  GitHubTrafficPaths,
  RepositoryStats,
  LanguageStats,
  ActivityStats,
  ApiResponse,
  RequestConfig
} from '../../types/github';
import { GITHUB_CONFIG } from '../../config/github';
import { GitHubBaseClient } from './base-client';

export class GitHubApiService extends GitHubBaseClient {
  private username: string;

  constructor(username: string = GITHUB_CONFIG.USERNAME, authToken?: string) {
    super(authToken);
    this.username = username;
  }

  /**
   * Get user profile data
   */
  public async getUserProfile(config?: RequestConfig): Promise<ApiResponse<GitHubUser>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.USER(this.username);
    return this.request<GitHubUser>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.PROFILE,
      ...config
    });
  }

  /**
   * Get all user repositories
   */
  public async getUserRepositories(config?: RequestConfig): Promise<ApiResponse<GitHubRepository[]>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.USER_REPOS(this.username);
    return this.request<GitHubRepository[]>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.REPOSITORIES,
      ...config
    });
  }

  /**
   * Get user recent events/activity
   */
  public async getUserEvents(config?: RequestConfig): Promise<ApiResponse<GitHubEvent[]>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.USER_EVENTS(this.username);
    return this.request<GitHubEvent[]>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.EVENTS,
      ...config
    });
  }

  /**
   * Get languages for a specific repository
   */
  public async getRepositoryLanguages(
    repoName: string,
    config?: RequestConfig
  ): Promise<ApiResponse<GitHubLanguages>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.REPO_LANGUAGES(this.username, repoName);
    return this.request<GitHubLanguages>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.LANGUAGES,
      ...config
    });
  }

  /**
   * Get repository traffic views (requires authentication)
   */
  public async getRepositoryTrafficViews(
    repoName: string,
    config?: RequestConfig
  ): Promise<ApiResponse<GitHubTrafficViews>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.REPO_TRAFFIC_VIEWS(this.username, repoName);
    return this.request<GitHubTrafficViews>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.TRAFFIC,
      ...config
    });
  }

  /**
   * Get repository traffic clones (requires authentication)
   */
  public async getRepositoryTrafficClones(
    repoName: string,
    config?: RequestConfig
  ): Promise<ApiResponse<GitHubTrafficClones>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.REPO_TRAFFIC_CLONES(this.username, repoName);
    return this.request<GitHubTrafficClones>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.TRAFFIC,
      ...config
    });
  }

  /**
   * Get repository traffic referrers (requires authentication)
   */
  public async getRepositoryTrafficReferrers(
    repoName: string,
    config?: RequestConfig
  ): Promise<ApiResponse<GitHubTrafficReferrers[]>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.REPO_TRAFFIC_REFERRERS(this.username, repoName);
    return this.request<GitHubTrafficReferrers[]>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.TRAFFIC,
      ...config
    });
  }

  /**
   * Get repository traffic popular paths (requires authentication)
   */
  public async getRepositoryTrafficPaths(
    repoName: string,
    config?: RequestConfig
  ): Promise<ApiResponse<GitHubTrafficPaths[]>> {
    const endpoint = GITHUB_CONFIG.ENDPOINTS.REPO_TRAFFIC_PATHS(this.username, repoName);
    return this.request<GitHubTrafficPaths[]>(endpoint, {
      cache: true,
      cacheTTL: GITHUB_CONFIG.CACHE_TTL.TRAFFIC,
      ...config
    });
  }

  /**
   * Get comprehensive repository statistics
   */
  public async getRepositoryStats(config?: RequestConfig): Promise<RepositoryStats> {
    const reposResponse = await this.getUserRepositories(config);
    const repositories = reposResponse.data;

    // Get languages for all repositories in parallel
    const languagePromises = repositories.map(repo => 
      this.getRepositoryLanguages(repo.name, { ...config, retry: false })
        .then(response => ({ repo: repo.name, languages: response.data }))
        .catch(error => {
          console.warn(`Failed to get languages for ${repo.name}:`, error);
          return { repo: repo.name, languages: {} };
        })
    );

    const repoLanguages = await Promise.all(languagePromises);

    // Aggregate language statistics
    const languageMap = new Map<string, { bytes: number; repos: string[] }>();
    let totalBytes = 0;

    repoLanguages.forEach(({ repo, languages }) => {
      Object.entries(languages).forEach(([language, bytes]) => {
        const existing = languageMap.get(language) || { bytes: 0, repos: [] };
        existing.bytes += bytes;
        existing.repos.push(repo);
        languageMap.set(language, existing);
        totalBytes += bytes;
      });
    });

    const languageStats: LanguageStats[] = Array.from(languageMap.entries())
      .map(([language, { bytes, repos }]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
        repos: [...new Set(repos)] // Remove duplicates
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // Calculate repository statistics
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    const mostStarred = repositories.reduce((max, repo) => 
      repo.stargazers_count > (max?.stargazers_count || 0) ? repo : max, 
      null as GitHubRepository | null
    );

    const mostRecent = repositories.reduce((latest, repo) => {
      const repoDate = new Date(repo.created_at);
      const latestDate = latest ? new Date(latest.created_at) : new Date(0);
      return repoDate > latestDate ? repo : latest;
    }, null as GitHubRepository | null);

    return {
      total: repositories.length,
      languages: languageStats,
      totalStars,
      totalForks,
      mostStarred,
      mostRecent
    };
  }

  /**
   * Get comprehensive activity statistics
   */
  public async getActivityStats(config?: RequestConfig): Promise<ActivityStats> {
    const eventsResponse = await this.getUserEvents(config);
    const events = eventsResponse.data;

    // Count event types
    const eventTypes: Record<string, number> = {};
    const commitFrequency: Record<string, number> = {};

    events.forEach(event => {
      // Count event types
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;

      // Track commit frequency by date for PushEvent
      if (event.type === 'PushEvent') {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        commitFrequency[date] = (commitFrequency[date] || 0) + 1;
      }
    });

    return {
      totalEvents: events.length,
      eventTypes,
      recentActivity: events.slice(0, 10), // Last 10 events
      commitFrequency
    };
  }

  /**
   * Get all data needed for portfolio dashboard
   */
  public async getPortfolioDashboardData(config?: RequestConfig): Promise<{
    profile: ApiResponse<GitHubUser>;
    repositories: ApiResponse<GitHubRepository[]>;
    repositoryStats: RepositoryStats;
    activityStats: ActivityStats;
    events: ApiResponse<GitHubEvent[]>;
  }> {
    // Execute all requests in parallel for better performance
    const [profile, repositories, events] = await Promise.all([
      this.getUserProfile(config),
      this.getUserRepositories(config),
      this.getUserEvents(config)
    ]);

    // Get detailed stats (these depend on repositories data)
    const [repositoryStats, activityStats] = await Promise.all([
      this.getRepositoryStats(config),
      this.getActivityStats(config)
    ]);

    return {
      profile,
      repositories,
      repositoryStats,
      activityStats,
      events
    };
  }

  /**
   * Refresh all cached data
   */
  public async refreshAllData(config?: RequestConfig): Promise<void> {
    // Clear cache for user-specific data
    this.clearCache();

    // Warm up cache with fresh data
    await this.getPortfolioDashboardData({
      ...config,
      cache: true
    });
  }

  /**
   * Get repository traffic data (requires authentication)
   */
  public async getRepositoryTrafficData(
    repoName: string,
    config?: RequestConfig
  ): Promise<{
    views: ApiResponse<GitHubTrafficViews>;
    clones: ApiResponse<GitHubTrafficClones>;
    referrers: ApiResponse<GitHubTrafficReferrers[]>;
    paths: ApiResponse<GitHubTrafficPaths[]>;
  } | null> {
    if (!this.isAuthenticated()) {
      console.warn('Authentication required for traffic data');
      return null;
    }

    try {
      const [views, clones, referrers, paths] = await Promise.all([
        this.getRepositoryTrafficViews(repoName, config),
        this.getRepositoryTrafficClones(repoName, config),
        this.getRepositoryTrafficReferrers(repoName, config),
        this.getRepositoryTrafficPaths(repoName, config)
      ]);

      return { views, clones, referrers, paths };
    } catch (error) {
      console.error(`Failed to get traffic data for ${repoName}:`, error);
      return null;
    }
  }

  /**
   * Search repositories with advanced filtering
   */
  public async searchRepositories(
    query: string,
    filters: {
      language?: string;
      minStars?: number;
      maxStars?: number;
      sort?: 'stars' | 'updated' | 'created';
      order?: 'asc' | 'desc';
    } = {},
    config?: RequestConfig
  ): Promise<GitHubRepository[]> {
    const repositories = await this.getUserRepositories(config);
    let filtered = repositories.data;

    // Apply text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
        repo.topics.some(topic => topic.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters.language) {
      filtered = filtered.filter(repo => 
        repo.language && repo.language.toLowerCase() === filters.language.toLowerCase()
      );
    }

    if (filters.minStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count >= filters.minStars!);
    }

    if (filters.maxStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count <= filters.maxStars!);
    }

    // Apply sorting
    if (filters.sort) {
      const order = filters.order === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        let aVal: number | string, bVal: number | string;
        
        switch (filters.sort) {
          case 'stars':
            aVal = a.stargazers_count;
            bVal = b.stargazers_count;
            break;
          case 'updated':
            aVal = new Date(a.updated_at).getTime();
            bVal = new Date(b.updated_at).getTime();
            break;
          case 'created':
            aVal = new Date(a.created_at).getTime();
            bVal = new Date(b.created_at).getTime();
            break;
          default:
            return 0;
        }
        
        return aVal < bVal ? -order : aVal > bVal ? order : 0;
      });
    }

    return filtered;
  }
}

// Export singleton instance
export const gitHubApi = new GitHubApiService();

// Export factory function for custom instances
export const createGitHubApiService = (username?: string, authToken?: string) => {
  return new GitHubApiService(username, authToken);
};