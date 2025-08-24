'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { VisualizerError, ErrorBoundaryState } from '@/types/visualizer';

// Props for the error boundary
interface ThreeErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: VisualizerError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  reportErrors?: boolean;
}

// Props for fallback components
export interface ErrorFallbackProps {
  error: VisualizerError;
  errorInfo?: ErrorInfo;
  retry: () => void;
  canRetry: boolean;
  fallbackMode: ErrorBoundaryState['fallbackMode'];
}

// Default fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  fallbackMode
}) => {
  const getFallbackContent = () => {
    switch (fallbackMode) {
      case 'canvas2d':
        return <Canvas2DFallback error={error} />;
      case 'webgl-basic':
        return <BasicWebGLFallback error={error} />;
      case 'static':
        return <StaticFallback error={error} />;
      default:
        return <MinimalFallback error={error} />;
    }
  };

  return (
    <div className="three-error-boundary">
      {getFallbackContent()}
      {canRetry && (
        <div className="error-controls">
          <button 
            onClick={retry}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Canvas2D fallback for complex visualizations
const Canvas2DFallback: React.FC<{ error: VisualizerError }> = ({ error }) => {
  return (
    <div className="canvas-2d-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path 
              fill="currentColor" 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </div>
        <h3>3D Visualization Unavailable</h3>
        <p>
          Your device doesn't support the required 3D graphics features. 
          Here's a simplified version:
        </p>
        <div className="fallback-visualization">
          {/* Simplified 2D representation */}
          <SimplifiedVisualization />
        </div>
      </div>
    </div>
  );
};

// Basic WebGL fallback
const BasicWebGLFallback: React.FC<{ error: VisualizerError }> = ({ error }) => {
  return (
    <div className="basic-webgl-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">
          <div className="spinning-cube">
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
          </div>
        </div>
        <h3>Simplified 3D View</h3>
        <p>
          Advanced 3D features are disabled for better compatibility.
        </p>
        <div className="basic-scene">
          {/* Basic WebGL scene would be rendered here */}
          <BasicWebGLScene />
        </div>
      </div>
    </div>
  );
};

// Static fallback for severe errors
const StaticFallback: React.FC<{ error: VisualizerError }> = ({ error }) => {
  return (
    <div className="static-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">
          <div className="static-visualization">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="connecting-line"></div>
            <div className="connecting-line"></div>
          </div>
        </div>
        <h3>3D Graphics Not Available</h3>
        <p>
          3D visualizations are not supported on your device. 
          Static representation shown instead.
        </p>
        <div className="static-info">
          <div className="info-item">
            <span className="label">Error:</span>
            <span className="value">{error.code}</span>
          </div>
          <div className="info-item">
            <span className="label">WebGL Support:</span>
            <span className="value">Limited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal fallback
const MinimalFallback: React.FC<{ error: VisualizerError }> = ({ error }) => {
  return (
    <div className="minimal-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">⚠️</div>
        <h3>3D Content Error</h3>
        <p>Unable to display 3D visualization.</p>
        <details className="error-details">
          <summary>Error Details</summary>
          <pre>{error.message}</pre>
        </details>
      </div>
    </div>
  );
};

// Simplified 2D visualization component
const SimplifiedVisualization: React.FC = () => {
  return (
    <div className="simplified-viz">
      <svg viewBox="0 0 400 300" className="viz-svg">
        {/* Network nodes */}
        <circle cx="50" cy="50" r="8" fill="#3b82f6" />
        <circle cx="150" cy="80" r="6" fill="#8b5cf6" />
        <circle cx="250" cy="60" r="7" fill="#06b6d4" />
        <circle cx="350" cy="90" r="5" fill="#10b981" />
        
        {/* Connections */}
        <line x1="50" y1="50" x2="150" y2="80" stroke="#374151" strokeWidth="1" />
        <line x1="150" y1="80" x2="250" y2="60" stroke="#374151" strokeWidth="1" />
        <line x1="250" y1="60" x2="350" y2="90" stroke="#374151" strokeWidth="1" />
        
        {/* Data flow animation */}
        <circle r="3" fill="#f59e0b">
          <animateMotion dur="3s" repeatCount="indefinite">
            <path d="M50,50 L150,80 L250,60 L350,90" />
          </animateMotion>
        </circle>
      </svg>
    </div>
  );
};

// Basic WebGL scene component
const BasicWebGLScene: React.FC = () => {
  return (
    <div className="basic-webgl-scene">
      <canvas width="400" height="300" className="basic-canvas">
        Your browser doesn't support the canvas element.
      </canvas>
    </div>
  );
};

// Main error boundary component
export class ThreeErrorBoundary extends Component<
  ThreeErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeouts: number[] = [];

  constructor(props: ThreeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      fallbackMode: 'none',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const visualizerError = ThreeErrorBoundary.categorizeError(error);
    const fallbackMode = ThreeErrorBoundary.determineFallbackMode(visualizerError);

    return {
      hasError: true,
      error: visualizerError,
      fallbackMode,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const visualizerError = this.state.error || ThreeErrorBoundary.categorizeError(error);
    
    // Report error
    this.reportError(visualizerError, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(visualizerError, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private static categorizeError(error: Error): VisualizerError {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // WebGL context errors
    if (message.includes('webgl') || message.includes('gl')) {
      if (message.includes('context lost') || message.includes('context creation')) {
        return {
          name: error.name,
          message: error.message,
          code: 'WEBGL_UNSUPPORTED',
          severity: 'critical',
          recoverable: false,
          fallbackAvailable: true,
          context: error,
        };
      }
      return {
        name: error.name,
        message: error.message,
        code: 'WEBGL_UNSUPPORTED',
        severity: 'high',
        recoverable: true,
        fallbackAvailable: true,
        context: error,
      };
    }

    // Shader compilation errors
    if (message.includes('shader') || message.includes('compile')) {
      return {
        name: error.name,
        message: error.message,
        code: 'SHADER_COMPILE_ERROR',
        severity: 'high',
        recoverable: true,
        fallbackAvailable: true,
        context: error,
      };
    }

    // Texture loading errors
    if (message.includes('texture') || message.includes('image')) {
      return {
        name: error.name,
        message: error.message,
        code: 'TEXTURE_LOAD_ERROR',
        severity: 'medium',
        recoverable: true,
        fallbackAvailable: false,
        context: error,
      };
    }

    // Geometry errors
    if (message.includes('geometry') || message.includes('buffer')) {
      return {
        name: error.name,
        message: error.message,
        code: 'GEOMETRY_ERROR',
        severity: 'medium',
        recoverable: true,
        fallbackAvailable: true,
        context: error,
      };
    }

    // Animation errors
    if (message.includes('animation') || message.includes('tween')) {
      return {
        name: error.name,
        message: error.message,
        code: 'ANIMATION_ERROR',
        severity: 'low',
        recoverable: true,
        fallbackAvailable: false,
        context: error,
      };
    }

    // Memory errors
    if (message.includes('memory') || message.includes('out of memory')) {
      return {
        name: error.name,
        message: error.message,
        code: 'MEMORY_ERROR',
        severity: 'high',
        recoverable: true,
        fallbackAvailable: true,
        context: error,
      };
    }

    // Performance errors
    if (message.includes('performance') || message.includes('timeout')) {
      return {
        name: error.name,
        message: error.message,
        code: 'PERFORMANCE_ERROR',
        severity: 'medium',
        recoverable: true,
        fallbackAvailable: true,
        context: error,
      };
    }

    // Generic error
    return {
      name: error.name,
      message: error.message,
      code: 'WEBGL_UNSUPPORTED',
      severity: 'medium',
      recoverable: true,
      fallbackAvailable: true,
      context: error,
    };
  }

  private static determineFallbackMode(error: VisualizerError): ErrorBoundaryState['fallbackMode'] {
    switch (error.code) {
      case 'WEBGL_UNSUPPORTED':
        return error.severity === 'critical' ? 'static' : 'canvas2d';
      case 'SHADER_COMPILE_ERROR':
        return 'webgl-basic';
      case 'TEXTURE_LOAD_ERROR':
        return 'webgl-basic';
      case 'GEOMETRY_ERROR':
        return 'webgl-basic';
      case 'MEMORY_ERROR':
        return 'canvas2d';
      case 'PERFORMANCE_ERROR':
        return 'webgl-basic';
      default:
        return 'static';
    }
  }

  private reportError(error: VisualizerError, errorInfo: ErrorInfo): void {
    if (!this.props.reportErrors) return;

    console.group('🔴 Three.js Visualizer Error');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Code:', error.code);
    console.error('Severity:', error.severity);
    console.error('Recoverable:', error.recoverable);
    console.groupEnd();

    // Analytics reporting
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: `Three.js ${error.code}: ${error.message}`,
        fatal: error.severity === 'critical',
        custom_map: {
          error_code: error.code,
          severity: error.severity,
          recoverable: error.recoverable,
          fallback_mode: this.state.fallbackMode,
          retry_count: this.state.retryCount,
        },
      });
    }

    // External error reporting service integration
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, or other service integration would go here
      this.reportToExternalService(error, errorInfo);
    }
  }

  private reportToExternalService(error: VisualizerError, errorInfo: ErrorInfo): void {
    // Integration with external error reporting services
    // This would be implemented based on the chosen service
    
    // Example: Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.withScope((scope) => {
    //     scope.setTag('component', 'ThreeVisualizer');
    //     scope.setTag('error_code', error.code);
    //     scope.setLevel(error.severity === 'critical' ? 'fatal' : 'error');
    //     scope.setContext('errorInfo', errorInfo);
    //     window.Sentry.captureException(error);
    //   });
    // }
  }

  private retry = (): void => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    // Clear error state after delay
    const timeout = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
      });
    }, retryDelay * (this.state.retryCount + 1)); // Exponential backoff

    this.retryTimeouts.push(timeout);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent || DefaultErrorFallback;
      const canRetry = this.props.enableRetry && 
                      this.state.error.recoverable && 
                      this.state.retryCount < (this.props.maxRetries || 3);

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retry={this.retry}
          canRetry={canRetry || false}
          fallbackMode={this.state.fallbackMode}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export const withThreeErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ThreeErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <ThreeErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ThreeErrorBoundary>
  );

  WrappedComponent.displayName = `withThreeErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error reporting
export const useThreeErrorReporting = () => {
  const reportError = (error: Error, context?: any) => {
    // Create a simple visualizer error instead of using private method
    const visualizerError = new Error(error.message) as any;
    visualizerError.code = 'GENERAL_ERROR';
    visualizerError.severity = 'medium';
    visualizerError.recoverable = true;
    visualizerError.fallbackAvailable = false;
    visualizerError.context = { ...visualizerError.context, ...context };
    
    // Throw error to be caught by nearest error boundary
    throw visualizerError;
  };

  return { reportError };
};