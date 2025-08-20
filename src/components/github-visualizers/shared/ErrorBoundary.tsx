'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the optional error handler
    this.props.onError?.(error, errorInfo);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            {this.props.fallback || 'Something went wrong'}
          </h3>
          
          <p className="text-red-600 dark:text-red-300 text-center mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>

          {canRetry && (
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              aria-label={`Retry (${this.maxRetries - this.state.retryCount} attempts remaining)`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again ({this.maxRetries - this.state.retryCount} left)
            </button>
          )}

          {!canRetry && (
            <p className="text-sm text-red-500 dark:text-red-400">
              Maximum retry attempts reached. Please refresh the page.
            </p>
          )}

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400 font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded text-xs overflow-auto text-red-800 dark:text-red-200">
                {this.state.error.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="mt-2 p-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded text-xs overflow-auto text-red-800 dark:text-red-200">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}