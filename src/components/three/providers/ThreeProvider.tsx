'use client';

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  ReactNode 
} from 'react';
import { 
  PerformanceLevel, 
  PerformanceSettings, 
  DeviceCapabilities,
  ThreeContextValue,
  PerformanceMetrics,
  VisualizerError
} from '@/types/visualizer';
import { 
  deviceCapabilities,
  performanceTier,
  responsiveConfig,
  memoryManager,
  AdaptiveQualityManager
} from '../config/performance';
import { PERFORMANCE_PRESETS } from '../types/performance';

// Context interfaces
interface ThreeProviderProps {
  children: ReactNode;
  initialPerformanceMode?: PerformanceLevel;
  adaptiveQuality?: boolean;
  memoryManagement?: boolean;
  errorReporting?: boolean;
}

interface ThreeContextState {
  // Performance
  performanceMode: PerformanceLevel;
  performanceSettings: PerformanceSettings;
  deviceCapabilities: DeviceCapabilities | null;
  metrics: PerformanceMetrics | null;
  adaptiveQualityEnabled: boolean;
  
  // Status
  initialized: boolean;
  loading: boolean;
  error: VisualizerError | null;
  
  // Actions
  setPerformanceMode: (mode: PerformanceLevel) => void;
  updatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  reportError: (error: VisualizerError) => void;
  clearError: () => void;
  forceGC: () => void;
  
  // Utilities
  getResponsiveConfig: <T>(config: any) => T;
  isLowPerformance: () => boolean;
  canUseFeature: (feature: keyof PerformanceSettings) => boolean;
}

// Create context
const ThreeContext = createContext<ThreeContextState | null>(null);

// Custom hook for accessing context
export const useThreeContext = (): ThreeContextState => {
  const context = useContext(ThreeContext);
  if (!context) {
    throw new Error('useThreeContext must be used within a ThreeProvider');
  }
  return context;
};

// Performance monitoring hook
const usePerformanceMonitoring = (
  adaptiveQualityEnabled: boolean,
  performanceSettings: PerformanceSettings,
  onSettingsUpdate: (settings: PerformanceSettings) => void
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [adaptiveManager] = useState(() => 
    new AdaptiveQualityManager(performanceSettings)
  );

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(current => ({
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memory: {
        used: 0,
        total: 0,
        geometries: 0,
        textures: 0,
        programs: 0,
        rendertargets: 0,
      },
      gpu: {},
      timing: {
        render: 0,
        compute: 0,
        update: 0,
      },
      ...current,
      ...newMetrics,
    }));

    // Adaptive quality adjustment
    if (adaptiveQualityEnabled && newMetrics.fps && newMetrics.frameTime) {
      const adjustedSettings = adaptiveManager.updatePerformance(
        newMetrics.fps,
        newMetrics.frameTime
      );
      
      if (adjustedSettings) {
        onSettingsUpdate(adjustedSettings);
      }
    }
  }, [adaptiveQualityEnabled, adaptiveManager, onSettingsUpdate]);

  return { metrics, updateMetrics };
};

// Error handling hook
const useErrorHandling = (errorReporting: boolean) => {
  const [error, setError] = useState<VisualizerError | null>(null);

  const reportError = useCallback((newError: VisualizerError) => {
    setError(newError);
    
    if (errorReporting) {
      console.error('Three.js Visualizer Error:', newError);
      
      // Report to analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: `Three.js ${newError.code}: ${newError.message}`,
          fatal: newError.severity === 'critical',
          custom_map: {
            error_code: newError.code,
            severity: newError.severity,
            recoverable: newError.recoverable,
          }
        });
      }
      
      // Report to external service if configured
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry integration would go here
      }
    }
  }, [errorReporting]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, reportError, clearError };
};

// Main provider component
export const ThreeProvider: React.FC<ThreeProviderProps> = ({
  children,
  initialPerformanceMode,
  adaptiveQuality = true,
  memoryManagement = true,
  errorReporting = true,
}) => {
  // State
  const [performanceMode, setPerformanceModeState] = useState<PerformanceLevel>(
    initialPerformanceMode || 'medium'
  );
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>(
    PERFORMANCE_PRESETS[initialPerformanceMode || 'medium']
  );
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom hooks
  const { metrics, updateMetrics } = usePerformanceMonitoring(
    adaptiveQuality,
    performanceSettings,
    setPerformanceSettings
  );
  const { error, reportError, clearError } = useErrorHandling(errorReporting);

  // Initialize system
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Detect device capabilities
        const detectedCapabilities = await deviceCapabilities.detectCapabilities();
        setCapabilities(detectedCapabilities);

        // Auto-detect performance tier if not specified
        let finalPerformanceMode = performanceMode;
        if (!initialPerformanceMode) {
          finalPerformanceMode = await performanceTier.detectPerformanceTier();
          setPerformanceModeState(finalPerformanceMode);
        }

        // Apply responsive performance adjustments
        const responsiveSettings = responsiveConfig.getResponsivePerformanceSettings();
        const currentSettings = responsiveConfig.getResponsiveSettings(responsiveSettings);
        const mergedSettings = {
          ...PERFORMANCE_PRESETS[finalPerformanceMode],
          ...currentSettings,
        };
        setPerformanceSettings(mergedSettings);

        setInitialized(true);
      } catch (err) {
        reportError({
          name: 'InitializationError',
          message: 'Failed to initialize Three.js context',
          code: 'WEBGL_UNSUPPORTED',
          severity: 'critical',
          recoverable: false,
          fallbackAvailable: true,
          context: err,
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [initialPerformanceMode, performanceMode, reportError]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const responsiveSettings = responsiveConfig.getResponsivePerformanceSettings();
      const currentSettings = responsiveConfig.getResponsiveSettings(responsiveSettings);
      
      setPerformanceSettings(current => ({
        ...current,
        ...currentSettings,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Actions
  const setPerformanceMode = useCallback((mode: PerformanceLevel) => {
    setPerformanceModeState(mode);
    const newSettings = PERFORMANCE_PRESETS[mode];
    
    // Apply responsive adjustments
    const responsiveSettings = responsiveConfig.getResponsivePerformanceSettings();
    const currentSettings = responsiveConfig.getResponsiveSettings(responsiveSettings);
    
    setPerformanceSettings({
      ...newSettings,
      ...currentSettings,
    });
  }, []);

  const updatePerformanceSettings = useCallback((settings: Partial<PerformanceSettings>) => {
    setPerformanceSettings(current => ({
      ...current,
      ...settings,
    }));
  }, []);

  const forceGC = useCallback(() => {
    if (memoryManagement) {
      memoryManager.forceGarbageCollection();
    }
  }, [memoryManagement]);

  const getResponsiveConfig = useCallback(<T,>(config: any): T => {
    return responsiveConfig.getResponsiveSettings<T>(config);
  }, []);

  const isLowPerformance = useCallback(() => {
    return performanceMode === 'low' || (capabilities?.mobile && performanceMode === 'medium');
  }, [performanceMode, capabilities]);

  const canUseFeature = useCallback((feature: keyof PerformanceSettings) => {
    return performanceSettings[feature] as boolean;
  }, [performanceSettings]);

  // Context value
  const contextValue = useMemo<ThreeContextState>(() => ({
    // Performance
    performanceMode,
    performanceSettings,
    deviceCapabilities: capabilities,
    metrics,
    adaptiveQualityEnabled: adaptiveQuality,
    
    // Status
    initialized,
    loading,
    error,
    
    // Actions
    setPerformanceMode,
    updatePerformanceSettings,
    reportError,
    clearError,
    forceGC,
    
    // Utilities
    getResponsiveConfig,
    isLowPerformance,
    canUseFeature,
  }), [
    performanceMode,
    performanceSettings,
    capabilities,
    metrics,
    adaptiveQuality,
    initialized,
    loading,
    error,
    setPerformanceMode,
    updatePerformanceSettings,
    reportError,
    clearError,
    forceGC,
    getResponsiveConfig,
    isLowPerformance,
    canUseFeature,
  ]);

  return (
    <ThreeContext.Provider value={contextValue}>
      {children}
    </ThreeContext.Provider>
  );
};

// Additional utility hooks
export const usePerformanceSettings = () => {
  const context = useThreeContext();
  return {
    settings: context.performanceSettings,
    mode: context.performanceMode,
    update: context.updatePerformanceSettings,
    setMode: context.setPerformanceMode,
    isLowPerformance: context.isLowPerformance,
    canUseFeature: context.canUseFeature,
  };
};

export const useResponsiveThree = <T,>(config: any) => {
  const context = useThreeContext();
  return context.getResponsiveConfig<T>(config);
};

export const useThreeCapabilities = () => {
  const context = useThreeContext();
  return {
    capabilities: context.deviceCapabilities,
    initialized: context.initialized,
    loading: context.loading,
    webglSupported: context.deviceCapabilities?.webgl || false,
    webgl2Supported: context.deviceCapabilities?.webgl2 || false,
    mobile: context.deviceCapabilities?.mobile || false,
  };
};

export const useThreeError = () => {
  const context = useThreeContext();
  return {
    error: context.error,
    reportError: context.reportError,
    clearError: context.clearError,
  };
};