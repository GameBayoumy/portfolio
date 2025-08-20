import type { RateLimitInfo } from '../../types/github.types';

export class RateLimiter {
  private requestQueue: Array<() => void> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private rateLimit: RateLimitInfo | null = null;
  private readonly MIN_REQUEST_INTERVAL = 100; // 100ms minimum between requests
  private readonly SAFETY_BUFFER = 10; // Keep 10 requests as safety buffer

  async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }

  updateRateLimit(rateLimit: RateLimitInfo): void {
    this.rateLimit = rateLimit;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      // Check if we need to wait for rate limit reset
      if (this.rateLimit && this.rateLimit.remaining <= this.SAFETY_BUFFER) {
        const waitTime = this.rateLimit.resetTime.getTime() - Date.now();
        if (waitTime > 0) {
          await this.sleep(waitTime);
          // Reset rate limit after waiting
          this.rateLimit = {
            ...this.rateLimit,
            remaining: this.rateLimit.limit,
            used: 0
          };
        }
      }

      // Enforce minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        await this.sleep(this.MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      }

      const resolve = this.requestQueue.shift()!;
      this.lastRequestTime = Date.now();
      
      // Update remaining count if we have rate limit info
      if (this.rateLimit) {
        this.rateLimit.remaining = Math.max(0, this.rateLimit.remaining - 1);
        this.rateLimit.used += 1;
      }

      resolve();
    }

    this.isProcessing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRemainingRequests(): number {
    return this.rateLimit?.remaining || 5000;
  }

  getResetTime(): Date | null {
    return this.rateLimit?.resetTime || null;
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }
}