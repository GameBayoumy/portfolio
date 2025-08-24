'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats, PerformanceMonitor } from '@react-three/drei'
import { InteractiveArtisticBackground } from './ArtisticBackground'
import { motion } from 'framer-motion'

interface BackgroundVisualizerProps {
  className?: string
  showControls?: boolean
  showStats?: boolean
  interactive?: boolean
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">Loading 3D Background...</div>
      </div>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-center h-full">
        <div className="text-white/70 text-sm">3D Background unavailable</div>
      </div>
    </div>
  )
}

export function BackgroundVisualizer({
  className = '',
  showControls = false,
  showStats = false,
  interactive = true
}: BackgroundVisualizerProps) {
  const [performanceLevel, setPerformanceLevel] = React.useState<'high' | 'medium' | 'low'>('high')
  const [isWebGLSupported, setIsWebGLSupported] = React.useState(true)

  // Check WebGL support
  React.useEffect(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setIsWebGLSupported(false)
    }
  }, [])

  if (!isWebGLSupported) {
    return <ErrorFallback />
  }

  return (
    <motion.div
      className={`fixed inset-0 -z-10 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: performanceLevel === 'high',
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false
        }}
        dpr={performanceLevel === 'high' ? 2 : 1}
        performance={{ min: 0.2 }}
        className="!fixed !inset-0"
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={() => setPerformanceLevel('high')}
            onDecline={() => setPerformanceLevel('medium')}
            onFallback={() => setPerformanceLevel('low')}
          >
            {interactive ? (
              <InteractiveArtisticBackground />
            ) : (
              <InteractiveArtisticBackground />
            )}
            
            {showControls && (
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                autoRotate={true}
                autoRotateSpeed={0.5}
                maxDistance={15}
                minDistance={3}
              />
            )}
          </PerformanceMonitor>
        </Suspense>
        
        {showStats && <Stats />}
      </Canvas>

      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Performance: {performanceLevel}
        </div>
      )}
    </motion.div>
  )
}

export default BackgroundVisualizer