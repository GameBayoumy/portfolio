// Base GitHub API Client with Rate Limiting and Error Handling

import type { 
  ApiResponse, 
  ApiError, 
  RequestConfig, 
  RateLimitInfo 
} from '../../types/github';
import { GITHUB_CONFIG } from '../../config/github';
import { cacheService, CacheUtils } from '../../utils/cache';
import { requestDeduplication } from '../../utils/request-deduplication';
import { RetryService, GitHubApiError, ErrorParser } from '../../utils/error-handling';

export class GitHubBaseClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(authToken?: string) {
    this.baseURL = GITHUB_CONFIG.API_BASE_URL;
    this.headers = {
      ...GITHUB_CONFIG.HEADERS,
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    };
  }

  /**
   * Make HTTP request with full error handling, caching, and deduplication
   */
  public async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = requestDeduplication.generateKey(url, config);
    
    // Check cache first
    if (config.cache !== false) {
      const cached = this.getCachedResponse<T>(requestKey);
      if (cached) {
        return cached;
      }
    }

    // Execute request with deduplication
    return requestDeduplication.execute(
      requestKey,
      () => this.executeRequest<T>(url, config),
      config.timeout || GITHUB_CONFIG.REQUEST.TIMEOUT
    );
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    url: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const shouldRetry = config.retry !== false;
    
    const requestFn = async (): Promise<ApiResponse<T>> => {
      // Check rate limit before making request
      await this.checkRateLimit();

      const response = await this.fetchWithTimeout(url, config);
      
      // Update rate limit info from response headers
      this.updateRateLimitInfo(response);

      // Handle non-200 responses
      if (!response.ok) {
        const error = await ErrorParser.parseResponse(response);
        throw new GitHubApiError(error);
      }

      // Parse response
      const data = await response.json();
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        headers: this.extractHeaders(response),
        cached: false,
        timestamp: Date.now()
      };

      // Cache successful responses
      if (config.cache !== false && CacheUtils.shouldCache(response.status)) {
        this.cacheResponse(url, apiResponse, config.cacheTTL);
      }

      return apiResponse;
    };

    if (shouldRetry) {
      return RetryService.execute(requestFn, {
        maxRetries: config.maxRetries || GITHUB_CONFIG.REQUEST.MAX_RETRIES
      });
    } else {
      return requestFn();
    }
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const timeout = config.timeout || GITHUB_CONFIG.REQUEST.TIMEOUT;
    const controller = new AbortController();
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GitHubApiError(ErrorParser.parseTimeoutError());
      }
      
      throw new GitHubApiError(ErrorParser.parseNetworkError(error as Error));
    }
  }

  /**
   * Check rate limit before making request
   */
  private async checkRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) {
      return; // No rate limit info available yet
    }

    const { remaining, reset } = this.rateLimitInfo;
    
    if (remaining <= 0) {
      const resetTime = new Date(reset * 1000);
      const waitTime = resetTime.getTime() - Date.now();
      
      if (waitTime > 0) {
        console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    const used = response.headers.get('x-ratelimit-used');

    if (limit && remaining && reset && used) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        used: parseInt(used, 10)
      };

      // Store in localStorage for persistence
      try {
        localStorage.setItem(
          GITHUB_CONFIG.STORAGE_KEYS.RATE_LIMIT,
          JSON.stringify(this.rateLimitInfo)
        );
      } catch (error) {
        console.warn('Failed to store rate limit info:', error);
      }
    }
  }

  /**
   * Get rate limit information
   */
  public getRateLimitInfo(): RateLimitInfo | null {
    if (!this.rateLimitInfo) {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(GITHUB_CONFIG.STORAGE_KEYS.RATE_LIMIT);
        if (stored) {
          this.rateLimitInfo = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load rate limit info:', error);
      }
    }
    
    return this.rateLimitInfo;
  }

  /**
   * Get cached response
   */
  private getCachedResponse<T>(requestKey: string): ApiResponse<T> | null {
    const cached = cacheService.get<ApiResponse<T>>(requestKey);
    if (cached) {
      return {
        ...cached,
        cached: true
      };
    }
    return null;
  }

  /**
   * Cache API response
   */
  private cacheResponse<T>(
    url: string,
    response: ApiResponse<T>,
    customTTL?: number
  ): void {
    const cacheKey = CacheUtils.generateKey(url);
    const ttl = customTTL || CacheUtils.getTTL(url);
    
    cacheService.set(cacheKey, response, ttl);
  }

  /**
   * Extract relevant headers from response
   */
  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Extract important headers
    const importantHeaders = [
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-used',
      'etag',
      'last-modified',
      'cache-control'
    ];

    importantHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    return headers;
  }

  /**
   * Update authentication token
   */
  public setAuthToken(token: string): void {
    this.headers.Authorization = `Bearer ${token}`;
    
    // Store in localStorage
    try {
      localStorage.setItem(GITHUB_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.warn('Failed to store auth token:', error);
    }
  }

  /**
   * Remove authentication token
   */
  public clearAuthToken(): void {
    delete this.headers.Authorization;
    
    // Remove from localStorage
    try {
      localStorage.removeItem(GITHUB_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  }

  /**
   * Get current authentication status
   */
  public isAuthenticated(): boolean {
    return 'Authorization' in this.headers;
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    cacheService.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Get pending requests information
   */
  public getPendingRequests() {
    return requestDeduplication.getStats();
  }
}