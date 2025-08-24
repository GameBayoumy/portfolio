'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'
import {
  ArtisticBackgroundVertexShader,
  ArtisticBackgroundFragmentShader,
  ArtisticBackgroundUniforms
} from './shaders/ArtisticBackgroundShader'

interface ArtisticBackgroundProps {
  intensity?: number
  speed?: number
  complexity?: number
  waveAmplitude?: number
  colorScheme?: 'aurora' | 'ocean' | 'nebula' | 'sunset'
}

const colorSchemes = {
  aurora: {
    colorA: [0.2, 0.4, 0.8],   // Deep blue
    colorB: [0.8, 0.2, 0.6],   // Purple
    colorC: [0.1, 0.8, 0.4]    // Green
  },
  ocean: {
    colorA: [0.0, 0.2, 0.4],   // Deep ocean blue
    colorB: [0.1, 0.4, 0.7],   // Ocean blue
    colorC: [0.3, 0.8, 0.8]    // Cyan
  },
  nebula: {
    colorA: [0.6, 0.1, 0.4],   // Deep purple
    colorB: [0.9, 0.3, 0.1],   // Orange
    colorC: [0.2, 0.1, 0.6]    // Violet
  },
  sunset: {
    colorA: [0.9, 0.4, 0.1],   // Orange
    colorB: [0.9, 0.7, 0.2],   // Yellow
    colorC: [0.8, 0.2, 0.3]    // Red-pink
  }
}

export function ArtisticBackground({
  intensity = 1.0,
  speed = 1.0,
  complexity = 2.0,
  waveAmplitude = 0.1,
  colorScheme = 'aurora'
}: ArtisticBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Create shader material with custom uniforms
  const shaderMaterial = useMemo(() => {
    const colors = colorSchemes[colorScheme]
    
    return new THREE.ShaderMaterial({
      vertexShader: ArtisticBackgroundVertexShader,
      fragmentShader: ArtisticBackgroundFragmentShader,
      uniforms: {
        ...ArtisticBackgroundUniforms,
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uComplexity: { value: complexity },
        uWaveAmplitude: { value: waveAmplitude },
        uColorA: { value: colors.colorA },
        uColorB: { value: colors.colorB },
        uColorC: { value: colors.colorC }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [intensity, speed, complexity, waveAmplitude, colorScheme])

  // Update shader uniforms on each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uResolution.value = [
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      ]
    }
  })

  return (
    <group>
      {/* Main background plane */}
      <Plane
        ref={meshRef}
        args={[20, 20, 64, 64]}
        material={shaderMaterial}
        position={[0, 0, -8]}
      />
      
      {/* Additional layers for depth */}
      <Plane
        args={[15, 15, 32, 32]}
        material={shaderMaterial}
        position={[2, -1, -6]}
        rotation={[0, 0, Math.PI / 6]}
      />
      
      <Plane
        args={[12, 12, 24, 24]}
        material={shaderMaterial}
        position={[-1, 2, -4]}
        rotation={[0, 0, -Math.PI / 8]}
      />
      
      <mesh ref={materialRef} />
    </group>
  )
}

// Interactive Background with controls
export function InteractiveArtisticBackground() {
  const [config, setConfig] = React.useState({
    intensity: 1.0,
    speed: 1.0,
    complexity: 2.0,
    waveAmplitude: 0.1,
    colorScheme: 'aurora' as keyof typeof colorSchemes
  })

  // Cycle through color schemes automatically
  React.useEffect(() => {
    const schemes = Object.keys(colorSchemes) as (keyof typeof colorSchemes)[]
    let currentIndex = 0
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % schemes.length
      setConfig(prev => ({
        ...prev,
        colorScheme: schemes[currentIndex]
      }))
    }, 15000) // Change every 15 seconds

    return () => clearInterval(interval)
  }, [])

  // Respond to mouse movement for interactivity
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      
      setConfig(prev => ({
        ...prev,
        intensity: 0.8 + Math.abs(x) * 0.4,
        speed: 0.8 + Math.abs(y) * 0.6,
        complexity: 1.5 + (Math.abs(x) + Math.abs(y)) * 0.5
      }))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return <ArtisticBackground {...config} />
}

export default ArtisticBackground