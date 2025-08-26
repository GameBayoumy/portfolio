/**
 * Comprehensive Performance Management System
 * Handles device detection, performance monitoring, and adaptive optimization
 */

import * as THREE from 'three';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  cpuTime: number;
  gpuTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  timestamp: number;
}

export interface DeviceProfile {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  gpu: 'integrated' | 'discrete' | 'unknown';
  tier: 'low' | 'medium' | 'high' | 'ultra';
  memory: number; // in MB
  cores: number;
  webgl2: boolean;
  maxTextureSize: number;
}

export interface PerformanceSettings {
  targetFps: number;
  pixelRatio: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  antialias: boolean;
  postprocessing: boolean;
  particleCount: number;
  lodEnabled: boolean;
  cullingEnabled: boolean;
  maxDrawCalls: number;
}

// Performance tier configurations
export const PERFORMANCE_TIERS: Record<string, PerformanceSettings> = {
  low: {
    targetFps: 30,
    pixelRatio: 1.0,
    shadowsEnabled: false,
    shadowMapSize: 256,
    antialias: false,
    postprocessing: false,
    particleCount: 50,
    lodEnabled: true,
    cullingEnabled: true,
    maxDrawCalls: 100
  },
  medium: {
    targetFps: 45,
    pixelRatio: Math.min(window?.devicePixelRatio || 1, 1.5),
    shadowsEnabled: true,
    shadowMapSize: 512,
    antialias: false,
    postprocessing: true,
    particleCount: 200,
    lodEnabled: true,
    cullingEnabled: true,
    maxDrawCalls: 200
  },
  high: {
    targetFps: 60,
    pixelRatio: Math.min(window?.devicePixelRatio || 1, 2),
    shadowsEnabled: true,
    shadowMapSize: 1024,
    antialias: true,
    postprocessing: true,
    particleCount: 500,
    lodEnabled: false,
    cullingEnabled: true,
    maxDrawCalls: 400
  },
  ultra: {
    targetFps: 60,
    pixelRatio: window?.devicePixelRatio || 1,
    shadowsEnabled: true,
    shadowMapSize: 2048,
    antialias: true,
    postprocessing: true,
    particleCount: 1000,
    lodEnabled: false,
    cullingEnabled: false,
    maxDrawCalls: 800
  }
};

export class DeviceProfiler {
  private static instance: DeviceProfiler;
  private profile: DeviceProfile | null = null;

  static getInstance(): DeviceProfiler {
    if (!DeviceProfiler.instance) {
      DeviceProfiler.instance = new DeviceProfiler();
    }
    return DeviceProfiler.instance;
  }

  async getProfile(): Promise<DeviceProfile> {
    if (this.profile) return this.profile;
    
    this.profile = await this.detectProfile();
    return this.profile;
  }

  private async detectProfile(): Promise<DeviceProfile> {
    const userAgent = navigator.userAgent;
    
    // Device type detection
    const type = this.detectDeviceType(userAgent);
    const os = this.detectOS(userAgent);
    
    // Hardware capabilities
    const cores = navigator.hardwareConcurrency || 4;
    const memory = this.getMemoryInfo();
    
    // WebGL capabilities
    const { webgl2, maxTextureSize, gpu } = this.detectWebGLCapabilities();
    
    // Performance tier calculation
    const tier = this.calculateTier(type, cores, memory, gpu);
    
    return {
      type,
      os,
      gpu,
      tier,
      memory,
      cores,
      webgl2,
      maxTextureSize
    };
  }

  private detectDeviceType(userAgent: string): DeviceProfile['type'] {
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'mobile';
    if (/Android/.test(userAgent)) {
      return /Mobile/.test(userAgent) ? 'mobile' : 'tablet';
    }
    if (/Windows Phone/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectOS(userAgent: string): DeviceProfile['os'] {
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if (/Windows/.test(userAgent)) return 'windows';
    if (/Mac OS X/.test(userAgent)) return 'macos';
    if (/Linux/.test(userAgent)) return 'linux';
    return 'unknown';
  }

  private getMemoryInfo(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return Math.round(memInfo.totalJSHeapSize / (1024 * 1024));
    }
    // Estimate based on device type
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 2048;
    if (/Android/.test(userAgent)) return 3072;
    return 4096; // Desktop default
  }

  private detectWebGLCapabilities(): { 
    webgl2: boolean; 
    maxTextureSize: number; 
    gpu: DeviceProfile['gpu'];
  } {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    const gl = gl2 || canvas.getContext('webgl');
    
    if (!gl) {
      return { webgl2: false, maxTextureSize: 0, gpu: 'unknown' };
    }

    const webgl2 = !!gl2;
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    
    // GPU detection
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
      : '';
    
    let gpu: DeviceProfile['gpu'] = 'unknown';
    if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon')) {
      gpu = 'discrete';
    } else if (renderer.includes('intel') || renderer.includes('integrated')) {
      gpu = 'integrated';
    }

    canvas.remove();
    return { webgl2, maxTextureSize, gpu };
  }

  private calculateTier(
    type: DeviceProfile['type'],
    cores: number,
    memory: number,
    gpu: DeviceProfile['gpu']
  ): DeviceProfile['tier'] {
    let score = 0;

    // Device type scoring
    if (type === 'desktop') score += 40;
    else if (type === 'tablet') score += 20;
    else score += 10;

    // CPU scoring
    if (cores >= 8) score += 30;
    else if (cores >= 4) score += 20;
    else score += 10;

    // Memory scoring
    if (memory >= 8192) score += 20;
    else if (memory >= 4096) score += 15;
    else if (memory >= 2048) score += 10;
    else score += 5;

    // GPU scoring
    if (gpu === 'discrete') score += 20;
    else if (gpu === 'integrated') score += 10;
    else score += 5;

    // Tier determination
    if (score >= 90) return 'ultra';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxSamples = 60; // 1 second at 60fps
  private lastTime = 0;
  private frameCount = 0;
  
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];

  addObserver(callback: (metrics: PerformanceMetrics) => void): void {
    this.observers.push(callback);
  }

  removeObserver(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  update(renderer?: THREE.WebGLRenderer): PerformanceMetrics {
    const now = performance.now();
    const frameTime = this.lastTime > 0 ? now - this.lastTime : 16.67;
    
    const metrics: PerformanceMetrics = {
      fps: 1000 / frameTime,
      frameTime,
      cpuTime: this.getCPUTime(),
      gpuTime: this.getGPUTime(),
      memoryUsage: this.getMemoryUsage(),
      drawCalls: renderer ? renderer.info.render.calls : 0,
      triangles: renderer ? renderer.info.render.triangles : 0,
      timestamp: now
    };

    this.metrics.push(metrics);
    if (this.metrics.length > this.maxSamples) {
      this.metrics.shift();
    }

    this.lastTime = now;
    this.frameCount++;

    // Notify observers
    this.observers.forEach(callback => callback(metrics));

    return metrics;
  }

  getAverageMetrics(samples: number = 30): PerformanceMetrics | null {
    if (this.metrics.length < samples) return null;

    const recentMetrics = this.metrics.slice(-samples);
    const avg = recentMetrics.reduce(
      (sum, metric) => ({
        fps: sum.fps + metric.fps,
        frameTime: sum.frameTime + metric.frameTime,
        cpuTime: sum.cpuTime + metric.cpuTime,
        gpuTime: sum.gpuTime + metric.gpuTime,
        memoryUsage: sum.memoryUsage + metric.memoryUsage,
        drawCalls: sum.drawCalls + metric.drawCalls,
        triangles: sum.triangles + metric.triangles,
        timestamp: metric.timestamp
      }),
      { fps: 0, frameTime: 0, cpuTime: 0, gpuTime: 0, memoryUsage: 0, drawCalls: 0, triangles: 0, timestamp: 0 }
    );

    const count = recentMetrics.length;
    return {
      fps: avg.fps / count,
      frameTime: avg.frameTime / count,
      cpuTime: avg.cpuTime / count,
      gpuTime: avg.gpuTime / count,
      memoryUsage: avg.memoryUsage / count,
      drawCalls: avg.drawCalls / count,
      triangles: avg.triangles / count,
      timestamp: avg.timestamp
    };
  }

  private getCPUTime(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  private getGPUTime(): number {
    // GPU timing is complex and requires WebGL extensions
    // For now, return 0 as a placeholder
    return 0;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize;
    }
    return 0;
  }
}

export class AdaptivePerformanceManager {
  private profiler: DeviceProfiler;
  private monitor: PerformanceMonitor;
  private currentSettings: PerformanceSettings;
  private lastAdjustment = 0;
  private adjustmentCooldown = 2000; // 2 seconds

  constructor() {
    this.profiler = DeviceProfiler.getInstance();
    this.monitor = new PerformanceMonitor();
    this.currentSettings = PERFORMANCE_TIERS.medium; // Default
    
    this.monitor.addObserver(this.handlePerformanceUpdate.bind(this));
  }

  async initialize(): Promise<PerformanceSettings> {
    const profile = await this.profiler.getProfile();
    this.currentSettings = PERFORMANCE_TIERS[profile.tier];
    
    console.log('🎮 Performance Profile:', profile);
    console.log('🎮 Initial Settings:', this.currentSettings);
    
    return this.currentSettings;
  }

  update(renderer?: THREE.WebGLRenderer): PerformanceMetrics {
    return this.monitor.update(renderer);
  }

  getCurrentSettings(): PerformanceSettings {
    return { ...this.currentSettings };
  }

  private handlePerformanceUpdate(metrics: PerformanceMetrics): void {
    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentCooldown) return;

    const avgMetrics = this.monitor.getAverageMetrics();
    if (!avgMetrics) return;

    const targetFps = this.currentSettings.targetFps;
    const currentFps = avgMetrics.fps;
    
    // Performance adjustment logic
    if (currentFps < targetFps * 0.8) {
      // Performance is poor, reduce settings
      this.adjustSettingsDown();
      this.lastAdjustment = now;
    } else if (currentFps > targetFps * 1.1) {
      // Performance is good, maybe increase settings
      this.adjustSettingsUp();
      this.lastAdjustment = now;
    }
  }

  private adjustSettingsDown(): void {
    const settings = { ...this.currentSettings };
    let adjusted = false;

    // Priority order for reducing performance impact
    if (settings.postprocessing) {
      settings.postprocessing = false;
      adjusted = true;
    } else if (settings.antialias) {
      settings.antialias = false;
      adjusted = true;
    } else if (settings.shadowsEnabled) {
      settings.shadowsEnabled = false;
      adjusted = true;
    } else if (settings.pixelRatio > 1) {
      settings.pixelRatio = Math.max(1, settings.pixelRatio - 0.25);
      adjusted = true;
    } else if (settings.particleCount > 50) {
      settings.particleCount = Math.max(50, settings.particleCount * 0.75);
      adjusted = true;
    }

    if (adjusted) {
      this.currentSettings = settings;
      console.log('🎮 Performance: Reduced settings', settings);
    }
  }

  private adjustSettingsUp(): void {
    const settings = { ...this.currentSettings };
    let adjusted = false;

    // Conservative approach to increasing settings
    if (settings.pixelRatio < window.devicePixelRatio) {
      settings.pixelRatio = Math.min(window.devicePixelRatio, settings.pixelRatio + 0.25);
      adjusted = true;
    } else if (!settings.shadowsEnabled) {
      settings.shadowsEnabled = true;
      adjusted = true;
    } else if (!settings.antialias) {
      settings.antialias = true;
      adjusted = true;
    } else if (!settings.postprocessing && settings.particleCount < 200) {
      settings.postprocessing = true;
      adjusted = true;
    }

    if (adjusted) {
      this.currentSettings = settings;
      console.log('🎮 Performance: Increased settings', settings);
    }
  }

  // Manual performance adjustment methods
  setPerformanceTier(tier: keyof typeof PERFORMANCE_TIERS): void {
    this.currentSettings = { ...PERFORMANCE_TIERS[tier] };
    console.log(`🎮 Performance: Manual tier set to ${tier}`, this.currentSettings);
  }

  getPerformanceReport(): {
    profile: DeviceProfile | null;
    currentSettings: PerformanceSettings;
    averageMetrics: PerformanceMetrics | null;
    recommendations: string[];
  } {
    const avgMetrics = this.monitor.getAverageMetrics();
    const recommendations: string[] = [];

    if (avgMetrics) {
      if (avgMetrics.fps < this.currentSettings.targetFps * 0.9) {
        recommendations.push('Consider reducing visual quality for better performance');
      }
      if (avgMetrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
        recommendations.push('High memory usage detected - consider reducing particle count');
      }
      if (avgMetrics.drawCalls > this.currentSettings.maxDrawCalls) {
        recommendations.push('High draw call count - consider enabling object culling');
      }
    }

    return {
      profile: this.profiler['profile'],
      currentSettings: this.currentSettings,
      averageMetrics,
      recommendations
    };
  }
}

// Singleton instance
export const performanceManager = new AdaptivePerformanceManager();