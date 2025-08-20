// Request Deduplication Service

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestDeduplicationService {
  private static instance: RequestDeduplicationService;
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private requestTimeouts = new Map<string, NodeJS.Timeout>();

  private constructor() {}

  public static getInstance(): RequestDeduplicationService {
    if (!RequestDeduplicationService.instance) {
      RequestDeduplicationService.instance = new RequestDeduplicationService();
    }
    return RequestDeduplicationService.instance;
  }

  /**
   * Execute request with deduplication
   * If same request is already in flight, return the existing promise
   */
  public async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`Request deduplication: Reusing pending request for ${key}`);
      return pending.promise;
    }

    // Create new request
    const promise = this.createRequest(key, requestFn, timeoutMs);
    
    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    // Set cleanup timeout
    const timeout = setTimeout(() => {
      this.cleanup(key);
    }, timeoutMs);
    
    this.requestTimeouts.set(key, timeout);

    try {
      const result = await promise;
      this.cleanup(key);
      return result;
    } catch (error) {
      this.cleanup(key);
      throw error;
    }
  }

  /**
   * Create request with error handling
   */
  private async createRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms: ${key}`));
      }, timeoutMs);

      requestFn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Generate request key from URL and params
   */
  public generateKey(url: string, params?: Record<string, any>): string {
    const baseKey = url;
    if (params && Object.keys(params).length > 0) {
      const paramString = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      return `${baseKey}?${paramString}`;
    }
    return baseKey;
  }

  /**
   * Check if request is pending
   */
  public isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Get pending requests count
   */
  public getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Get all pending request keys
   */
  public getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * Cancel specific request
   */
  public cancel(key: string): boolean {
    const timeout = this.requestTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.requestTimeouts.delete(key);
    }
    
    return this.pendingRequests.delete(key);
  }

  /**
   * Cancel all pending requests
   */
  public cancelAll(): void {
    // Clear all timeouts
    this.requestTimeouts.forEach(timeout => clearTimeout(timeout));
    this.requestTimeouts.clear();
    
    // Clear all pending requests
    this.pendingRequests.clear();
  }

  /**
   * Cleanup completed/failed request
   */
  private cleanup(key: string): void {
    this.pendingRequests.delete(key);
    
    const timeout = this.requestTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.requestTimeouts.delete(key);
    }
  }

  /**
   * Cleanup stale requests (older than threshold)
   */
  public cleanupStale(maxAgeMs: number = 60000): number {
    const now = Date.now();
    let cleaned = 0;

    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > maxAgeMs) {
        this.cancel(key);
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * Get request statistics
   */
  public getStats(): {
    pendingCount: number;
    oldestRequestAge: number;
    averageRequestAge: number;
  } {
    const now = Date.now();
    const requests = Array.from(this.pendingRequests.values());
    
    if (requests.length === 0) {
      return {
        pendingCount: 0,
        oldestRequestAge: 0,
        averageRequestAge: 0
      };
    }

    const ages = requests.map(req => now - req.timestamp);
    const oldestRequestAge = Math.max(...ages);
    const averageRequestAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    return {
      pendingCount: requests.length,
      oldestRequestAge,
      averageRequestAge
    };
  }
}

// Singleton instance
export const requestDeduplication = RequestDeduplicationService.getInstance();