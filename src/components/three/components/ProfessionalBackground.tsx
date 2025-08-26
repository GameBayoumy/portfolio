/**
 * Professional Background Component
 * 
 * The main component that integrates the improved shader system with
 * adaptive quality management and responsive design for professional use.
 */

'use client'

import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdaptiveBackgroundSystem } from '../systems/AdaptiveBackgroundSystem'
import { ShaderMaterialManager } from '../managers/ShaderMaterialManager'
import type { ProfessionalPresets, QualityConfigs } from '../shaders/ImprovedBackgroundShader'
import { ThreeErrorBoundary } from '../providers/ErrorBoundary'
import { WebGLContextRecoveryProvider, useWebGLContextRecovery } from '../providers/WebGLContextRecovery'

// Component props interface
interface ProfessionalBackgroundProps {
  // Visual presets
  preset?: keyof typeof ProfessionalPresets
  
  // Performance settings
  forceQuality?: keyof typeof QualityConfigs
  enableAdaptiveQuality?: boolean
  targetFPS?: number
  
  // Appearance settings
  opacity?: number
  layers?: number
  animationPreset?: 'subtle' | 'smooth' | 'dynamic'
  
  // Interaction settings
  enableInteractivity?: boolean
  enableParallax?: boolean
  
  // Layout settings
  className?: string
  zIndex?: number
  fullscreen?: boolean
  
  // Callbacks
  onLoad?: () => void
  onError?: (error: Error) => void
  onPerformanceChange?: (fps: number, quality: string) => void
  
  // Development settings
  showDebugInfo?: boolean
  showPerformanceStats?: boolean
}

// Loading fallback component
function LoadingFallback({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 ${className || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="flex items-center justify-center h-full">
        <motion.div
          className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// Error fallback component
function ErrorFallback({ 
  className, 
  onRetry 
}: { 
  className?: string
  onRetry?: () => void 
}) {
  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900/30 to-slate-900 ${className || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-gray-400 text-sm mb-4">3D background unavailable</div>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Retry
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// Debug information overlay
function DebugOverlay({ 
  performanceStats,
  managerStats 
}: {
  performanceStats: { fps: number; quality: string; frameTime: number }
  managerStats: ReturnType<ShaderMaterialManager['getStats']>
}) {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <motion.div
      className="absolute top-4 right-4 bg-black/80 text-white text-xs p-3 rounded font-mono max-w-xs"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-1">
        <div className="text-green-400">Performance</div>
        <div>FPS: {performanceStats.fps}</div>
        <div>Frame Time: {performanceStats.frameTime}ms</div>
        <div>Quality: {performanceStats.quality}</div>
        
        <div className="text-blue-400 mt-2">Material Manager</div>
        <div>Active Materials: {managerStats.animatedMaterials}</div>
        <div>Pool Size: {managerStats.pool.totalMaterials}</div>
        <div>Memory: {managerStats.pool.memoryUsage}</div>
      </div>
    </motion.div>
  )
}

// WebGL capability check
function useWebGLSupport() {
  const [isSupported, setIsSupported] = React.useState<boolean | null>(null)
  
  useEffect(() => {
    let mounted = true
    
    // Check WebGL support
    const checkWebGL = async () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        
        if (mounted) {
          setIsSupported(!!gl)
        }
        
        canvas.remove()
      } catch (error) {
        console.warn('WebGL detection failed:', error)
        if (mounted) {
          setIsSupported(false)
        }
      }
    }
    
    checkWebGL()
    
    return () => {
      mounted = false
    }
  }, [])
  
  return isSupported
}

// Main component
export function ProfessionalBackground({
  preset = 'elegant',
  forceQuality,
  enableAdaptiveQuality = true,
  targetFPS = 60,
  opacity = 0.6,
  layers = 1,
  animationPreset = 'smooth',
  enableInteractivity = false,
  enableParallax = false,
  className = '',
  zIndex = -10,
  fullscreen = true,
  onLoad,
  onError,
  onPerformanceChange,
  showDebugInfo = false,
  showPerformanceStats = false
}: ProfessionalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [performanceStats, setPerformanceStats] = React.useState({
    fps: 60,
    quality: 'high',
    frameTime: 16.67
  })
  const [managerStats, setManagerStats] = React.useState({
    pool: { totalPools: 0, totalMaterials: 0, activeMaterials: 0, memoryUsage: '0KB' },
    animatedMaterials: 0,
    queuedUpdates: 0
  })
  
  // WebGL support detection
  const webglSupported = useWebGLSupport()
  
  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('Professional Background Error:', err)
    setError(err)
    onError?.(err)
  }, [onError])
  
  // Handle successful load
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setError(null)
    onLoad?.()
  }, [onLoad])
  
  // Handle performance updates
  const handlePerformanceChange = useCallback((fps: number, quality: string) => {
    setPerformanceStats(prev => ({
      ...prev,
      fps: Math.round(fps),
      quality,
      frameTime: Math.round((1000 / fps) * 100) / 100
    }))
    onPerformanceChange?.(fps, quality)
  }, [onPerformanceChange])
  
  // Update manager stats for debug display
  useEffect(() => {
    if (!showDebugInfo && !showPerformanceStats) return
    
    const interval = setInterval(() => {
      const manager = ShaderMaterialManager.getInstance()
      setManagerStats(manager.getStats())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [showDebugInfo, showPerformanceStats])
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoaded(false)
  }, [])
  
  // Canvas configuration based on device capabilities
  const canvasConfig = useMemo(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
    const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false
    
    return {
      camera: {
        position: [0, 0, 10] as [number, number, number],
        fov: isMobile ? 75 : isTablet ? 70 : 65,
        near: 0.1,
        far: 100
      },
      gl: {
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance' as const,
        stencil: false,
        depth: false,
        preserveDrawingBuffer: false
      },
      dpr: isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : window.devicePixelRatio || 1,
      performance: { min: 0.2 }
    }
  }, [])
  
  // Early return if WebGL is not supported
  if (webglSupported === false) {
    return (
      <ErrorFallback
        className={fullscreen ? 'fixed inset-0' : className}
        onRetry={handleRetry}
      />
    )
  }
  
  // Loading state while checking WebGL
  if (webglSupported === null) {
    return (
      <LoadingFallback
        className={fullscreen ? 'fixed inset-0' : className}
      />
    )
  }
  
  // Error state
  if (error) {
    return (
      <ErrorFallback
        className={fullscreen ? 'fixed inset-0' : className}
        onRetry={handleRetry}
      />
    )
  }
  
  return (
    <motion.div
      className={`${fullscreen ? 'fixed inset-0' : ''} ${className}`}
      style={{ zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    >
      <WebGLContextRecoveryProvider>
        <ThreeErrorBoundary
          fallbackComponent={() => (
            <ErrorFallback
              className="absolute inset-0"
              onRetry={handleRetry}
            />
          )}
          onError={(error) => handleError(error as any)}
        >
          <Canvas
            ref={canvasRef}
            {...canvasConfig}
            onCreated={() => handleLoad()}
            className="!fixed !inset-0"
            style={{ opacity }}
          >
            <Suspense fallback={null}>
              <AdaptiveBackgroundSystem
                preset={preset}
                forceQuality={forceQuality}
                onPerformanceChange={handlePerformanceChange}
                layers={layers}
                enableInteractivity={enableInteractivity}
                animationPreset={animationPreset}
              />
            </Suspense>
          </Canvas>
        </ThreeErrorBoundary>
      </WebGLContextRecoveryProvider>
      
      {/* Debug overlay */}
      <AnimatePresence>
        {(showDebugInfo || showPerformanceStats) && (
          <DebugOverlay
            performanceStats={performanceStats}
            managerStats={managerStats}
          />
        )}
      </AnimatePresence>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <LoadingFallback className="absolute inset-0" />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ProfessionalBackground