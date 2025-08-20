// GitHub API Service Exports

// Main API service
export { GitHubApiService, gitHubApi, createGitHubApiService } from './github-api';

// Base client
export { GitHubBaseClient } from './base-client';

// React hooks
export {
  useGitHubProfile,
  useGitHubRepositories,
  useGitHubEvents,
  useRepositoryStats,
  useActivityStats,
  useGitHubDashboard,
  useRepositoryLanguages,
  useRepositoryTraffic,
  useRepositorySearch,
  useGitHubAuth,
  useGitHubCache,
  useGitHubErrorHandler
} from './hooks';

// Types
export type {
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
  ApiError,
  RequestConfig,
  RateLimitInfo,
  CacheEntry
} from '../../types/github';

// Utilities
export { cacheService, CacheUtils } from '../../utils/cache';
export { requestDeduplication } from '../../utils/request-deduplication';
export { 
  RetryService, 
  GitHubApiError, 
  ErrorBoundary, 
  ErrorParser 
} from '../../utils/error-handling';

// Configuration
export { GITHUB_CONFIG } from '../../config/github';

// Example usage functions
export const GitHubApiExamples = {
  /**
   * Basic usage example
   */
  async basicUsage() {
    try {
      // Get user profile
      const profile = await gitHubApi.getUserProfile();
      console.log('User:', profile.data.name);

      // Get repositories
      const repos = await gitHubApi.getUserRepositories();
      console.log('Repositories:', repos.data.length);

      // Get recent activity
      const events = await gitHubApi.getUserEvents();
      console.log('Recent events:', events.data.length);

    } catch (error) {
      console.error('API Error:', error);
    }
  },

  /**
   * Dashboard data example
   */
  async dashboardData() {
    try {
      const dashboard = await gitHubApi.getPortfolioDashboardData();
      
      return {
        profile: dashboard.profile.data,
        repositoryCount: dashboard.repositories.data.length,
        totalStars: dashboard.repositoryStats.totalStars,
        topLanguages: dashboard.repositoryStats.languages.slice(0, 5),
        recentActivity: dashboard.activityStats.recentActivity
      };
    } catch (error) {
      console.error('Dashboard Error:', error);
      return null;
    }
  },

  /**
   * Repository search example
   */
  async searchRepositories() {
    try {
      const results = await gitHubApi.searchRepositories('react', {
        language: 'TypeScript',
        minStars: 1,
        sort: 'stars',
        order: 'desc'
      });

      return results.map(repo => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url
      }));
    } catch (error) {
      console.error('Search Error:', error);
      return [];
    }
  },

  /**
   * Authentication example
   */
  async withAuthentication(token: string) {
    try {
      // Set authentication token
      gitHubApi.setAuthToken(token);

      // Now you can access private repositories and traffic data
      const trafficData = await gitHubApi.getRepositoryTrafficData('my-private-repo');
      
      if (trafficData) {
        console.log('Views:', trafficData.views.data.count);
        console.log('Clones:', trafficData.clones.data.count);
      }

    } catch (error) {
      console.error('Auth Error:', error);
    }
  },

  /**
   * Cache management example
   */
  cacheManagement() {
    // Get cache statistics
    const stats = gitHubApi.getCacheStats();
    console.log('Cache entries:', stats.totalEntries);
    console.log('Cache size:', stats.totalSize);

    // Clear cache
    gitHubApi.clearCache();

    // Refresh all data
    gitHubApi.refreshAllData();
  },

  /**
   * Error handling example
   */
  async errorHandling() {
    try {
      await gitHubApi.getUserProfile();
    } catch (error) {
      if (error instanceof GitHubApiError) {
        if (error.isRateLimited()) {
          console.log('Rate limited, waiting...');
        } else if (error.isNotFound()) {
          console.log('User not found');
        } else if (error.isUnauthorized()) {
          console.log('Authentication required');
        }
      }
    }
  }
};