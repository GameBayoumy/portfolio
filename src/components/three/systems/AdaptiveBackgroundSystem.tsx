/**
 * Adaptive Background System
 * 
 * Provides intelligent quality adaptation, device-specific optimizations,
 * and smooth performance scaling for the improved background shader system.
 */

'use client'

import React, { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'
import {
  ImprovedBackgroundVertexShader,
  ImprovedBackgroundFragmentShader,
  ImprovedBackgroundUniforms,
  ProfessionalPresets,
  QualityConfigs
} from '../shaders/ImprovedBackgroundShader'
import { 
  deviceCapabilities, 
  performanceTier, 
  responsiveConfig, 
  AdaptiveQualityManager 
} from '../config/performance'
import type { PerformanceLevel, PerformanceSettings } from '@/types/visualizer'

// Timing and easing system for smooth animations
class AnimationTimingSystem {
  private startTime: number = 0
  private currentPhase: number = 0
  private phaseTargets: number[] = []
  private phaseProgress: number = 0
  private easingFunction: (t: number) => number
  
  constructor(
    private duration: number = 30000, // 30 seconds per phase
    private phases: number = 4
  ) {
    this.startTime = Date.now()
    this.generatePhaseTargets()
    this.easingFunction = this.easeInOutCubic
  }
  
  private generatePhaseTargets(): void {
    this.phaseTargets = []
    for (let i = 0; i < this.phases; i++) {
      this.phaseTargets.push(Math.random())
    }
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  private easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }
  
  private easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2
  }
  
  public update(time: number): {
    phase: number
    progress: number
    easedProgress: number
    smoothValue: number
  } {
    const elapsed = time - this.startTime
    const totalProgress = (elapsed / this.duration) % 1
    
    const currentPhase = Math.floor(totalProgress * this.phases)
    const phaseProgress = (totalProgress * this.phases) % 1
    const easedProgress = this.easingFunction(phaseProgress)
    
    // Smooth interpolation between phase targets
    const currentTarget = this.phaseTargets[currentPhase]
    const nextTarget = this.phaseTargets[(currentPhase + 1) % this.phases]
    const smoothValue = currentTarget + (nextTarget - currentTarget) * easedProgress
    
    return {
      phase: currentPhase,
      progress: phaseProgress,
      easedProgress,
      smoothValue
    }
  }
  
  public setEasing(type: 'cubic' | 'quart' | 'sine'): void {
    switch (type) {
      case 'cubic': this.easingFunction = this.easeInOutCubic; break
      case 'quart': this.easingFunction = this.easeInOutQuart; break
      case 'sine': this.easingFunction = this.easeInOutSine; break
    }
  }
}

// Performance monitoring and adaptive quality management
class BackgroundPerformanceMonitor {
  private frameCount: number = 0
  private lastFrameTime: number = 0
  private averageFrameTime: number = 16.67 // 60fps target
  private frameTimeHistory: number[] = []
  private qualityManager: AdaptiveQualityManager
  private performanceCallbacks: ((fps: number, frameTime: number) => void)[] = []
  
  constructor(initialSettings: PerformanceSettings) {
    this.qualityManager = new AdaptiveQualityManager(initialSettings)
  }
  
  public update(currentTime: number): {
    fps: number
    frameTime: number
    averageFrameTime: number
    shouldAdjustQuality: boolean
    newSettings?: PerformanceSettings
  } {
    const frameTime = currentTime - this.lastFrameTime
    this.lastFrameTime = currentTime
    this.frameCount++
    
    // Update frame time history
    this.frameTimeHistory.push(frameTime)
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift()
    }
    
    // Calculate average
    this.averageFrameTime = this.frameTimeHistory.reduce((sum, ft) => sum + ft, 0) / this.frameTimeHistory.length
    const fps = 1000 / this.averageFrameTime
    
    // Check for quality adjustments
    const newSettings = this.qualityManager.updatePerformance(fps, frameTime)
    
    // Notify callbacks
    this.performanceCallbacks.forEach(callback => callback(fps, frameTime))
    
    return {
      fps,
      frameTime,
      averageFrameTime: this.averageFrameTime,
      shouldAdjustQuality: newSettings !== null,
      newSettings: newSettings || undefined
    }
  }
  
  public addPerformanceCallback(callback: (fps: number, frameTime: number) => void): void {
    this.performanceCallbacks.push(callback)
  }
  
  public getQualityManager(): AdaptiveQualityManager {
    return this.qualityManager
  }
}

interface AdaptiveBackgroundSystemProps {
  preset?: keyof typeof ProfessionalPresets
  forceQuality?: keyof typeof QualityConfigs
  onPerformanceChange?: (fps: number, quality: string) => void
  className?: string
  layers?: number
  enableInteractivity?: boolean
  animationPreset?: 'subtle' | 'smooth' | 'dynamic'
}

export function AdaptiveBackgroundSystem({
  preset = 'elegant',
  forceQuality,
  onPerformanceChange,
  className,
  layers = 1,
  enableInteractivity = false,
  animationPreset = 'smooth'
}: AdaptiveBackgroundSystemProps) {
  const meshRefs = useRef<THREE.Mesh[]>([])
  const { size, viewport } = useThree()
  
  // System references
  const timingSystemRef = useRef<AnimationTimingSystem>()
  const performanceMonitorRef = useRef<BackgroundPerformanceMonitor>()
  const interactionStateRef = useRef({ mouseX: 0, mouseY: 0, isActive: false })
  
  // State management
  const [currentQuality, setCurrentQuality] = React.useState<keyof typeof QualityConfigs>('high')
  const [performanceMetrics, setPerformanceMetrics] = React.useState({
    fps: 60,
    frameTime: 16.67,
    quality: 'high'
  })
  
  // Initialize systems
  const initializeSystems = useCallback(async () => {
    // Detect device capabilities and performance tier
    const capabilities = await deviceCapabilities.detectCapabilities()
    const tier = await performanceTier.detectPerformanceTier()
    
    // Determine initial quality
    let initialQuality: keyof typeof QualityConfigs
    if (forceQuality) {
      initialQuality = forceQuality
    } else {
      switch (tier) {
        case 'ultra': initialQuality = 'ultra'; break
        case 'high': initialQuality = 'high'; break
        case 'medium': initialQuality = 'medium'; break
        case 'low': 
        default: initialQuality = 'low'; break
      }
    }
    
    setCurrentQuality(initialQuality)
    
    // Initialize timing system with appropriate settings
    const timingDuration = animationPreset === 'subtle' ? 45000 : 
                          animationPreset === 'smooth' ? 30000 : 20000
    timingSystemRef.current = new AnimationTimingSystem(timingDuration, 4)
    
    // Set easing based on preset
    const easingType = animationPreset === 'subtle' ? 'sine' : 
                      animationPreset === 'smooth' ? 'cubic' : 'quart'
    timingSystemRef.current.setEasing(easingType)
    
    // Initialize performance monitor
    const responsiveSettings = responsiveConfig.getResponsivePerformanceSettings()
    const currentBreakpoint = responsiveConfig.getCurrentBreakpoint()
    const initialSettings = {
      ...responsiveSettings.desktop,
      ...QualityConfigs[initialQuality]
    }
    
    performanceMonitorRef.current = new BackgroundPerformanceMonitor(initialSettings as PerformanceSettings)
    
    // Add performance callback
    if (onPerformanceChange) {
      performanceMonitorRef.current.addPerformanceCallback(onPerformanceChange)
    }
  }, [forceQuality, animationPreset, onPerformanceChange])
  
  // Create shader material with responsive uniforms
  const shaderMaterial = useMemo(() => {
    const presetConfig = ProfessionalPresets[preset]
    const qualityConfig = QualityConfigs[currentQuality]
    
    // Responsive adjustments
    const breakpoint = responsiveConfig.getCurrentBreakpoint()
    const isMobile = breakpoint === 'mobile'
    const isTablet = breakpoint === 'tablet'
    
    // Adjust parameters based on device
    const adjustedConfig = {
      ...presetConfig,
      ...qualityConfig,
      uAnimationSpeed: presetConfig.uAnimationSpeed * (isMobile ? 0.7 : 1.0),
      uAnimationIntensity: presetConfig.uAnimationIntensity * (isMobile ? 0.6 : 1.0),
      uFlowSpeed: presetConfig.uFlowSpeed * (isMobile ? 0.5 : 1.0),
      uOpacity: presetConfig.uOpacity * (isMobile ? 0.8 : 1.0),
      uIsMobile: isMobile
    }
    
    return new THREE.ShaderMaterial({
      vertexShader: ImprovedBackgroundVertexShader,
      fragmentShader: ImprovedBackgroundFragmentShader,
      uniforms: {
        ...ImprovedBackgroundUniforms,
        ...Object.fromEntries(
          Object.entries(adjustedConfig).map(([key, value]) => [key, { value }])
        ),
        uScreenSize: { value: [size.width, size.height] },
        uViewportSize: { value: [viewport.width, viewport.height] },
        uPixelRatio: { value: viewport.dpr }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false
    })
  }, [preset, currentQuality, size, viewport])
  
  // Update uniforms on each frame with performance monitoring
  useFrame((state) => {
    if (!timingSystemRef.current || !performanceMonitorRef.current) return
    
    // Update timing system
    const timing = timingSystemRef.current.update(state.clock.elapsedTime * 1000)
    
    // Update performance monitor
    const performance = performanceMonitorRef.current.update(state.clock.elapsedTime * 1000)
    
    // Apply quality adjustments if needed
    if (performance.shouldAdjustQuality && performance.newSettings) {
      // Update quality level based on performance
      const newQuality = performance.newSettings.pixelRatio > 1.5 ? 'high' :
                        performance.newSettings.pixelRatio > 1.0 ? 'medium' : 'low'
      
      if (newQuality !== currentQuality) {
        setCurrentQuality(newQuality as keyof typeof QualityConfigs)
      }
    }
    
    // Update performance metrics for UI
    if (Math.floor(state.clock.elapsedTime) % 2 === 0) { // Update every 2 seconds
      setPerformanceMetrics({
        fps: Math.round(performance.fps),
        frameTime: Math.round(performance.frameTime * 100) / 100,
        quality: currentQuality
      })
    }
    
    // Update shader uniforms
    if (shaderMaterial && shaderMaterial.uniforms) {
      const uniforms = shaderMaterial.uniforms
      
      // Time-based uniforms
      uniforms.uTime.value = state.clock.elapsedTime
      
      // Smooth animation values based on timing system
      const speedModulation = 0.8 + timing.smoothValue * 0.4 // 0.8 to 1.2 range
      const intensityModulation = 0.6 + timing.smoothValue * 0.4 // 0.6 to 1.0 range
      
      uniforms.uAnimationSpeed.value *= speedModulation
      uniforms.uAnimationIntensity.value *= intensityModulation
      
      // Interactivity updates
      if (enableInteractivity && interactionStateRef.current.isActive) {
        const { mouseX, mouseY } = interactionStateRef.current
        uniforms.uFlowSpeed.value *= (1.0 + Math.abs(mouseX) * 0.3)
        uniforms.uAnimationIntensity.value *= (1.0 + Math.abs(mouseY) * 0.2)
      }
      
      // Responsive updates
      uniforms.uScreenSize.value = [size.width, size.height]
      uniforms.uViewportSize.value = [viewport.width, viewport.height]
    }
  })
  
  // Initialize systems on mount
  useEffect(() => {
    initializeSystems()
  }, [initializeSystems])
  
  // Handle mouse interaction
  useEffect(() => {
    if (!enableInteractivity) return
    
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      
      interactionStateRef.current = {
        mouseX: x * 0.5, // Reduce influence for subtlety
        mouseY: y * 0.3,
        isActive: true
      }
    }
    
    const handleMouseLeave = () => {
      interactionStateRef.current.isActive = false
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enableInteractivity])
  
  // Generate layer configurations for depth
  const layerConfigs = useMemo(() => {
    const configs = []
    for (let i = 0; i < layers; i++) {
      const depth = -5 - i * 2 // Spread layers in depth
      const scale = 1.0 + i * 0.3 // Increase scale for background layers
      const opacity = 1.0 - i * 0.2 // Decrease opacity for background layers
      
      configs.push({
        position: [0, 0, depth] as [number, number, number],
        scale: scale,
        opacity: Math.max(0.2, opacity),
        rotation: [0, 0, (Math.PI / 12) * i] as [number, number, number]
      })
    }
    return configs
  }, [layers])
  
  return (
    <>
      {layerConfigs.map((config, index) => (
        <Plane
          key={index}
          ref={(ref) => {
            if (ref && !meshRefs.current[index]) {
              meshRefs.current[index] = ref
            }
          }}
          args={[20 * config.scale, 20 * config.scale, 32, 32]}
          material={shaderMaterial.clone()}
          position={config.position}
          rotation={config.rotation}
        />
      ))}
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[8, 4, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial 
            color={performanceMetrics.fps > 55 ? 'green' : 
                   performanceMetrics.fps > 45 ? 'yellow' : 'red'} 
          />
        </mesh>
      )}
    </>
  )
}

export default AdaptiveBackgroundSystem