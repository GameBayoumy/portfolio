import type { CacheEntry, CacheOptions } from '../../types/github.types';

export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly MAX_MEMORY_ENTRIES = 1000;
  private readonly CACHE_PREFIX = 'github_cache_';

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(key)) {
      return memoryEntry.data;
    }

    // Try localStorage for persistent cache
    try {
      const stored = localStorage.getItem(this.CACHE_PREFIX + key);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - entry.timestamp < entry.ttl) {
          // Restore to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(this.CACHE_PREFIX + key);
        }
      }
    } catch (error) {
      // LocalStorage not available or quota exceeded
      console.warn('Cache storage error:', error);
    }

    return null;
  }

  async getCacheEntry<T>(key: string): Promise<CacheEntry<T> | null> {
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      return memoryEntry;
    }

    try {
      const stored = localStorage.getItem(this.CACHE_PREFIX + key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
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
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      // Storage quota exceeded or not available
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldestEntries();
        try {
          localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
        } catch {
          // Still failing, continue without persistence
          console.warn('Unable to persist cache entry:', key);
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
          try {
            localStorage.removeItem(this.CACHE_PREFIX + key);
          } catch {
            // Ignore localStorage errors
          }
        }
      }
    } else {
      // Clear all cache
      this.memoryCache.clear();
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith(this.CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  getSize(): { memory: number; storage: number } {
    let storageCount = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          storageCount++;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    return {
      memory: this.memoryCache.size,
      storage: storageCount
    };
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

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
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
      toRemove.forEach(([key]) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
      });
    } catch {
      // Ignore localStorage errors
    }
  }
}