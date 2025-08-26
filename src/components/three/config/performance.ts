import * as THREE from 'three';
import { 
  PerformanceLevel, 
  PerformanceSettings,
  ResponsiveConfig,
  DeviceCapabilities,
} from '@/types/visualizer';
import {
  AdaptiveQualitySettings,
  MemoryManagementConfig,
} from '../types/performance';
import { 
  PERFORMANCE_PRESETS,
  PERFORMANCE_THRESHOLDS,
  GPU_TIER_MAPPING,
  DEFAULT_ADAPTIVE_SETTINGS,
  DEFAULT_MEMORY_CONFIG
} from '../types/performance';

// Device capability detection
export class DeviceCapabilityDetector {
  private static instance: DeviceCapabilityDetector;
  private capabilities: DeviceCapabilities | null = null;

  static getInstance(): DeviceCapabilityDetector {
    if (!DeviceCapabilityDetector.instance) {
      DeviceCapabilityDetector.instance = new DeviceCapabilityDetector();
    }
    return DeviceCapabilityDetector.instance;
  }

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      this.capabilities = {
        webgl: false,
        webgl2: false,
        extensions: [],
        maxTextureSize: 0,
        maxCubeMapTextureSize: 0,
        maxVertexUniforms: 0,
        maxFragmentUniforms: 0,
        maxVaryingVectors: 0,
        maxTextureUnits: 0,
        maxVertexTextureImageUnits: 0,
        supportsFloatTextures: false,
        supportsHalfFloatTextures: false,
        supportsVertexArrayObjects: false,
        supportsInstancedArrays: false,
        mobile: this.isMobileDevice(),
        touch: this.isTouchDevice(),
        orientation: this.getOrientation(),
        devicePixelRatio: window.devicePixelRatio || 1,
        vendor: 'unknown',
        renderer: 'unknown',
      };
      return this.capabilities;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const extensions = gl.getSupportedExtensions() || [];

    this.capabilities = {
      webgl: true,
      webgl2: gl instanceof WebGL2RenderingContext,
      webgpu: 'gpu' in navigator,
      extensions,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      supportsFloatTextures: extensions.includes('OES_texture_float'),
      supportsHalfFloatTextures: extensions.includes('OES_texture_half_float'),
      supportsVertexArrayObjects: extensions.includes('OES_vertex_array_object') || gl instanceof WebGL2RenderingContext,
      supportsInstancedArrays: extensions.includes('ANGLE_instanced_arrays') || gl instanceof WebGL2RenderingContext,
      mobile: this.isMobileDevice(),
      touch: this.isTouchDevice(),
      orientation: this.getOrientation(),
      devicePixelRatio: window.devicePixelRatio || 1,
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
    };

    canvas.remove();
    return this.capabilities;
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
}

// Performance tier detection
export class PerformanceTierDetector {
  private static instance: PerformanceTierDetector;
  
  static getInstance(): PerformanceTierDetector {
    if (!PerformanceTierDetector.instance) {
      PerformanceTierDetector.instance = new PerformanceTierDetector();
    }
    return PerformanceTierDetector.instance;
  }

  async detectPerformanceTier(): Promise<PerformanceLevel> {
    const capabilities = await DeviceCapabilityDetector.getInstance().detectCapabilities();
    
    let score = 0;
    const factors: Array<{ weight: number; score: number; reason: string }> = [];

    // GPU assessment
    const gpuTier = this.assessGPU(capabilities.renderer);
    factors.push({
      weight: 0.4,
      score: this.gpuTierToScore(gpuTier),
      reason: `GPU: ${capabilities.renderer} (${gpuTier})`
    });

    // Memory assessment  
    const memoryScore = this.assessMemory();
    factors.push({
      weight: 0.2,
      score: memoryScore,
      reason: `Memory: ${this.getMemoryInfo()}`
    });

    // WebGL capabilities assessment
    const webglScore = this.assessWebGLCapabilities(capabilities);
    factors.push({
      weight: 0.2,
      score: webglScore,
      reason: `WebGL features: ${capabilities.webgl2 ? 'WebGL2' : 'WebGL1'}`
    });

    // Device type assessment
    const deviceScore = capabilities.mobile ? 30 : 80;
    factors.push({
      weight: 0.1,
      score: deviceScore,
      reason: `Device: ${capabilities.mobile ? 'Mobile' : 'Desktop'}`
    });

    // Connection assessment
    const connectionScore = this.assessNetworkConnection();
    factors.push({
      weight: 0.1,
      score: connectionScore,
      reason: `Network: ${this.getConnectionType()}`
    });

    // Calculate weighted score
    score = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);

    // Determine tier based on score
    if (score >= 80) return 'ultra';
    if (score >= 65) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  }

  private assessGPU(renderer: string): 'low' | 'mid' | 'high' | 'ultra' {
    const rendererLower = renderer.toLowerCase();
    
    for (const [gpuName, tier] of Object.entries(GPU_TIER_MAPPING)) {
      if (rendererLower.includes(gpuName.toLowerCase())) {
        return tier;
      }
    }

    // Fallback heuristics
    if (rendererLower.includes('rtx') || rendererLower.includes('radeon rx')) {
      return 'high';
    }
    if (rendererLower.includes('gtx') || rendererLower.includes('radeon')) {
      return 'mid';
    }
    if (rendererLower.includes('intel') || rendererLower.includes('integrated')) {
      return 'low';
    }

    return 'mid'; // Default fallback
  }

  private gpuTierToScore(tier: 'low' | 'mid' | 'high' | 'ultra'): number {
    switch (tier) {
      case 'ultra': return 100;
      case 'high': return 80;
      case 'mid': return 60;
      case 'low': return 30;
    }
  }

  private assessMemory(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const totalMemory = memInfo.totalJSHeapSize || memInfo.usedJSHeapSize * 4;
      
      if (totalMemory > 4 * 1024 * 1024 * 1024) return 100; // >4GB
      if (totalMemory > 2 * 1024 * 1024 * 1024) return 80;  // >2GB
      if (totalMemory > 1 * 1024 * 1024 * 1024) return 60;  // >1GB
      return 40; // <1GB
    }
    
    return 60; // Default when memory info unavailable
  }

  private getMemoryInfo(): string {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const totalMB = Math.round(memInfo.totalJSHeapSize / (1024 * 1024));
      return `${totalMB}MB`;
    }
    return 'Unknown';
  }

  private assessWebGLCapabilities(capabilities: DeviceCapabilities): number {
    let score = capabilities.webgl ? 50 : 0;
    
    if (capabilities.webgl2) score += 20;
    if (capabilities.supportsFloatTextures) score += 10;
    if (capabilities.supportsInstancedArrays) score += 10;
    if (capabilities.maxTextureSize >= 4096) score += 10;
    
    return Math.min(score, 100);
  }

  private assessNetworkConnection(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case '4g': return 100;
        case '3g': return 60;
        case '2g': return 30;
        case 'slow-2g': return 10;
        default: return 70;
      }
    }
    
    return 70; // Default when connection info unavailable
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }
}

// Responsive configuration system
export class ResponsiveConfigManager {
  private breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    ultrawide: 1920,
  };

  getCurrentBreakpoint(): keyof typeof this.breakpoints {
    const width = window.innerWidth;
    
    if (width >= this.breakpoints.ultrawide) return 'ultrawide';
    if (width >= this.breakpoints.desktop) return 'desktop';
    if (width >= this.breakpoints.tablet) return 'tablet';
    return 'mobile';
  }

  getResponsiveSettings<T>(config: ResponsiveConfig<T>): T {
    const breakpoint = this.getCurrentBreakpoint();
    
    switch (breakpoint) {
      case 'ultrawide':
        return config.ultrawide || config.desktop;
      case 'desktop':
        return config.desktop;
      case 'tablet':
        return config.tablet;
      case 'mobile':
      default:
        return config.mobile;
    }
  }

  // Performance settings by screen size
  getResponsivePerformanceSettings(): ResponsiveConfig<Partial<PerformanceSettings>> {
    return {
      mobile: {
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        shadows: false,
        postprocessing: false,
        maxLights: 2,
        lodEnabled: true,
        cullingDistance: 50,
      },
      tablet: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        shadows: true,
        shadowMapSize: 512,
        postprocessing: true,
        maxLights: 4,
        lodEnabled: true,
        cullingDistance: 100,
      },
      desktop: {
        pixelRatio: window.devicePixelRatio,
        shadows: true,
        shadowMapSize: 1024,
        postprocessing: true,
        maxLights: 8,
        lodEnabled: false,
        cullingDistance: 200,
      },
      ultrawide: {
        pixelRatio: window.devicePixelRatio,
        shadows: true,
        shadowMapSize: 2048,
        postprocessing: true,
        maxLights: 12,
        lodEnabled: false,
        cullingDistance: 300,
      },
    };
  }

  // Component-specific responsive configs
  getResponsiveParticleConfig(): ResponsiveConfig<{ count: number; complexity: 'low' | 'medium' | 'high' }> {
    return {
      mobile: { count: 50, complexity: 'low' },
      tablet: { count: 150, complexity: 'medium' },
      desktop: { count: 500, complexity: 'high' },
      ultrawide: { count: 1000, complexity: 'high' },
    };
  }

  getResponsiveGeometryConfig(): ResponsiveConfig<{ segments: number; detail: number }> {
    return {
      mobile: { segments: 8, detail: 1 },
      tablet: { segments: 16, detail: 2 },
      desktop: { segments: 32, detail: 3 },
      ultrawide: { segments: 64, detail: 4 },
    };
  }

  getResponsiveMaterialConfig(): ResponsiveConfig<{ roughness: number; metalness: number; envMapIntensity: number }> {
    return {
      mobile: { roughness: 0.7, metalness: 0.3, envMapIntensity: 0.5 },
      tablet: { roughness: 0.5, metalness: 0.5, envMapIntensity: 0.7 },
      desktop: { roughness: 0.3, metalness: 0.7, envMapIntensity: 1.0 },
      ultrawide: { roughness: 0.2, metalness: 0.8, envMapIntensity: 1.2 },
    };
  }
}

// Adaptive quality manager
export class AdaptiveQualityManager {
  private settings: AdaptiveQualitySettings;
  private currentSettings: PerformanceSettings;
  private performanceHistory: number[] = [];
  private lastAdjustment = 0;
  private isStabilizing = false;

  constructor(
    initialSettings: PerformanceSettings,
    adaptiveSettings: AdaptiveQualitySettings = DEFAULT_ADAPTIVE_SETTINGS
  ) {
    this.settings = adaptiveSettings;
    this.currentSettings = { ...initialSettings };
  }

  updatePerformance(fps: number, frameTime: number): PerformanceSettings | null {
    this.performanceHistory.push(fps);
    
    // Keep only recent history
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }

    // Check if enough time has passed since last adjustment
    const now = Date.now();
    if (now - this.lastAdjustment < this.settings.adjustmentInterval) {
      return null;
    }

    // Calculate average FPS
    const avgFps = this.performanceHistory.reduce((sum, fps) => sum + fps, 0) / this.performanceHistory.length;

    // Determine if adjustment is needed
    let needsAdjustment = false;
    let shouldDecrease = false;

    if (avgFps < this.settings.minFPS) {
      needsAdjustment = true;
      shouldDecrease = true;
    } else if (avgFps > this.settings.maxFPS && !this.isStabilizing) {
      needsAdjustment = true;
      shouldDecrease = false;
    }

    if (!needsAdjustment) {
      return null;
    }

    // Apply adjustments
    const newSettings = { ...this.currentSettings };
    let adjusted = false;

    if (shouldDecrease) {
      // Decrease quality to improve performance
      adjusted = this.decreaseQuality(newSettings) || adjusted;
    } else {
      // Increase quality if performance allows
      adjusted = this.increaseQuality(newSettings) || adjusted;
    }

    if (adjusted) {
      this.currentSettings = newSettings;
      this.lastAdjustment = now;
      this.isStabilizing = true;
      
      // Reset stabilization after timeout
      setTimeout(() => {
        this.isStabilizing = false;
      }, this.settings.stabilizationTime);

      return newSettings;
    }

    return null;
  }

  private decreaseQuality(settings: PerformanceSettings): boolean {
    let adjusted = false;

    // Priority order for quality reduction
    if (settings.postprocessing && this.settings.adaptivePostprocessing) {
      settings.postprocessing = false;
      adjusted = true;
    } else if (settings.shadows && this.settings.adaptiveShadows) {
      settings.shadows = false;
      adjusted = true;
    } else if (settings.pixelRatio > 0.75 && this.settings.adaptivePixelRatio) {
      settings.pixelRatio = Math.max(0.75, settings.pixelRatio * 0.8);
      adjusted = true;
    } else if (settings.shadowMapSize > 256) {
      settings.shadowMapSize = Math.max(256, settings.shadowMapSize / 2);
      adjusted = true;
    } else if (settings.maxLights > 1) {
      settings.maxLights = Math.max(1, settings.maxLights - 1);
      adjusted = true;
    } else if (!settings.lodEnabled && this.settings.adaptiveLOD) {
      settings.lodEnabled = true;
      adjusted = true;
    } else if (!settings.cullingEnabled && this.settings.adaptiveCulling) {
      settings.cullingEnabled = true;
      adjusted = true;
    }

    return adjusted;
  }

  private increaseQuality(settings: PerformanceSettings): boolean {
    let adjusted = false;

    // Priority order for quality improvement
    if (settings.pixelRatio < window.devicePixelRatio && this.settings.adaptivePixelRatio) {
      settings.pixelRatio = Math.min(window.devicePixelRatio, settings.pixelRatio * 1.2);
      adjusted = true;
    } else if (!settings.shadows && this.settings.adaptiveShadows) {
      settings.shadows = true;
      adjusted = true;
    } else if (!settings.postprocessing && this.settings.adaptivePostprocessing) {
      settings.postprocessing = true;
      adjusted = true;
    } else if (settings.shadowMapSize < 2048) {
      settings.shadowMapSize = Math.min(2048, settings.shadowMapSize * 2);
      adjusted = true;
    } else if (settings.maxLights < 8) {
      settings.maxLights = Math.min(8, settings.maxLights + 1);
      adjusted = true;
    }

    return adjusted;
  }

  getCurrentSettings(): PerformanceSettings {
    return { ...this.currentSettings };
  }

  reset(newSettings: PerformanceSettings): void {
    this.currentSettings = { ...newSettings };
    this.performanceHistory = [];
    this.lastAdjustment = 0;
    this.isStabilizing = false;
  }
}

// Memory management system
export class MemoryManager {
  private config: MemoryManagementConfig;
  private geometryPool: Map<string, THREE.BufferGeometry[]> = new Map();
  private materialPool: Map<string, THREE.Material[]> = new Map();
  private texturePool: Map<string, THREE.Texture[]> = new Map();
  private lastGC = 0;

  constructor(config: MemoryManagementConfig = DEFAULT_MEMORY_CONFIG) {
    this.config = config;
    
    if (config.enabled) {
      this.startGCTimer();
    }
  }

  acquireGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.config.poolingEnabled) {
      return factory();
    }

    const pool = this.geometryPool.get(key) || [];
    if (pool.length > 0) {
      return pool.pop()!;
    }

    return factory();
  }

  releaseGeometry(key: string, geometry: THREE.BufferGeometry): void {
    if (!this.config.poolingEnabled) {
      geometry.dispose();
      return;
    }

    const pool = this.geometryPool.get(key) || [];
    if (pool.length < 10) { // Limit pool size
      pool.push(geometry);
      this.geometryPool.set(key, pool);
    } else {
      geometry.dispose();
    }
  }

  acquireMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (!this.config.poolingEnabled) {
      return factory();
    }

    const pool = this.materialPool.get(key) || [];
    if (pool.length > 0) {
      return pool.pop()!;
    }

    return factory();
  }

  releaseMaterial(key: string, material: THREE.Material): void {
    if (!this.config.poolingEnabled) {
      material.dispose();
      return;
    }

    const pool = this.materialPool.get(key) || [];
    if (pool.length < 5) { // Limit pool size
      pool.push(material);
      this.materialPool.set(key, pool);
    } else {
      material.dispose();
    }
  }

  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize || 0;
    }
    return 0;
  }

  forceGarbageCollection(): void {
    // Clean up pools
    this.geometryPool.forEach((pool) => {
      pool.forEach(geometry => geometry.dispose());
    });
    this.geometryPool.clear();

    this.materialPool.forEach((pool) => {
      pool.forEach(material => material.dispose());
    });
    this.materialPool.clear();

    this.texturePool.forEach((pool) => {
      pool.forEach(texture => texture.dispose());
    });
    this.texturePool.clear();

    // Force browser GC if available
    if ('gc' in window) {
      (window as any).gc();
    }

    this.lastGC = Date.now();
  }

  private startGCTimer(): void {
    setInterval(() => {
      const usage = this.getMemoryUsage();
      
  if (usage > this.config.gcThreshold) {
        this.forceGarbageCollection();
      }
    }, this.config.gcInterval);
  }
}

// Export singletons
export const deviceCapabilities = DeviceCapabilityDetector.getInstance();
export const performanceTier = PerformanceTierDetector.getInstance();
export const responsiveConfig = new ResponsiveConfigManager();
export const memoryManager = new MemoryManager();