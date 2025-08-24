import { PerformanceLevel, PerformanceSettings } from '@/types/visualizer';

// Performance tier detection and configuration
export interface PerformanceTierInfo {
  tier: PerformanceLevel;
  confidence: number;
  reasons: string[];
  recommendations: string[];
}

export interface DevicePerformanceProfile {
  cpu: {
    cores: number;
    speed?: number;
    architecture?: string;
  };
  gpu: {
    vendor: string;
    renderer: string;
    memory?: number;
    tier: 'low' | 'mid' | 'high' | 'ultra';
  };
  memory: {
    total?: number;
    available?: number;
  };
  display: {
    width: number;
    height: number;
    pixelRatio: number;
    refreshRate?: number;
  };
  network: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  mobile: boolean;
  battery?: {
    level?: number;
    charging?: boolean;
  };
}

export interface BenchmarkResult {
  name: string;
  score: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PerformanceBenchmark {
  name: string;
  description: string;
  test: () => Promise<BenchmarkResult>;
  weight: number;
  timeout: number;
}

// Performance presets for different tiers
export const PERFORMANCE_PRESETS: Record<PerformanceLevel, PerformanceSettings> = {
  low: {
    pixelRatio: 0.75,
    antialias: false,
    shadows: false,
    shadowType: 'basic',
    shadowMapSize: 256,
    postprocessing: false,
    maxLights: 2,
    lodEnabled: true,
    lodThreshold: 30,
    cullingEnabled: true,
    cullingDistance: 50,
    frustumCulling: true,
    geometryLOD: true,
    textureLOD: true,
    instancedRendering: true,
    batchedRendering: true,
    memoryManagement: true,
  },
  medium: {
    pixelRatio: 1.0,
    antialias: true,
    shadows: true,
    shadowType: 'pcf',
    shadowMapSize: 512,
    postprocessing: true,
    maxLights: 4,
    lodEnabled: true,
    lodThreshold: 50,
    cullingEnabled: true,
    cullingDistance: 100,
    frustumCulling: true,
    geometryLOD: true,
    textureLOD: true,
    instancedRendering: true,
    batchedRendering: true,
    memoryManagement: true,
  },
  high: {
    pixelRatio: 1.5,
    antialias: true,
    shadows: true,
    shadowType: 'pcf-soft',
    shadowMapSize: 1024,
    postprocessing: true,
    maxLights: 8,
    lodEnabled: true,
    lodThreshold: 100,
    cullingEnabled: true,
    cullingDistance: 200,
    frustumCulling: true,
    geometryLOD: false,
    textureLOD: false,
    instancedRendering: true,
    batchedRendering: false,
    memoryManagement: true,
  },
  ultra: {
    pixelRatio: 2.0,
    antialias: true,
    shadows: true,
    shadowType: 'vsm',
    shadowMapSize: 2048,
    postprocessing: true,
    maxLights: 16,
    lodEnabled: false,
    lodThreshold: 200,
    cullingEnabled: true,
    cullingDistance: 400,
    frustumCulling: true,
    geometryLOD: false,
    textureLOD: false,
    instancedRendering: true,
    batchedRendering: false,
    memoryManagement: true,
  },
};

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  fps: {
    excellent: 58,
    good: 45,
    acceptable: 30,
    poor: 20,
  },
  frameTime: {
    excellent: 16.67, // 60fps
    good: 22.22,     // 45fps
    acceptable: 33.33, // 30fps
    poor: 50,        // 20fps
  },
  memory: {
    excellent: 100 * 1024 * 1024, // 100MB
    good: 200 * 1024 * 1024,      // 200MB
    acceptable: 400 * 1024 * 1024, // 400MB
    poor: 800 * 1024 * 1024,      // 800MB
  },
  drawCalls: {
    excellent: 100,
    good: 200,
    acceptable: 500,
    poor: 1000,
  },
  triangles: {
    excellent: 100000,
    good: 500000,
    acceptable: 1000000,
    poor: 2000000,
  },
} as const;

// GPU tier classification
export const GPU_TIER_MAPPING: Record<string, 'low' | 'mid' | 'high' | 'ultra'> = {
  // High-end desktop GPUs
  'GeForce RTX 4090': 'ultra',
  'GeForce RTX 4080': 'ultra',
  'GeForce RTX 4070': 'ultra',
  'GeForce RTX 3090': 'ultra',
  'GeForce RTX 3080': 'ultra',
  'GeForce RTX 3070': 'high',
  'GeForce RTX 3060': 'high',
  'GeForce RTX 2080': 'high',
  'GeForce RTX 2070': 'high',
  'GeForce RTX 2060': 'mid',
  'Radeon RX 7900': 'ultra',
  'Radeon RX 7800': 'ultra',
  'Radeon RX 7700': 'high',
  'Radeon RX 6900': 'ultra',
  'Radeon RX 6800': 'high',
  'Radeon RX 6700': 'high',
  'Radeon RX 6600': 'mid',
  
  // Mid-range desktop GPUs
  'GeForce GTX 1660': 'mid',
  'GeForce GTX 1650': 'mid',
  'GeForce GTX 1060': 'mid',
  'GeForce GTX 1050': 'low',
  'Radeon RX 580': 'mid',
  'Radeon RX 570': 'mid',
  'Radeon RX 560': 'low',
  'Radeon RX 550': 'low',
  
  // Integrated graphics
  'Intel Iris': 'low',
  'Intel UHD': 'low',
  'Intel HD': 'low',
  'AMD Radeon Graphics': 'low',
  'Apple': 'mid', // Apple Silicon
  'Mali': 'low',
  'Adreno': 'low',
  'PowerVR': 'low',
  
  // Mobile GPUs
  'Adreno 740': 'high',
  'Adreno 730': 'mid',
  'Adreno 660': 'mid',
  'Adreno 650': 'mid',
  'Mali-G710': 'mid',
  'Mali-G78': 'mid',
  'Mali-G77': 'low',
  'Apple A17': 'high',
  'Apple A16': 'mid',
  'Apple A15': 'mid',
  'Apple A14': 'mid',
};

// Benchmark tests
export const PERFORMANCE_BENCHMARKS: PerformanceBenchmark[] = [
  {
    name: 'basic_rendering',
    description: 'Basic geometry rendering test',
    weight: 0.3,
    timeout: 5000,
    test: async (): Promise<BenchmarkResult> => {
      // Implementation would go here
      return { name: 'basic_rendering', score: 100, duration: 1000 };
    },
  },
  {
    name: 'particle_system',
    description: 'Particle system performance test',
    weight: 0.2,
    timeout: 10000,
    test: async (): Promise<BenchmarkResult> => {
      // Implementation would go here
      return { name: 'particle_system', score: 100, duration: 2000 };
    },
  },
  {
    name: 'shader_compilation',
    description: 'Shader compilation and execution test',
    weight: 0.2,
    timeout: 8000,
    test: async (): Promise<BenchmarkResult> => {
      // Implementation would go here
      return { name: 'shader_compilation', score: 100, duration: 1500 };
    },
  },
  {
    name: 'texture_loading',
    description: 'Texture loading and memory test',
    weight: 0.15,
    timeout: 12000,
    test: async (): Promise<BenchmarkResult> => {
      // Implementation would go here
      return { name: 'texture_loading', score: 100, duration: 3000 };
    },
  },
  {
    name: 'postprocessing',
    description: 'Post-processing effects test',
    weight: 0.15,
    timeout: 6000,
    test: async (): Promise<BenchmarkResult> => {
      // Implementation would go here
      return { name: 'postprocessing', score: 100, duration: 2500 };
    },
  },
];

// Adaptive quality settings
export interface AdaptiveQualitySettings {
  targetFPS: number;
  minFPS: number;
  maxFPS: number;
  adjustmentInterval: number;
  adjustmentFactor: number;
  stabilizationTime: number;
  adaptivePixelRatio: boolean;
  adaptiveShadows: boolean;
  adaptivePostprocessing: boolean;
  adaptiveLOD: boolean;
  adaptiveCulling: boolean;
}

export const DEFAULT_ADAPTIVE_SETTINGS: AdaptiveQualitySettings = {
  targetFPS: 60,
  minFPS: 30,
  maxFPS: 120,
  adjustmentInterval: 1000, // 1 second
  adjustmentFactor: 0.1,
  stabilizationTime: 3000, // 3 seconds
  adaptivePixelRatio: true,
  adaptiveShadows: true,
  adaptivePostprocessing: true,
  adaptiveLOD: true,
  adaptiveCulling: true,
};

// Memory management
export interface MemoryManagementConfig {
  enabled: boolean;
  maxGeometries: number;
  maxTextures: number;
  maxMaterials: number;
  gcThreshold: number;
  gcInterval: number;
  poolingEnabled: boolean;
  compressionEnabled: boolean;
  streamingEnabled: boolean;
}

export const DEFAULT_MEMORY_CONFIG: MemoryManagementConfig = {
  enabled: true,
  maxGeometries: 1000,
  maxTextures: 100,
  maxMaterials: 500,
  gcThreshold: 0.8, // 80% of available memory
  gcInterval: 30000, // 30 seconds
  poolingEnabled: true,
  compressionEnabled: true,
  streamingEnabled: true,
};

// Performance monitoring events
export interface PerformanceEvent {
  type: 'fps_drop' | 'memory_warning' | 'gpu_timeout' | 'render_error' | 'quality_change';
  timestamp: number;
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Quality recommendation system
export interface QualityRecommendation {
  setting: keyof PerformanceSettings;
  currentValue: any;
  recommendedValue: any;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  priority: number;
}