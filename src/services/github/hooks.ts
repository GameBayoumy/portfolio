// React Hooks for GitHub API Integration

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GitHubUser,
  GitHubRepository,
  GitHubEvent,
  RepositoryStats,
  ActivityStats,
  ApiResponse,
  RequestConfig
} from '../../types/github';
import { gitHubApi } from './github-api';
import { GitHubApiError } from '../../utils/error-handling';

// Base hook state interface
interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: number | null;
  cached: boolean;
}

// Hook options interface
interface UseApiOptions extends RequestConfig {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Base API hook with common functionality
 */
function useApiHook<T>(
  apiFn: (config?: RequestConfig) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): ApiHookState<T> & {
  refetch: () => Promise<void>;
  clearError: () => void;
} {
  const [state, setState] = useState<ApiHookState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cached: false
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    if (!optionsRef.current.enabled && optionsRef.current.enabled !== undefined) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFn(optionsRef.current);
      
      setState({
        data: response.data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        cached: response.cached
      });

      optionsRef.current.onSuccess?.(response.data);
    } catch (error) {
      const apiError = error instanceof Error ? error : new Error('Unknown error');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));

      optionsRef.current.onError?.(apiError);
    }
  }, [apiFn]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval]);

  return {
    ...state,
    refetch: fetchData,
    clearError
  };
}

/**
 * Hook for user profile data
 */
export function useGitHubProfile(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getUserProfile(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for user repositories
 */
export function useGitHubRepositories(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getUserRepositories(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for user events/activity
 */
export function useGitHubEvents(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getUserEvents(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for repository statistics
 */
export function useRepositoryStats(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getRepositoryStats(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for activity statistics
 */
export function useActivityStats(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getActivityStats(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for complete portfolio dashboard data
 */
export function useGitHubDashboard(options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getPortfolioDashboardData(config), []),
    { enabled: true, ...options }
  );
}

/**
 * Hook for repository languages
 */
export function useRepositoryLanguages(repoName: string, options: UseApiOptions = {}) {
  return useApiHook(
    useCallback((config) => gitHubApi.getRepositoryLanguages(repoName, config), [repoName]),
    { enabled: !!repoName, ...options }
  );
}

/**
 * Hook for repository traffic data (requires authentication)
 */
export function useRepositoryTraffic(repoName: string, options: UseApiOptions = {}) {
  const [state, setState] = useState<{
    data: any | null;
    loading: boolean;
    error: Error | null;
    lastUpdated: number | null;
    authenticated: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    authenticated: gitHubApi.isAuthenticated()
  });

  const fetchTrafficData = useCallback(async () => {
    if (!repoName || (!options.enabled && options.enabled !== undefined)) {
      return;
    }

    if (!gitHubApi.isAuthenticated()) {
      setState(prev => ({
        ...prev,
        error: new Error('Authentication required for traffic data'),
        authenticated: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await gitHubApi.getRepositoryTrafficData(repoName, options);
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        authenticated: true
      });

      options.onSuccess?.(data);
    } catch (error) {
      const apiError = error instanceof Error ? error : new Error('Unknown error');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));

      options.onError?.(apiError);
    }
  }, [repoName, options]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  return {
    ...state,
    refetch: fetchTrafficData,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}

/**
 * Hook for repository search with filters
 */
export function useRepositorySearch(
  query: string,
  filters: Parameters<typeof gitHubApi.searchRepositories>[1] = {},
  options: UseApiOptions = {}
) {
  return useApiHook(
    useCallback(
      (config) => gitHubApi.searchRepositories(query, filters, config),
      [query, JSON.stringify(filters)]
    ),
    { enabled: true, ...options }
  );
}

/**
 * Hook for managing authentication state
 */
export function useGitHubAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(gitHubApi.isAuthenticated());
  const [rateLimitInfo, setRateLimitInfo] = useState(gitHubApi.getRateLimitInfo());

  const setAuthToken = useCallback((token: string) => {
    gitHubApi.setAuthToken(token);
    setIsAuthenticated(true);
  }, []);

  const clearAuthToken = useCallback(() => {
    gitHubApi.clearAuthToken();
    setIsAuthenticated(false);
  }, []);

  const refreshRateLimit = useCallback(() => {
    setRateLimitInfo(gitHubApi.getRateLimitInfo());
  }, []);

  return {
    isAuthenticated,
    rateLimitInfo,
    setAuthToken,
    clearAuthToken,
    refreshRateLimit
  };
}

/**
 * Hook for cache management
 */
export function useGitHubCache() {
  const [cacheStats, setCacheStats] = useState(gitHubApi.getCacheStats());
  const [pendingRequests, setPendingRequests] = useState(gitHubApi.getPendingRequests());

  const refreshStats = useCallback(() => {
    setCacheStats(gitHubApi.getCacheStats());
    setPendingRequests(gitHubApi.getPendingRequests());
  }, []);

  const clearCache = useCallback(() => {
    gitHubApi.clearCache();
    refreshStats();
  }, [refreshStats]);

  const refreshAllData = useCallback(async () => {
    await gitHubApi.refreshAllData();
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    cacheStats,
    pendingRequests,
    clearCache,
    refreshAllData,
    refreshStats
  };
}

/**
 * Hook for error boundary integration
 */
export function useGitHubErrorHandler() {
  const [errors, setErrors] = useState<Error[]>([]);

  const addError = useCallback((error: Error) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const removeError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const isRateLimited = useCallback((error: Error) => {
    return error instanceof GitHubApiError && error.isRateLimited();
  }, []);

  const isUnauthorized = useCallback((error: Error) => {
    return error instanceof GitHubApiError && error.isUnauthorized();
  }, []);

  const isNotFound = useCallback((error: Error) => {
    return error instanceof GitHubApiError && error.isNotFound();
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    isRateLimited,
    isUnauthorized,
    isNotFound
  };
}