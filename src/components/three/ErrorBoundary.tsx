'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ThreeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Three.js Component Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            3D Visualization Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
            The 3D visualization failed to load. This might be due to WebGL compatibility issues or browser limitations.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border text-sm">
              <summary className="cursor-pointer text-red-700 dark:text-red-400 font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-red-600 dark:text-red-300 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.resetError}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ThreeErrorBoundary