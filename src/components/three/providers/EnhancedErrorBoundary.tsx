'use client';

import React, { Component, ReactNode, ErrorInfo, createContext, useContext } from 'react';
import { useWebGLCapabilities } from './WebGLCapabilityDetector';
import { useBrowserAPIAvailability } from './BrowserAPIGuard';
import * as THREE from 'three';

// Enhanced error types
interface EnhancedVisualizerError {
  name: string;
  message: string;
  code: ErrorCode;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  fallbackAvailable: boolean;
  context: {
    component?: string;
    props?: Record<string, any>;
    webglContext?: string;
    browserSupport?: Record<string, boolean>;
    userAgent?: string;
    timestamp: number;
    sessionId?: string;
    retryCount?: number;
    stackTrace?: string;
    performanceMetrics?: {
      memoryUsage?: number;
      fps?: number;
      renderTime?: number;
    };
  };
  metadata?: {
    webglVersion?: string;
    gpuTier?: string;
    mobile?: boolean;
    networkType?: string;
    devicePixelRatio?: number;
  };
}

type ErrorCode = 
  | 'WEBGL_UNSUPPORTED'
  | 'WEBGL_CONTEXT_LOST'
  | 'WEBGL_CONTEXT_CREATION_FAILED'
  | 'SHADER_COMPILE_ERROR'
  | 'SHADER_LINK_ERROR'
  | 'TEXTURE_LOAD_ERROR'
  | 'GEOMETRY_ERROR'
  | 'MATERIAL_ERROR'
  | 'ANIMATION_ERROR'
  | 'MEMORY_ERROR'
  | 'PERFORMANCE_ERROR'
  | 'BROWSER_API_UNAVAILABLE'
  | 'SSR_HYDRATION_MISMATCH'
  | 'COMPONENT_CRASH'
  | 'RESOURCE_LOAD_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

type FallbackMode = 
  | 'none'
  | 'minimal'
  | 'canvas2d'
  | 'webgl-basic'
  | 'static'
  | 'progressive';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: EnhancedVisualizerError;
  errorInfo?: ErrorInfo;
  fallbackMode: FallbackMode;
  retryCount: number;
  isRetrying: boolean;
  contextLost: boolean;
  performanceMode: 'auto' | 'low' | 'medium' | 'high';
}

interface ErrorFallbackProps {
  error: EnhancedVisualizerError;
  errorInfo?: ErrorInfo;
  retry: () => void;
  canRetry: boolean;
  fallbackMode: FallbackMode;
  isRetrying: boolean;
  performanceMode: string;
  onPerformanceModeChange: (mode: 'low' | 'medium' | 'high') => void;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: EnhancedVisualizerError, errorInfo: ErrorInfo) => void;
  onRetry?: (retryCount: number) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  reportErrors?: boolean;
  componentName?: string;
  performanceMode?: 'auto' | 'low' | 'medium' | 'high';
  enableProgressiveFallback?: boolean;
  enableContextRecovery?: boolean;
  sessionId?: string;
}

// Error boundary context for nested boundaries
interface ErrorBoundaryContextValue {
  reportError: (error: EnhancedVisualizerError) => void;
  currentFallbackMode: FallbackMode;
  performanceMode: string;
  errorHistory: EnhancedVisualizerError[];
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

// Enhanced fallback components
const MinimalFallback: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry, isRetrying }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-900/50 rounded-lg border border-gray-700">
    <div className="text-yellow-400 text-3xl mb-3">⚠️</div>
    <div className="text-gray-300 text-lg font-medium mb-2">3D Content Error</div>
    <div className="text-gray-500 text-sm text-center max-w-md mb-4">
      {error.message || 'Unable to display 3D visualization'}
    </div>
    {canRetry && (
      <button
        onClick={retry}
        disabled={isRetrying}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors"
      >
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </button>
    )}
  </div>
);

const Canvas2DFallback: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-lg border border-gray-700">
    <div className="mb-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="text-blue-400">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="8" fill="url(#grad1)" opacity="0.8">
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="90" cy="30" r="6" fill="url(#grad1)" opacity="0.6">
          <animate attributeName="r" values="4;8;4" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="80" r="7" fill="url(#grad1)" opacity="0.7">
          <animate attributeName="r" values="5;9;5" dur="2s" begin="1s" repeatCount="indefinite" />
        </circle>
        <line x1="30" y1="30" x2="90" y2="30" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" />
        <line x1="30" y1="30" x2="60" y2="80" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" />
        <line x1="90" y1="30" x2="60" y2="80" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" />
      </svg>
    </div>
    <div className="text-gray-300 text-lg font-medium mb-2">2D Visualization Mode</div>
    <div className="text-gray-500 text-sm text-center max-w-md mb-4">
      3D graphics are not available. Showing a simplified 2D representation.
    </div>
    {canRetry && (
      <button onClick={retry} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
        Try 3D Again
      </button>
    )}
  </div>
);

const StaticFallback: React.FC<ErrorFallbackProps> = ({ error, performanceMode, onPerformanceModeChange }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-gray-800/50 rounded-lg border border-gray-600 p-6">
    <div className="text-gray-400 text-4xl mb-4">🖼️</div>
    <div className="text-gray-300 text-lg font-medium mb-2">Static Display Mode</div>
    <div className="text-gray-500 text-sm text-center max-w-md mb-4">
      3D rendering is not available on this device. Performance optimization is recommended.
    </div>
    <div className="flex gap-2 mb-4">
      {(['low', 'medium', 'high'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onPerformanceModeChange(mode)}
          className={`px-3 py-1 text-sm rounded ${
            performanceMode === mode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
    <div className="text-xs text-gray-600 text-center">
      Error: {error.code} | Severity: {error.severity}
    </div>
  </div>
);

const ProgressiveFallback: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry, isRetrying, performanceMode, onPerformanceModeChange }) => {
  const [currentLevel, setCurrentLevel] = React.useState(0);
  const levels = ['minimal', 'basic', 'enhanced'];

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[350px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/50 p-6">
      <div className="text-blue-400 text-3xl mb-4">🔄</div>
      <div className="text-gray-300 text-lg font-medium mb-2">Progressive Enhancement Mode</div>
      <div className="text-gray-500 text-sm text-center max-w-md mb-4">
        Adapting to your device capabilities. Current level: {levels[currentLevel]}
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={prevLevel}
          disabled={currentLevel === 0}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded text-sm"
        >
          Simpler
        </button>
        <button
          onClick={nextLevel}
          disabled={currentLevel === levels.length - 1}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
        >
          Enhanced
        </button>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Performance Mode:</div>
        <div className="flex gap-1">
          {(['low', 'medium', 'high'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onPerformanceModeChange(mode)}
              className={`px-2 py-1 text-xs rounded ${
                performanceMode === mode
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {canRetry && (
        <button
          onClick={retry}
          disabled={isRetrying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          {isRetrying ? 'Optimizing...' : 'Retry with Current Settings'}
        </button>
      )}
    </div>
  );
};

// Main enhanced error boundary
export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: number[] = [];
  private performanceObserver?: PerformanceObserver;
  private errorHistory: EnhancedVisualizerError[] = [];

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      fallbackMode: 'none',
      retryCount: 0,
      isRetrying: false,
      contextLost: false,
      performanceMode: props.performanceMode || 'auto',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const enhancedError = EnhancedErrorBoundary.enhanceError(error);
    const fallbackMode = EnhancedErrorBoundary.determineFallbackMode(enhancedError);

    return {
      hasError: true,
      error: enhancedError,
      fallbackMode,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedError = this.state.error || EnhancedErrorBoundary.enhanceError(error, this.props.componentName);
    
    // Add component context
    enhancedError.context.component = this.props.componentName;
    enhancedError.context.stackTrace = errorInfo.componentStack;
    enhancedError.context.sessionId = this.props.sessionId;
    enhancedError.context.retryCount = this.state.retryCount;
    
    this.errorHistory.push(enhancedError);
    
    this.reportError(enhancedError, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo);
    }

    // Set up WebGL context recovery if needed
    if (this.props.enableContextRecovery && enhancedError.code === 'WEBGL_CONTEXT_LOST') {
      this.setupContextRecovery();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  private cleanup() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  private static enhanceError(error: Error, componentName?: string): EnhancedVisualizerError {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    const timestamp = Date.now();

    // Categorize error
    let code: ErrorCode = 'UNKNOWN_ERROR';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let recoverable = true;
    let fallbackAvailable = true;

    // WebGL context errors
    if (message.includes('webgl context lost') || message.includes('context lost')) {
      code = 'WEBGL_CONTEXT_LOST';
      severity = 'high';
      recoverable = true;
    } else if (message.includes('webgl') && message.includes('not supported')) {
      code = 'WEBGL_UNSUPPORTED';
      severity = 'critical';
      recoverable = false;
    } else if (message.includes('webgl context') || message.includes('context creation')) {
      code = 'WEBGL_CONTEXT_CREATION_FAILED';
      severity = 'critical';
      recoverable = false;
    }
    // Shader errors
    else if (message.includes('shader') && message.includes('compile')) {
      code = 'SHADER_COMPILE_ERROR';
      severity = 'high';
    } else if (message.includes('shader') && message.includes('link')) {
      code = 'SHADER_LINK_ERROR';
      severity = 'high';
    }
    // Resource errors
    else if (message.includes('texture') || message.includes('image')) {
      code = 'TEXTURE_LOAD_ERROR';
      severity = 'medium';
    } else if (message.includes('geometry') || message.includes('buffer')) {
      code = 'GEOMETRY_ERROR';
      severity = 'medium';
    }
    // Performance errors
    else if (message.includes('memory') || message.includes('out of memory')) {
      code = 'MEMORY_ERROR';
      severity = 'high';
    } else if (message.includes('performance') || message.includes('timeout')) {
      code = 'PERFORMANCE_ERROR';
      severity = 'medium';
    }
    // Hydration errors
    else if (message.includes('hydration') || message.includes('server') || message.includes('client')) {
      code = 'SSR_HYDRATION_MISMATCH';
      severity = 'low';
    }
    // Component errors
    else if (message.includes('component') || stack.includes('react')) {
      code = 'COMPONENT_CRASH';
      severity = 'medium';
    }

    return {
      name: error.name,
      message: error.message,
      code,
      severity,
      recoverable,
      fallbackAvailable,
      context: {
        component: componentName,
        timestamp,
        stackTrace: error.stack,
      },
    };
  }

  private static determineFallbackMode(error: EnhancedVisualizerError): FallbackMode {
    switch (error.code) {
      case 'WEBGL_UNSUPPORTED':
      case 'WEBGL_CONTEXT_CREATION_FAILED':
        return error.severity === 'critical' ? 'static' : 'canvas2d';
      case 'WEBGL_CONTEXT_LOST':
        return 'minimal';
      case 'SHADER_COMPILE_ERROR':
      case 'SHADER_LINK_ERROR':
        return 'canvas2d';
      case 'MEMORY_ERROR':
      case 'PERFORMANCE_ERROR':
        return 'progressive';
      case 'SSR_HYDRATION_MISMATCH':
        return 'minimal';
      default:
        return 'minimal';
    }
  }

  private reportError(error: EnhancedVisualizerError, errorInfo: ErrorInfo): void {
    if (!this.props.reportErrors) return;

    console.group('🔴 Enhanced Three.js Error');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Props:', this.props);
    console.error('State:', this.state);
    console.groupEnd();

    // Analytics integration
    this.reportToAnalytics(error);
    
    // External error service
    if (process.env.NODE_ENV === 'production') {
      this.reportToExternalService(error, errorInfo);
    }
  }

  private reportToAnalytics(error: EnhancedVisualizerError): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: `${error.code}: ${error.message}`,
        fatal: error.severity === 'critical',
        custom_map: {
          error_code: error.code,
          severity: error.severity,
          component: error.context.component,
          recoverable: error.recoverable,
          fallback_mode: this.state.fallbackMode,
          retry_count: this.state.retryCount,
          session_id: error.context.sessionId,
        },
      });
    }
  }

  private reportToExternalService(error: EnhancedVisualizerError, errorInfo: ErrorInfo): void {
    // Integration with Sentry, LogRocket, or other services
    // This would be implemented based on the chosen service
  }

  private setupContextRecovery(): void {
    if (typeof window === 'undefined') return;

    const handleContextRestored = () => {
      console.log('WebGL context restored, attempting recovery...');
      this.setState({ contextLost: false });
      this.retry();
    };

    const handleContextLost = (event: Event) => {
      console.warn('WebGL context lost');
      event.preventDefault();
      this.setState({ contextLost: true });
    };

    // Listen for context events on the document
    document.addEventListener('webglcontextrestored', handleContextRestored);
    document.addEventListener('webglcontextlost', handleContextLost);

    // Cleanup listeners when component unmounts
    const cleanup = () => {
      document.removeEventListener('webglcontextrestored', handleContextRestored);
      document.removeEventListener('webglcontextlost', handleContextLost);
    };

    // Store cleanup function
    this.cleanup = cleanup;
  }

  private retry = (): void => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount >= maxRetries || this.state.isRetrying) {
      return;
    }

    this.setState({ isRetrying: true });

    const timeout = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      });
      
      if (this.props.onRetry) {
        this.props.onRetry(this.state.retryCount + 1);
      }
    }, retryDelay * Math.pow(2, this.state.retryCount)); // Exponential backoff

    this.retryTimeouts.push(timeout);
  };

  private handlePerformanceModeChange = (mode: 'low' | 'medium' | 'high'): void => {
    this.setState({ performanceMode: mode });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent || this.getDefaultFallbackComponent();
      const canRetry = this.props.enableRetry && 
                      this.state.error.recoverable && 
                      this.state.retryCount < (this.props.maxRetries || 3) &&
                      !this.state.contextLost;

      const contextValue: ErrorBoundaryContextValue = {
        reportError: (error) => this.errorHistory.push(error),
        currentFallbackMode: this.state.fallbackMode,
        performanceMode: this.state.performanceMode,
        errorHistory: this.errorHistory,
      };

      return (
        <ErrorBoundaryContext.Provider value={contextValue}>
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            retry={this.retry}
            canRetry={canRetry}
            fallbackMode={this.state.fallbackMode}
            isRetrying={this.state.isRetrying}
            performanceMode={this.state.performanceMode}
            onPerformanceModeChange={this.handlePerformanceModeChange}
          />
        </ErrorBoundaryContext.Provider>
      );
    }

    return this.props.children;
  }

  private getDefaultFallbackComponent(): React.ComponentType<ErrorFallbackProps> {
    switch (this.state.fallbackMode) {
      case 'canvas2d':
        return Canvas2DFallback;
      case 'static':
        return StaticFallback;
      case 'progressive':
        return this.props.enableProgressiveFallback ? ProgressiveFallback : MinimalFallback;
      default:
        return MinimalFallback;
    }
  }
}

// Hook for accessing error boundary context
export const useErrorBoundaryContext = (): ErrorBoundaryContextValue => {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundaryContext must be used within EnhancedErrorBoundary');
  }
  return context;
};

// HOC for automatic error boundary wrapping
export const withEnhancedErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<EnhancedErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withEnhancedErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default EnhancedErrorBoundary;