'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWebGLCapabilities } from './WebGLCapabilityDetector';
import { useBrowserAPIAvailability } from './BrowserAPIGuard';
import { useWebGLContextRecovery } from './WebGLContextRecovery';

// Degradation strategy types
type DegradationStrategy = 
  | 'full-3d'        // Full 3D with all features
  | 'basic-3d'       // Basic 3D with minimal features
  | 'canvas-2d'      // Canvas 2D fallback
  | 'svg-animation'  // Animated SVG fallback
  | 'css-animation'  // CSS-only animations
  | 'static-image'   // Static images
  | 'text-only';     // Text-only description

interface DegradationLevel {
  strategy: DegradationStrategy;
  features: {
    webgl: boolean;
    webgl2: boolean;
    shaders: boolean;
    postprocessing: boolean;
    shadows: boolean;
    animations: boolean;
    interactions: boolean;
    particles: boolean;
    lighting: boolean;
    textures: boolean;
  };
  performance: {
    maxParticles: number;
    maxLights: number;
    shadowMapSize: number;
    pixelRatio: number;
    targetFPS: number;
  };
  quality: {
    antialiasing: boolean;
    highPrecision: boolean;
    logarithmicDepth: boolean;
    colorSpace: 'srgb' | 'linear';
  };
}

interface DegradationConfig {
  enableAutoDetection?: boolean;
  enableUserOverride?: boolean;
  enablePerformanceMonitoring?: boolean;
  fallbackTimeout?: number;
  retryAttempts?: number;
  customStrategies?: Record<string, DegradationLevel>;
  onStrategyChange?: (strategy: DegradationStrategy, level: DegradationLevel) => void;
}

interface GracefulDegradationValue {
  currentStrategy: DegradationStrategy;
  currentLevel: DegradationLevel;
  availableStrategies: DegradationStrategy[];
  canUpgrade: boolean;
  canDowngrade: boolean;
  isAutoDetecting: boolean;
  switchToStrategy: (strategy: DegradationStrategy) => void;
  upgradeStrategy: () => void;
  downgradeStrategy: () => void;
  resetToOptimal: () => void;
  getComponentForStrategy: <T>(components: Record<DegradationStrategy, React.ComponentType<T>>) => React.ComponentType<T>;
}

// Default degradation levels
const DEFAULT_DEGRADATION_LEVELS: Record<DegradationStrategy, DegradationLevel> = {
  'full-3d': {
    strategy: 'full-3d',
    features: {
      webgl: true,
      webgl2: true,
      shaders: true,
      postprocessing: true,
      shadows: true,
      animations: true,
      interactions: true,
      particles: true,
      lighting: true,
      textures: true,
    },
    performance: {
      maxParticles: 1000,
      maxLights: 8,
      shadowMapSize: 2048,
      pixelRatio: 2,
      targetFPS: 60,
    },
    quality: {
      antialiasing: true,
      highPrecision: true,
      logarithmicDepth: true,
      colorSpace: 'srgb',
    },
  },
  'basic-3d': {
    strategy: 'basic-3d',
    features: {
      webgl: true,
      webgl2: false,
      shaders: true,
      postprocessing: false,
      shadows: true,
      animations: true,
      interactions: true,
      particles: true,
      lighting: true,
      textures: true,
    },
    performance: {
      maxParticles: 200,
      maxLights: 4,
      shadowMapSize: 1024,
      pixelRatio: 1.5,
      targetFPS: 30,
    },
    quality: {
      antialiasing: false,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'linear',
    },
  },
  'canvas-2d': {
    strategy: 'canvas-2d',
    features: {
      webgl: false,
      webgl2: false,
      shaders: false,
      postprocessing: false,
      shadows: false,
      animations: true,
      interactions: true,
      particles: false,
      lighting: false,
      textures: false,
    },
    performance: {
      maxParticles: 50,
      maxLights: 0,
      shadowMapSize: 0,
      pixelRatio: 1,
      targetFPS: 30,
    },
    quality: {
      antialiasing: false,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'srgb',
    },
  },
  'svg-animation': {
    strategy: 'svg-animation',
    features: {
      webgl: false,
      webgl2: false,
      shaders: false,
      postprocessing: false,
      shadows: false,
      animations: true,
      interactions: true,
      particles: false,
      lighting: false,
      textures: false,
    },
    performance: {
      maxParticles: 20,
      maxLights: 0,
      shadowMapSize: 0,
      pixelRatio: 1,
      targetFPS: 24,
    },
    quality: {
      antialiasing: true,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'srgb',
    },
  },
  'css-animation': {
    strategy: 'css-animation',
    features: {
      webgl: false,
      webgl2: false,
      shaders: false,
      postprocessing: false,
      shadows: false,
      animations: true,
      interactions: false,
      particles: false,
      lighting: false,
      textures: false,
    },
    performance: {
      maxParticles: 10,
      maxLights: 0,
      shadowMapSize: 0,
      pixelRatio: 1,
      targetFPS: 24,
    },
    quality: {
      antialiasing: false,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'srgb',
    },
  },
  'static-image': {
    strategy: 'static-image',
    features: {
      webgl: false,
      webgl2: false,
      shaders: false,
      postprocessing: false,
      shadows: false,
      animations: false,
      interactions: false,
      particles: false,
      lighting: false,
      textures: false,
    },
    performance: {
      maxParticles: 0,
      maxLights: 0,
      shadowMapSize: 0,
      pixelRatio: 1,
      targetFPS: 0,
    },
    quality: {
      antialiasing: false,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'srgb',
    },
  },
  'text-only': {
    strategy: 'text-only',
    features: {
      webgl: false,
      webgl2: false,
      shaders: false,
      postprocessing: false,
      shadows: false,
      animations: false,
      interactions: false,
      particles: false,
      lighting: false,
      textures: false,
    },
    performance: {
      maxParticles: 0,
      maxLights: 0,
      shadowMapSize: 0,
      pixelRatio: 1,
      targetFPS: 0,
    },
    quality: {
      antialiasing: false,
      highPrecision: false,
      logarithmicDepth: false,
      colorSpace: 'srgb',
    },
  },
};

// Degradation strategy detector
class DegradationStrategyDetector {
  static detectOptimalStrategy(
    webglCapabilities: any,
    browserAPI: any,
    contextRecovery: any
  ): DegradationStrategy {
    // Check for critical issues first
    if (!browserAPI.isBrowser || !browserAPI.canvas) {
      return 'text-only';
    }

    if (!webglCapabilities.supported) {
      if (browserAPI.canvas) {
        return 'canvas-2d';
      } else {
        return 'svg-animation';
      }
    }

    // Context recovery issues
    if (contextRecovery.contextState.contextLossCount > 2) {
      return 'canvas-2d';
    }

    // WebGL capability assessment
    const gpuTier = webglCapabilities.performance.tier;
    const mobile = webglCapabilities.performance.mobile;
    const hasWebGL2 = webglCapabilities.version === 'webgl2';
    const hasFloatTextures = webglCapabilities.features.floatTextures;
    const maxTextureSize = webglCapabilities.parameters.maxTextureSize;

    // High-end strategy
    if (gpuTier === 'high' && !mobile && hasWebGL2 && hasFloatTextures && maxTextureSize >= 8192) {
      return 'full-3d';
    }

    // Medium strategy
    if (gpuTier !== 'low' && webglCapabilities.supported && maxTextureSize >= 2048) {
      return 'basic-3d';
    }

    // Low-end fallbacks
    if (webglCapabilities.supported) {
      return 'basic-3d';
    }

    // Non-WebGL fallbacks
    if (browserAPI.canvas) {
      return 'canvas-2d';
    }

    return 'svg-animation';
  }

  static getAvailableStrategies(
    webglCapabilities: any,
    browserAPI: any
  ): DegradationStrategy[] {
    const strategies: DegradationStrategy[] = ['text-only'];

    if (browserAPI.canvas || browserAPI.document) {
      strategies.unshift('css-animation');
      strategies.unshift('svg-animation');
    }

    if (browserAPI.canvas) {
      strategies.unshift('canvas-2d');
    }

    if (webglCapabilities.supported) {
      strategies.unshift('basic-3d');
      
      if (webglCapabilities.version === 'webgl2' && 
          webglCapabilities.performance.tier !== 'low') {
        strategies.unshift('full-3d');
      }
    }

    return strategies;
  }
}

// Context
const GracefulDegradationContext = createContext<GracefulDegradationValue | null>(null);

// Provider component
interface GracefulDegradationProviderProps {
  children: ReactNode;
  config?: DegradationConfig;
}

export const GracefulDegradationProvider: React.FC<GracefulDegradationProviderProps> = ({
  children,
  config = {},
}) => {
  const webglCapabilities = useWebGLCapabilities();
  const browserAPI = useBrowserAPIAvailability();
  const contextRecovery = useWebGLContextRecovery();
  
  const [currentStrategy, setCurrentStrategy] = useState<DegradationStrategy>('text-only');
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [availableStrategies, setAvailableStrategies] = useState<DegradationStrategy[]>(['text-only']);
  
  const {
    enableAutoDetection = true,
    enableUserOverride = true,
    customStrategies = {},
    onStrategyChange,
  } = config;

  const degradationLevels = { ...DEFAULT_DEGRADATION_LEVELS, ...customStrategies };
  const currentLevel = degradationLevels[currentStrategy];

  // Auto-detect optimal strategy
  useEffect(() => {
    if (!enableAutoDetection) return;

    setIsAutoDetecting(true);
    
    const availableStrats = DegradationStrategyDetector.getAvailableStrategies(
      webglCapabilities,
      browserAPI
    );
    setAvailableStrategies(availableStrats);

    const optimalStrategy = DegradationStrategyDetector.detectOptimalStrategy(
      webglCapabilities,
      browserAPI,
      contextRecovery
    );
    
    setCurrentStrategy(optimalStrategy);
    onStrategyChange?.(optimalStrategy, degradationLevels[optimalStrategy]);
    
    setIsAutoDetecting(false);
  }, [webglCapabilities, browserAPI, contextRecovery, enableAutoDetection, onStrategyChange]);

  // Strategy management functions
  const switchToStrategy = React.useCallback((strategy: DegradationStrategy) => {
    if (availableStrategies.includes(strategy)) {
      setCurrentStrategy(strategy);
      onStrategyChange?.(strategy, degradationLevels[strategy]);
    }
  }, [availableStrategies, degradationLevels, onStrategyChange]);

  const upgradeStrategy = React.useCallback(() => {
    const currentIndex = availableStrategies.indexOf(currentStrategy);
    if (currentIndex > 0) {
      const newStrategy = availableStrategies[currentIndex - 1];
      switchToStrategy(newStrategy);
    }
  }, [availableStrategies, currentStrategy, switchToStrategy]);

  const downgradeStrategy = React.useCallback(() => {
    const currentIndex = availableStrategies.indexOf(currentStrategy);
    if (currentIndex < availableStrategies.length - 1) {
      const newStrategy = availableStrategies[currentIndex + 1];
      switchToStrategy(newStrategy);
    }
  }, [availableStrategies, currentStrategy, switchToStrategy]);

  const resetToOptimal = React.useCallback(() => {
    const optimalStrategy = DegradationStrategyDetector.detectOptimalStrategy(
      webglCapabilities,
      browserAPI,
      contextRecovery
    );
    switchToStrategy(optimalStrategy);
  }, [webglCapabilities, browserAPI, contextRecovery, switchToStrategy]);

  const getComponentForStrategy = React.useCallback(<T,>(
    components: Record<DegradationStrategy, React.ComponentType<T>>
  ): React.ComponentType<T> => {
    return components[currentStrategy] || components['text-only'] || (() => null as any);
  }, [currentStrategy]);

  const canUpgrade = availableStrategies.indexOf(currentStrategy) > 0;
  const canDowngrade = availableStrategies.indexOf(currentStrategy) < availableStrategies.length - 1;

  const value: GracefulDegradationValue = {
    currentStrategy,
    currentLevel,
    availableStrategies,
    canUpgrade,
    canDowngrade,
    isAutoDetecting,
    switchToStrategy,
    upgradeStrategy,
    downgradeStrategy,
    resetToOptimal,
    getComponentForStrategy,
  };

  return (
    <GracefulDegradationContext.Provider value={value}>
      {children}
    </GracefulDegradationContext.Provider>
  );
};

// Hook to use graceful degradation
export const useGracefulDegradation = (): GracefulDegradationValue => {
  const context = useContext(GracefulDegradationContext);
  if (!context) {
    throw new Error('useGracefulDegradation must be used within GracefulDegradationProvider');
  }
  return context;
};

// Utility hooks
export const useCurrentDegradationLevel = (): DegradationLevel => {
  const { currentLevel } = useGracefulDegradation();
  return currentLevel;
};

export const useCanUseFeature = (feature: keyof DegradationLevel['features']): boolean => {
  const { currentLevel } = useGracefulDegradation();
  return currentLevel.features[feature];
};

export const usePerformanceConstraints = () => {
  const { currentLevel } = useGracefulDegradation();
  return currentLevel.performance;
};

export const useQualitySettings = () => {
  const { currentLevel } = useGracefulDegradation();
  return currentLevel.quality;
};

// Component wrapper for strategy-based rendering
interface StrategyBasedRendererProps<T = {}> {
  components: Partial<Record<DegradationStrategy, React.ComponentType<T>>>;
  props?: T;
  fallback?: React.ComponentType<T>;
}

export const StrategyBasedRenderer = <T extends {}>({ 
  components, 
  props, 
  fallback 
}: StrategyBasedRendererProps<T>) => {
  const { currentStrategy } = useGracefulDegradation();
  
  const Component = components[currentStrategy] || fallback || (() => (
    <div className="text-gray-500 p-4 text-center">
      No component available for {currentStrategy} strategy
    </div>
  ));
  
  return <Component {...(props as T)} />;
};

export default GracefulDegradationProvider;