'use client'

import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'
import {
  createOptimizedShaderMaterial,
  ShaderQuality,
  SHADER_PERFORMANCE_CONFIGS,
  shaderPerformanceMonitor,
  ShaderPerformanceMetrics
} from './shaders/OptimizedBackgroundShader'

interface OptimizedArtisticBackgroundProps {
  intensity?: number
  speed?: number
  complexity?: number
  waveAmplitude?: number
  colorScheme?: 'aurora' | 'ocean' | 'nebula' | 'sunset'
  initialQuality?: ShaderQuality
  adaptiveQuality?: boolean
  onPerformanceChange?: (metrics: ShaderPerformanceMetrics) => void
}

const colorSchemes = {
  aurora: {
    colorA: new THREE.Vector3(0.2, 0.4, 0.8),   // Deep blue
    colorB: new THREE.Vector3(0.8, 0.2, 0.6),   // Purple
    colorC: new THREE.Vector3(0.1, 0.8, 0.4)    // Green
  },
  ocean: {
    colorA: new THREE.Vector3(0.0, 0.2, 0.4),   // Deep ocean blue
    colorB: new THREE.Vector3(0.1, 0.4, 0.7),   // Ocean blue
    colorC: new THREE.Vector3(0.3, 0.8, 0.8)    // Cyan
  },
  nebula: {
    colorA: new THREE.Vector3(0.6, 0.1, 0.4),   // Deep purple
    colorB: new THREE.Vector3(0.9, 0.3, 0.1),   // Orange
    colorC: new THREE.Vector3(0.2, 0.1, 0.6)    // Violet
  },
  sunset: {
    colorA: new THREE.Vector3(0.9, 0.4, 0.1),   // Orange
    colorB: new THREE.Vector3(0.9, 0.7, 0.2),   // Yellow
    colorC: new THREE.Vector3(0.8, 0.2, 0.3)    // Red-pink
  }
}

// Device capability detection
function detectDeviceCapabilities() {
  if (typeof navigator === 'undefined') return { mobile: false, gpu: 'high' };
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // GPU tier detection
  let gpu: 'low' | 'medium' | 'high' = 'medium';
  if (mobile) {
    gpu = 'low';
  } else if (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) {
    gpu = 'high';
  }
  
  return { mobile, gpu };
}

export function OptimizedArtisticBackground({
  intensity = 1.0,
  speed = 1.0,
  complexity = 1.5,
  waveAmplitude = 0.08,
  colorScheme = 'aurora',
  initialQuality,
  adaptiveQuality = true,
  onPerformanceChange
}: OptimizedArtisticBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const performanceRef = useRef<ShaderPerformanceMetrics | null>(null)
  const lastQualityChange = useRef(0)
  const frameCount = useRef(0)
  
  const { size, viewport } = useThree()
  
  // Device capabilities detection
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), [])
  
  // Determine initial quality based on device capabilities
  const getInitialQuality = useCallback((): ShaderQuality => {
    if (initialQuality) return initialQuality;
    
    if (deviceCapabilities.mobile) return 'low';
    if (deviceCapabilities.gpu === 'high') return 'high';
    return 'medium';
  }, [initialQuality, deviceCapabilities])
  
  // Current quality state
  const [currentQuality, setCurrentQuality] = React.useState<ShaderQuality>(getInitialQuality)
  const [isMobile] = React.useState(deviceCapabilities.mobile)
  
  // Optimized shader material with memoization
  const shaderMaterial = useMemo(() => {
    const colors = colorSchemes[colorScheme]
    const material = createOptimizedShaderMaterial(currentQuality, isMobile)
    
    // Update uniforms efficiently
    if (material.uniforms.uIntensity) material.uniforms.uIntensity.value = intensity
    if (material.uniforms.uSpeed) material.uniforms.uSpeed.value = speed
    if (material.uniforms.uComplexity) material.uniforms.uComplexity.value = complexity
    if (material.uniforms.uWaveAmplitude) material.uniforms.uWaveAmplitude.value = waveAmplitude
    if (material.uniforms.uColorA) material.uniforms.uColorA.value = colors.colorA
    if (material.uniforms.uColorB) material.uniforms.uColorB.value = colors.colorB
    if (material.uniforms.uColorC) material.uniforms.uColorC.value = colors.colorC
    
    materialRef.current = material
    return material
  }, [currentQuality, isMobile, intensity, speed, complexity, waveAmplitude, colorScheme])
  
  // Optimized geometry with LOD
  const geometry = useMemo(() => {
    const config = SHADER_PERFORMANCE_CONFIGS[currentQuality]
    const segments = isMobile ? 8 : 
      currentQuality === 'low' ? 12 :
      currentQuality === 'medium' ? 16 :
      currentQuality === 'high' ? 24 : 32
    
    return new THREE.PlaneGeometry(20, 20, segments, segments)
  }, [currentQuality, isMobile])
  
  // Efficient uniform updates with batching
  const updateUniforms = useCallback((state: any) => {
    if (!materialRef.current?.uniforms) return
    
    const uniforms = materialRef.current.uniforms
    const time = state.clock.elapsedTime
    
    // Batch uniform updates
    if (uniforms.uTime) uniforms.uTime.value = time
    
    if (uniforms.uResolution) {
      const width = size.width * viewport.dpr
      const height = size.height * viewport.dpr
      uniforms.uResolution.value = [width, height]
    }
    
    // Update frame time for performance monitoring
    if (uniforms.uFrameTime) {
      uniforms.uFrameTime.value = state.clock.getDelta() * 1000
    }
  }, [size.width, size.height, viewport.dpr])
  
  // Quality adjustment based on performance
  const adjustQuality = useCallback((metrics: ShaderPerformanceMetrics) => {
    if (!adaptiveQuality) return
    
    const now = Date.now()
    // Prevent frequent quality changes (minimum 2 seconds apart)
    if (now - lastQualityChange.current < 2000) return
    
    const targetFps = isMobile ? 30 : 60
    const fpsThreshold = targetFps * 0.8 // 80% of target
    
    if (metrics.fps < fpsThreshold && currentQuality !== 'low') {
      // Decrease quality
      const qualityLevels: ShaderQuality[] = ['low', 'medium', 'high', 'ultra']
      const currentIndex = qualityLevels.indexOf(currentQuality)
      if (currentIndex > 0) {
        const newQuality = qualityLevels[currentIndex - 1]
        setCurrentQuality(newQuality)
        lastQualityChange.current = now
        console.log(`🎮 Performance: Reduced quality to ${newQuality} (FPS: ${metrics.fps.toFixed(1)})`)
      }
    } else if (metrics.fps > targetFps * 1.1 && currentQuality !== 'ultra') {
      // Increase quality (be more conservative)
      const qualityLevels: ShaderQuality[] = ['low', 'medium', 'high', 'ultra']
      const currentIndex = qualityLevels.indexOf(currentQuality)
      if (currentIndex < qualityLevels.length - 1 && metrics.fps > targetFps * 1.2) {
        const newQuality = qualityLevels[currentIndex + 1]
        setCurrentQuality(newQuality)
        lastQualityChange.current = now
        console.log(`🎮 Performance: Increased quality to ${newQuality} (FPS: ${metrics.fps.toFixed(1)})`)
      }
    }
  }, [adaptiveQuality, currentQuality, isMobile])
  
  // Performance monitoring frame loop
  useFrame((state) => {
    frameCount.current++
    
    // Update uniforms efficiently
    updateUniforms(state)
    
    // Performance monitoring (sample every 10 frames to reduce overhead)
    if (frameCount.current % 10 === 0) {
      const metrics = shaderPerformanceMonitor.update(performance.now())
      performanceRef.current = metrics
      
      // Quality adjustment
      adjustQuality(metrics)
      
      // Callback for external monitoring
      if (onPerformanceChange) {
        onPerformanceChange(metrics)
      }
    }
  })
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (materialRef.current) {
        materialRef.current.dispose()
      }
      if (geometry) {
        geometry.dispose()
      }
    }
  }, [geometry])
  
  // Render optimized planes based on quality level
  const renderPlanes = () => {
    const planes = [
      {
        args: [20, 20, 0, 0] as [number, number, number, number],
        position: [0, 0, -8] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      }
    ]
    
    // Add depth layers only for higher quality settings
    if (currentQuality === 'medium' || currentQuality === 'high' || currentQuality === 'ultra') {
      planes.push({
        args: [15, 15, 0, 0] as [number, number, number, number],
        position: [2, -1, -6] as [number, number, number],
        rotation: [0, 0, Math.PI / 6] as [number, number, number]
      })
    }
    
    if (currentQuality === 'high' || currentQuality === 'ultra') {
      planes.push({
        args: [12, 12, 0, 0] as [number, number, number, number],
        position: [-1, 2, -4] as [number, number, number],
        rotation: [0, 0, -Math.PI / 8] as [number, number, number]
      })
    }
    
    return planes.map((plane, index) => (
      <Plane
        key={index}
        ref={index === 0 ? meshRef : undefined}
        args={plane.args}
        material={shaderMaterial}
        position={plane.position}
        rotation={plane.rotation}
        geometry={index === 0 ? geometry : undefined}
      />
    ))
  }
  
  return <>{renderPlanes()}</>
}

// Interactive version with mouse responsiveness and automatic transitions
export function InteractiveOptimizedArtisticBackground(props: Partial<OptimizedArtisticBackgroundProps>) {
  const [config, setConfig] = React.useState({
    intensity: 1.0,
    speed: 1.0,
    complexity: 1.5,
    waveAmplitude: 0.08,
    colorScheme: 'aurora' as keyof typeof colorSchemes
  })
  
  const [performanceMetrics, setPerformanceMetrics] = React.useState<ShaderPerformanceMetrics | null>(null)
  const interactionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastInteraction = useRef(0)
  
  // Cycle through color schemes
  useEffect(() => {
    const schemes = Object.keys(colorSchemes) as (keyof typeof colorSchemes)[]
    let currentIndex = 0
    
    const interval = setInterval(() => {
      // Only change if no recent interaction
      if (Date.now() - lastInteraction.current > 10000) {
        currentIndex = (currentIndex + 1) % schemes.length
        setConfig(prev => ({
          ...prev,
          colorScheme: schemes[currentIndex]
        }))
      }
    }, 20000) // Change every 20 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Mouse interaction with debouncing
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let rafId: number
    
    const handleMouseMove = (event: MouseEvent) => {
      lastInteraction.current = Date.now()
      
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1
        const y = -(event.clientY / window.innerHeight) * 2 + 1
        
        interactionRef.current = { x, y }
        
        setConfig(prev => ({
          ...prev,
          intensity: 0.8 + Math.abs(x) * 0.3,
          speed: 0.8 + Math.abs(y) * 0.4,
          complexity: 1.2 + (Math.abs(x) + Math.abs(y)) * 0.4
        }))
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])
  
  const handlePerformanceChange = useCallback((metrics: ShaderPerformanceMetrics) => {
    setPerformanceMetrics(metrics)
  }, [])
  
  return (
    <>
      <OptimizedArtisticBackground 
        {...config} 
        {...props}
        adaptiveQuality={true}
        onPerformanceChange={handlePerformanceChange}
      />
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/70 text-white text-xs px-3 py-2 rounded-lg font-mono">
          <div>FPS: {performanceMetrics.fps.toFixed(1)}</div>
          <div>Quality: {performanceMetrics.quality}</div>
          <div>Frame Time: {performanceMetrics.frameTime.toFixed(1)}ms</div>
        </div>
      )}
    </>
  )
}

export default OptimizedArtisticBackground