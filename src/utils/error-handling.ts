// Advanced Error Handling and Retry Logic

import type { ApiError } from '../types/github';
import { GITHUB_CONFIG } from '../config/github';

export class GitHubApiError extends Error {
  public status: number;
  public code?: string;
  public documentation_url?: string;
  public errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'GitHubApiError';
    this.status = error.status;
    this.code = error.code;
    this.documentation_url = error.documentation_url;
    this.errors = error.errors;
  }

  public isRateLimited(): boolean {
    return this.status === 403 && this.message.toLowerCase().includes('rate limit');
  }

  public isNotFound(): boolean {
    return this.status === 404;
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isServerError(): boolean {
    return this.status >= 500;
  }

  public isRetryable(): boolean {
    return GITHUB_CONFIG.RETRYABLE_STATUS_CODES.includes(this.status);
  }
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class RetryService {
  private static defaultConfig: RetryConfig = {
    maxRetries: GITHUB_CONFIG.REQUEST.MAX_RETRIES,
    baseDelay: GITHUB_CONFIG.REQUEST.RETRY_DELAY,
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: GITHUB_CONFIG.REQUEST.RETRY_BACKOFF,
    jitter: true
  };

  /**
   * Execute function with retry logic
   */
  public static async execute<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultConfig, ...config };
    let lastError: Error;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (error instanceof GitHubApiError && !error.isRetryable()) {
          throw error;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, retryConfig);
        
        console.warn(
          `Request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}), ` +
          `retrying in ${delay}ms:`,
          error instanceof Error ? error.message : error
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    const clampedDelay = Math.min(exponentialDelay, config.maxDelay);

    if (config.jitter) {
      // Add random jitter (±25%)
      const jitterAmount = clampedDelay * 0.25;
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
      return Math.max(0, clampedDelay + jitter);
    }

    return clampedDelay;
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ErrorBoundary {
  private static errorHandlers: Map<string, (error: Error) => void> = new Map();

  /**
   * Register error handler for specific error types
   */
  public static registerHandler(errorType: string, handler: (error: Error) => void): void {
    this.errorHandlers.set(errorType, handler);
  }

  /**
   * Handle error with registered handlers
   */
  public static handle(error: Error): void {
    const errorType = error.constructor.name;
    const handler = this.errorHandlers.get(errorType);

    if (handler) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }

    // Default error logging
    this.logError(error);
  }

  /**
   * Log error with context
   */
  private static logError(error: Error): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (error instanceof GitHubApiError) {
      Object.assign(errorInfo, {
        status: error.status,
        code: error.code,
        documentation_url: error.documentation_url,
        errors: error.errors
      });
    }

    console.error('GitHub API Error:', errorInfo);
  }
}

// Error response parser
export const ErrorParser = {
  /**
   * Parse fetch response into ApiError
   */
  async parseResponse(response: Response): Promise<ApiError> {
    let errorData: any = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'Failed to parse error response' };
    }

    return {
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      code: errorData.code,
      documentation_url: errorData.documentation_url,
      errors: errorData.errors
    };
  },

  /**
   * Parse network error
   */
  parseNetworkError(error: Error): ApiError {
    return {
      message: `Network error: ${error.message}`,
      status: 0
    };
  },

  /**
   * Parse timeout error
   */
  parseTimeoutError(): ApiError {
    return {
      message: 'Request timeout',
      status: 408
    };
  }
};

// Default error handlers
ErrorBoundary.registerHandler('GitHubApiError', (error) => {
  const gitHubError = error as GitHubApiError;
  
  if (gitHubError.isRateLimited()) {
    console.warn('GitHub API rate limit exceeded. Consider implementing authentication for higher limits.');
  } else if (gitHubError.isNotFound()) {
    console.warn('GitHub resource not found. Check if the repository/user exists and is public.');
  } else if (gitHubError.isUnauthorized()) {
    console.warn('GitHub API authentication required. Some endpoints may not be accessible.');
  }
});