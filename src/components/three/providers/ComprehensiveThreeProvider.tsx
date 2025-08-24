'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { BrowserAPIGuard } from './BrowserAPIGuard';
import { WebGLCapabilityProvider } from './WebGLCapabilityDetector';
import { WebGLContextRecoveryProvider } from './WebGLContextRecovery';
import { GracefulDegradationProvider } from './GracefulDegradationProvider';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { DynamicThreeLoader } from './DynamicThreeLoader';

// Comprehensive configuration interface
interface ComprehensiveThreeConfig {
  // Error boundary configuration
  errorBoundary?: {
    enableRetry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    reportErrors?: boolean;
    enableProgressiveFallback?: boolean;
    enableContextRecovery?: boolean;
    componentName?: string;
    sessionId?: string;
    performanceMode?: 'auto' | 'low' | 'medium' | 'high';
  };
  
  // WebGL context recovery configuration
  contextRecovery?: {
    maxRecoveryAttempts?: number;
    recoveryDelay?: number;
    preventDrawingBufferPreservation?: boolean;
    enableAutomaticRecovery?: boolean;
  };
  
  // Graceful degradation configuration
  degradation?: {
    enableAutoDetection?: boolean;
    enableUserOverride?: boolean;
    enablePerformanceMonitoring?: boolean;
    fallbackTimeout?: number;
    retryAttempts?: number;
  };
  
  // Dynamic loading configuration
  dynamicLoading?: {
    webglRequired?: boolean;
    webgl2Preferred?: boolean;
    minGPUTier?: 'low' | 'medium' | 'high';
    enableLazyLoading?: boolean;
    preloadComponents?: string[];
  };
  
  // Analytics and monitoring
  analytics?: {
    enableErrorTracking?: boolean;
    enablePerformanceTracking?: boolean;
    enableUserInteractionTracking?: boolean;
    sessionId?: string;
    customProperties?: Record<string, any>;
  };
  
  // Development and debugging
  development?: {
    enableDebugMode?: boolean;
    showPerformanceStats?: boolean;
    enableContextMenus?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
  };
}

interface ComprehensiveThreeProviderProps {
  children: ReactNode;
  config?: ComprehensiveThreeConfig;
  fallback?: ReactNode;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Loading screen component
const SystemInitializationScreen: React.FC<{ 
  stage: string; 
  progress: number;
  error?: string;
}> = ({ stage, progress, error }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-8">
    <div className="relative mb-6">
      <div className="w-16 h-16 border-4 border-gray-600 rounded-full"></div>
      <div 
        className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
        style={{
          transform: `rotate(${progress * 3.6}deg)`,
          transition: 'transform 0.3s ease',
        }}
      ></div>
    </div>
    
    <div className="text-center">
      <h3 className="text-xl font-semibold text-white mb-2">Initializing 3D Environment</h3>
      <p className="text-gray-400 mb-4">{stage}</p>
      
      {error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <div className="w-64 bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        {Math.round(progress)}% Complete
      </div>
    </div>
  </div>
);

// Main comprehensive provider
export const ComprehensiveThreeProvider: React.FC<ComprehensiveThreeProviderProps> = ({
  children,
  config = {},
  fallback,
  onReady,
  onError,
}) => {
  const [initStage, setInitStage] = useState<string>('Starting...');
  const [initProgress, setInitProgress] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Extract configuration sections
  const {
    errorBoundary = {},
    contextRecovery = {},
    degradation = {},
    analytics = {},
    development = {},
  } = config;

  // Generate session ID if not provided
  const sessionId = analytics.sessionId || 
    errorBoundary.sessionId || 
    `three-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialization effect
  useEffect(() => {
    let mounted = true;
    const initSteps = [
      'Checking browser compatibility...',
      'Detecting WebGL capabilities...',
      'Initializing context recovery...',
      'Setting up error boundaries...',
      'Configuring degradation strategies...',
      'Finalizing setup...',
    ];

    const runInitialization = async () => {
      try {
        for (let i = 0; i < initSteps.length; i++) {
          if (!mounted) return;
          
          setInitStage(initSteps[i]);
          setInitProgress((i / initSteps.length) * 100);
          
          // Simulate initialization delay for each step
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (mounted) {
          setInitProgress(100);
          setIsReady(true);
          onReady?.();
        }
      } catch (error) {
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
          setInitError(errorMessage);
          onError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    };

    runInitialization();

    return () => {
      mounted = false;
    };
  }, [onReady, onError]);

  // Event handlers
  const handleCapabilitiesDetected = React.useCallback((capabilities: any) => {
    if (development.enableDebugMode) {
      console.log('WebGL capabilities detected:', capabilities);
    }
    
    // Report capabilities to analytics if enabled
    if (analytics.enablePerformanceTracking && typeof window !== 'undefined') {
      try {
        if ('gtag' in window) {
          (window as any).gtag('event', 'webgl_capabilities_detected', {
            webgl_version: capabilities.version,
            gpu_tier: capabilities.performance.tier,
            mobile: capabilities.performance.mobile,
            max_texture_size: capabilities.parameters.maxTextureSize,
            session_id: sessionId,
          });
        }
      } catch (error) {
        console.warn('Analytics reporting failed:', error);
      }
    }
  }, [analytics.enablePerformanceTracking, development.enableDebugMode, sessionId]);

  const handleContextLoss = React.useCallback((event: Event) => {
    if (development.enableDebugMode) {
      console.warn('WebGL context lost:', event);
    }
    
    // Report to analytics
    if (analytics.enableErrorTracking && typeof window !== 'undefined') {
      try {
        if ('gtag' in window) {
          (window as any).gtag('event', 'webgl_context_lost', {
            timestamp: Date.now(),
            session_id: sessionId,
            ...analytics.customProperties,
          });
        }
      } catch (error) {
        console.warn('Analytics reporting failed:', error);
      }
    }
  }, [analytics.enableErrorTracking, analytics.customProperties, development.enableDebugMode, sessionId]);

  const handleContextRestore = React.useCallback((renderer: any) => {
    if (development.enableDebugMode) {
      console.log('WebGL context restored:', renderer);
    }
    
    // Report to analytics
    if (analytics.enableErrorTracking && typeof window !== 'undefined') {
      try {
        if ('gtag' in window) {
          (window as any).gtag('event', 'webgl_context_restored', {
            timestamp: Date.now(),
            session_id: sessionId,
            ...analytics.customProperties,
          });
        }
      } catch (error) {
        console.warn('Analytics reporting failed:', error);
      }
    }
  }, [analytics.enableErrorTracking, analytics.customProperties, development.enableDebugMode, sessionId]);

  const handleError = React.useCallback((error: any, errorInfo?: any) => {
    if (development.enableDebugMode) {
      console.error('Three.js component error:', error, errorInfo);
    }
    
    // Report to analytics
    if (analytics.enableErrorTracking && typeof window !== 'undefined') {
      try {
        if ('gtag' in window) {
          (window as any).gtag('event', 'exception', {
            description: `Three.js error: ${error.message || error}`,
            fatal: false,
            custom_map: {
              error_code: error.code || 'UNKNOWN',
              component: error.context?.component || 'unknown',
              session_id: sessionId,
              ...analytics.customProperties,
            },
          });
        }
      } catch (reportError) {
        console.warn('Analytics reporting failed:', reportError);
      }
    }
    
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }, [analytics.enableErrorTracking, analytics.customProperties, development.enableDebugMode, sessionId, onError]);

  const handleStrategyChange = React.useCallback((strategy: any, level: any) => {
    if (development.enableDebugMode) {
      console.log('Degradation strategy changed:', strategy, level);
    }
    
    // Report strategy changes to analytics
    if (analytics.enablePerformanceTracking && typeof window !== 'undefined') {
      try {
        if ('gtag' in window) {
          (window as any).gtag('event', 'degradation_strategy_changed', {
            strategy,
            webgl_support: level.features.webgl,
            performance_tier: level.performance.targetFPS,
            session_id: sessionId,
            ...analytics.customProperties,
          });
        }
      } catch (error) {
        console.warn('Analytics reporting failed:', error);
      }
    }
  }, [analytics.enablePerformanceTracking, analytics.customProperties, development.enableDebugMode, sessionId]);

  // Show loading screen during initialization
  if (!isReady) {
    if (initError) {
      return (
        <div className="p-4">
          <SystemInitializationScreen 
            stage="Initialization Failed" 
            progress={0} 
            error={initError}
          />
          {fallback}
        </div>
      );
    }
    
    return (
      <SystemInitializationScreen 
        stage={initStage} 
        progress={initProgress}
      />
    );
  }

  // Render the complete provider hierarchy
  return (
    <BrowserAPIGuard 
      fallback={fallback}
      onAPIDetected={(availability) => {
        if (development.enableDebugMode) {
          console.log('Browser API availability:', availability);
        }
      }}
    >
      <WebGLCapabilityProvider 
        onCapabilitiesDetected={handleCapabilitiesDetected}
        onDetectionError={handleError}
      >
        <WebGLContextRecoveryProvider 
          config={{
            maxRecoveryAttempts: contextRecovery.maxRecoveryAttempts || 3,
            recoveryDelay: contextRecovery.recoveryDelay || 1000,
            preventDrawingBufferPreservation: contextRecovery.preventDrawingBufferPreservation ?? true,
            enableAutomaticRecovery: contextRecovery.enableAutomaticRecovery ?? true,
          }}
          onContextLost={handleContextLoss}
          onContextRestored={handleContextRestore}
          onRecoveryFailed={(attempts) => {
            const error = new Error(`WebGL context recovery failed after ${attempts} attempts`);
            handleError(error);
          }}
        >
          <GracefulDegradationProvider 
            config={{
              enableAutoDetection: degradation.enableAutoDetection ?? true,
              enableUserOverride: degradation.enableUserOverride ?? true,
              enablePerformanceMonitoring: degradation.enablePerformanceMonitoring ?? true,
              fallbackTimeout: degradation.fallbackTimeout || 5000,
              retryAttempts: degradation.retryAttempts || 3,
              onStrategyChange: handleStrategyChange,
            }}
          >
            <EnhancedErrorBoundary 
              enableRetry={errorBoundary.enableRetry ?? true}
              maxRetries={errorBoundary.maxRetries || 3}
              retryDelay={errorBoundary.retryDelay || 1000}
              reportErrors={errorBoundary.reportErrors ?? analytics.enableErrorTracking}
              componentName={errorBoundary.componentName || 'ComprehensiveThreeProvider'}
              performanceMode={errorBoundary.performanceMode || 'auto'}
              enableProgressiveFallback={errorBoundary.enableProgressiveFallback ?? true}
              enableContextRecovery={errorBoundary.enableContextRecovery ?? true}
              sessionId={sessionId}
              onError={handleError}
            >
              {children}
            </EnhancedErrorBoundary>
          </GracefulDegradationProvider>
        </WebGLContextRecoveryProvider>
      </WebGLCapabilityProvider>
    </BrowserAPIGuard>
  );
};

// Utility component for easy Three.js component wrapping
interface SafeThreeComponentProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  config?: ComprehensiveThreeConfig;
}

export const SafeThreeComponent: React.FC<SafeThreeComponentProps> = ({
  children,
  componentName = 'SafeThreeComponent',
  fallback,
  config = {},
}) => {
  return (
    <ComprehensiveThreeProvider 
      config={{
        ...config,
        errorBoundary: {
          ...config.errorBoundary,
          componentName,
        },
      }}
      fallback={fallback}
    >
      {children}
    </ComprehensiveThreeProvider>
  );
};

// High-order component for easy wrapping
export const withComprehensiveThreeProvider = <P extends object>(
  Component: React.ComponentType<P>,
  config?: ComprehensiveThreeConfig
) => {
  const WrappedComponent = (props: P) => (
    <ComprehensiveThreeProvider config={config}>
      <Component {...props} />
    </ComprehensiveThreeProvider>
  );
  
  WrappedComponent.displayName = `withComprehensiveThreeProvider(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ComprehensiveThreeProvider;