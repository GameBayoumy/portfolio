// Advanced Caching Service with TTL and Cleanup

import type { CacheEntry } from '../types/github';

export class CacheService {
  private static instance: CacheService;
  private storage: Storage;
  private keyPrefix: string;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(storage: Storage = localStorage, keyPrefix: string = 'github_cache_') {
    this.storage = storage;
    this.keyPrefix = keyPrefix;
    this.startCleanupInterval();
  }

  public static getInstance(storage?: Storage, keyPrefix?: string): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(storage, keyPrefix);
    }
    return CacheService.instance;
  }

  /**
   * Set cache entry with TTL
   */
  public set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      this.storage.setItem(
        this.getStorageKey(key),
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn('Cache storage failed:', error);
      // Try to free up space by clearing expired entries
      this.cleanup();
      try {
        this.storage.setItem(
          this.getStorageKey(key),
          JSON.stringify(entry)
        );
      } catch (retryError) {
        console.error('Cache storage failed after cleanup:', retryError);
      }
    }
  }

  /**
   * Get cache entry if not expired
   */
  public get<T>(key: string): T | null {
    try {
      const stored = this.storage.getItem(this.getStorageKey(key));
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      this.delete(key);
      return null;
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache entry
   */
  public delete(key: string): void {
    try {
      this.storage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.warn('Cache deletion failed:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.keyPrefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    totalEntries: number;
    totalSize: number;
    expiredEntries: number;
  } {
    let totalEntries = 0;
    let totalSize = 0;
    let expiredEntries = 0;

    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(this.keyPrefix)) {
          totalEntries++;
          const value = this.storage.getItem(key);
          if (value) {
            totalSize += value.length;
            
            try {
              const entry = JSON.parse(value);
              if (now - entry.timestamp > entry.ttl) {
                expiredEntries++;
              }
            } catch {
              expiredEntries++;
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cache stats failed:', error);
    }

    return { totalEntries, totalSize, expiredEntries };
  }

  /**
   * Cleanup expired entries
   */
  public cleanup(): number {
    let cleaned = 0;
    
    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(this.keyPrefix)) {
          const value = this.storage.getItem(key);
          if (value) {
            try {
              const entry = JSON.parse(value);
              if (now - entry.timestamp > entry.ttl) {
                this.storage.removeItem(key);
                cleaned++;
              }
            } catch {
              // Invalid JSON, remove it
              this.storage.removeItem(key);
              cleaned++;
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }

    return cleaned;
  }

  /**
   * Get cache key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const cacheService = CacheService.getInstance();

// Cache utilities
export const CacheUtils = {
  /**
   * Generate cache key from URL and params
   */
  generateKey: (url: string, params?: Record<string, any>): string => {
    const baseKey = url.replace(/[^a-zA-Z0-9]/g, '_');
    if (params && Object.keys(params).length > 0) {
      const paramString = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      return `${baseKey}_${btoa(paramString)}`;
    }
    return baseKey;
  },

  /**
   * Check if data should be cached based on response
   */
  shouldCache: (status: number): boolean => {
    return status >= 200 && status < 300;
  },

  /**
   * Get TTL based on endpoint type
   */
  getTTL: (endpoint: string): number => {
    if (endpoint.includes('/users/')) return 15 * 60 * 1000; // 15 minutes
    if (endpoint.includes('/repos/') && endpoint.includes('/languages')) return 60 * 60 * 1000; // 1 hour
    if (endpoint.includes('/events')) return 5 * 60 * 1000; // 5 minutes
    if (endpoint.includes('/traffic/')) return 10 * 60 * 1000; // 10 minutes
    return 30 * 60 * 1000; // Default 30 minutes
  }
};