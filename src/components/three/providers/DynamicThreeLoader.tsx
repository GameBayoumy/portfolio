'use client';

import React, { lazy, Suspense, useState, useEffect, ReactNode, ComponentType } from 'react';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';
import { useWebGLCapabilities } from './WebGLCapabilityDetector';

// Types
interface DynamicLoadConfig {
  webglRequired?: boolean;
  webgl2Preferred?: boolean;
  minGPUTier?: 'low' | 'medium' | 'high';
  fallbackComponent?: ComponentType<any>;
  loadingComponent?: ComponentType<any>;
  errorComponent?: ComponentType<{ error: Error; retry: () => void }>;
  retryAttempts?: number;
  retryDelay?: number;
}

interface LoaderState {
  loading: boolean;
  error: Error | null;
  retryCount: number;
  component: ComponentType<any> | null;
}

// Default components
const DefaultLoadingComponent: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 rounded-lg border border-gray-700">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin-slow"></div>
    </div>
    <div className="mt-4 text-gray-300 font-medium">Loading 3D Component</div>
    <div className="text-gray-500 text-sm mt-1">Preparing WebGL resources...</div>
  </div>
);

const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 rounded-lg border border-red-700/50">
    <div className="text-red-400 text-4xl mb-4">⚠️</div>
    <div className="text-red-300 text-lg font-medium mb-2">Failed to Load 3D Component</div>
    <div className="text-gray-400 text-sm mb-4 max-w-md text-center">
      {error.message || 'Unknown error occurred'}
    </div>
    <button 
      onClick={retry}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
    >
      Retry Loading
    </button>
  </div>
);

const DefaultFallbackComponent: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 bg-gray-800/50 rounded-lg border border-gray-600">
    <div className="text-gray-400 text-4xl mb-4">🖼️</div>
    <div className="text-gray-300 text-lg font-medium mb-2">3D Content Unavailable</div>
    <div className="text-gray-500 text-sm text-center max-w-md">
      Your device doesn't meet the requirements for this 3D visualization. 
      A simplified version is shown instead.
    </div>
  </div>
);

// Dynamic loader hook
const useDynamicThreeLoader = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  config: DynamicLoadConfig = {}
) => {
  const capabilities = useWebGLCapabilities();
  const [state, setState] = useState<LoaderState>({
    loading: false,
    error: null,
    retryCount: 0,
    component: null,
  });

  const {
    webglRequired = true,
    webgl2Preferred = false,
    minGPUTier = 'low',
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  const shouldLoad = React.useMemo(() => {
    // Check WebGL support
    if (webglRequired && !capabilities.supported) {
      return false;
    }

    // Check WebGL2 preference
    if (webgl2Preferred && capabilities.version !== 'webgl2') {
      return false;
    }

    // Check GPU tier
    const tierOrder = { low: 0, medium: 1, high: 2, unknown: -1 };
    const currentTier = tierOrder[capabilities.performance.tier];
    const requiredTier = tierOrder[minGPUTier];
    
    if (requiredTier > currentTier && currentTier !== -1) {
      return false;
    }

    return true;
  }, [capabilities, webglRequired, webgl2Preferred, minGPUTier]);

  const loadComponent = React.useCallback(async () => {
    if (!shouldLoad) {
      setState(prev => ({ ...prev, loading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const mod = await importFn();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        component: mod.default,
        error: null 
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load component');
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err 
      }));
    }
  }, [importFn, shouldLoad]);

  const retry = React.useCallback(() => {
    if (state.retryCount < retryAttempts) {
      setState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        error: null 
      }));
      
      setTimeout(() => {
        loadComponent();
      }, retryDelay * (state.retryCount + 1)); // Exponential backoff
    }
  }, [state.retryCount, retryAttempts, retryDelay, loadComponent]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return {
    ...state,
    shouldLoad,
    retry,
    canRetry: state.retryCount < retryAttempts,
  };
};

// Dynamic Three.js component loader
interface DynamicThreeLoaderProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  config?: DynamicLoadConfig;
  componentProps?: Record<string, any>;
  className?: string;
}

export const DynamicThreeLoader: React.FC<DynamicThreeLoaderProps> = ({
  importFn,
  config = {},
  componentProps = {},
  className,
}) => {
  const { 
    loading, 
    error, 
    component: Component, 
    shouldLoad, 
    retry, 
    canRetry 
  } = useDynamicThreeLoader(importFn, config);

  const {
    fallbackComponent: FallbackComponent = DefaultFallbackComponent,
    loadingComponent: LoadingComponent = DefaultLoadingComponent,
    errorComponent: ErrorComponent = DefaultErrorComponent,
  } = config;

  // Show fallback if device doesn't meet requirements
  if (!shouldLoad) {
    return (
      <div className={className}>
        <FallbackComponent />
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingComponent />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <ErrorComponent error={error} retry={retry} />
      </div>
    );
  }

  // Render component if loaded
  if (Component) {
    return (
      <div className={className}>
        <EnhancedErrorBoundary
          fallbackComponent={({ error, retry: rbRetry }) => (
            <ErrorComponent error={error as unknown as Error} retry={retry} />
          )}
          enableRetry
          maxRetries={3}
          onError={(err) => console.error('Dynamic Three component error:', err)}
        >
          <Suspense fallback={<LoadingComponent />}>
            <Component {...componentProps} />
          </Suspense>
        </EnhancedErrorBoundary>
      </div>
    );
  }

  return (
    <div className={className}>
      <FallbackComponent />
    </div>
  );
};

// Utility function to create dynamic Three.js components
export const createDynamicThreeComponent = <P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  defaultConfig?: DynamicLoadConfig
) => {
  const DynamicComponent: React.FC<P & { 
    dynamicConfig?: DynamicLoadConfig;
    className?: string;
  }> = ({ dynamicConfig, className, ...props }) => {
    return (
      <DynamicThreeLoader
        importFn={importFn}
        config={{ ...defaultConfig, ...dynamicConfig }}
        componentProps={props}
        className={className}
      />
    );
  };

  DynamicComponent.displayName = `DynamicThree(${importFn.name || 'Component'})`;
  return DynamicComponent;
};

// Pre-configured dynamic loaders for common patterns
// Note: Example pre-configured components disabled due to missing visualizer files.
// Uncomment and ensure the target modules exist before using.
// export const DynamicBasicThree = createDynamicThreeComponent(
//   () => import('../visualizers/BasicThreeComponent'),
//   {
//     webglRequired: true,
//     webgl2Preferred: false,
//     minGPUTier: 'low',
//   }
// );
// 
// export const DynamicAdvancedThree = createDynamicThreeComponent(
//   () => import('../visualizers/AdvancedThreeComponent'),
//   {
//     webglRequired: true,
//     webgl2Preferred: true,
//     minGPUTier: 'medium',
//   }
// );
// 
// export const DynamicHighEndThree = createDynamicThreeComponent(
//   () => import('../visualizers/HighEndThreeComponent'),
//   {
//     webglRequired: true,
//     webgl2Preferred: true,
//     minGPUTier: 'high',
//   }
// );

export default DynamicThreeLoader;