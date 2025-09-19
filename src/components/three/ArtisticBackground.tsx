"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Plane } from "@react-three/drei"
import * as THREE from "three"
import {
    ArtisticBackgroundVertexShader,
    ArtisticBackgroundFragmentShader,
    ArtisticBackgroundUniforms,
} from "./shaders/ArtisticBackgroundShader"

interface ArtisticBackgroundProps {
    intensity?: number
    speed?: number
    complexity?: number
    waveAmplitude?: number
    colorScheme?: "portfolio" | "aurora" | "ocean" | "nebula" | "sunset" | "cosmic" | "ethereal"
    distortionStrength?: number
    elevation?: number
    glowIntensity?: number
    contrastBoost?: number
    saturationBoost?: number
    brightnessBoost?: number
    ambientStrength?: number
    specularStrength?: number
    shininess?: number
    fresnelStrength?: number
    depthFade?: number
    edgeGlow?: number
    holographicEffect?: number
    performanceLevel?: "low" | "medium" | "high" | "ultra"
    responsiveOptimizations?: boolean
}

const colorSchemes = {
    portfolio: {
        // Neon palette used across the portfolio
        colorA: [0.0, 0.94, 1.0], // Neon teal
        colorB: [0.5, 0.0, 1.0],  // Electric purple
        colorC: [1.0, 0.0, 0.5],  // Neon pink
        colorD: [0.0, 0.8, 0.9],  // Soft cyan accent
    },
    aurora: {
        colorA: [0.2, 0.4, 0.8], // Deep blue
        colorB: [0.8, 0.2, 0.6], // Purple
        colorC: [0.1, 0.8, 0.4], // Green
        colorD: [0.9, 0.5, 0.1], // Orange accent
    },
    ocean: {
        colorA: [0.0, 0.2, 0.4], // Deep ocean blue
        colorB: [0.1, 0.4, 0.7], // Ocean blue
        colorC: [0.3, 0.8, 0.8], // Cyan
        colorD: [0.1, 0.9, 0.6], // Aqua accent
    },
    nebula: {
        colorA: [0.6, 0.1, 0.4], // Deep purple
        colorB: [0.9, 0.3, 0.1], // Orange
        colorC: [0.2, 0.1, 0.6], // Violet
        colorD: [0.9, 0.1, 0.3], // Pink accent
    },
    sunset: {
        colorA: [0.9, 0.4, 0.1], // Orange
        colorB: [0.9, 0.7, 0.2], // Yellow
        colorC: [0.8, 0.2, 0.3], // Red-pink
        colorD: [1.0, 0.8, 0.4], // Golden accent
    },
    cosmic: {
        colorA: [0.1, 0.1, 0.3], // Deep space blue
        colorB: [0.4, 0.1, 0.8], // Purple
        colorC: [0.8, 0.4, 0.9], // Magenta
        colorD: [0.2, 0.8, 0.9], // Cosmic blue
    },
    ethereal: {
        colorA: [0.9, 0.9, 1.0], // Pure white
        colorB: [0.7, 0.8, 0.9], // Light blue
        colorC: [0.8, 0.7, 0.9], // Light purple
        colorD: [0.9, 0.8, 0.7], // Warm white
    },
}

export function ArtisticBackground({
    intensity = 1.0,
    speed = 1.0,
    complexity = 2.0,
    waveAmplitude = 0.1,
    colorScheme = "portfolio",
    distortionStrength = 0.15,
    elevation = 0.2,
    glowIntensity = 0.7,
    contrastBoost = 1.2,
    saturationBoost = 1.1,
    brightnessBoost = 1.05,
    ambientStrength = 0.3,
    specularStrength = 0.5,
    shininess = 32.0,
    fresnelStrength = 1.5,
    depthFade = 0.02,
    edgeGlow = 2.0,
    holographicEffect = 0.3,
    performanceLevel = "high",
    responsiveOptimizations = true,
}: ArtisticBackgroundProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Performance optimization based on level
    const performanceSettings = useMemo(() => {
        const settings = {
            low: {
                segments: [8, 8],
                layers: 1,
                blending: THREE.NormalBlending,
                complexity: Math.min(complexity, 1.0),
                glowIntensity: glowIntensity * 0.5,
            },
            medium: {
                segments: [16, 16],
                layers: 2,
                blending: THREE.AdditiveBlending,
                complexity: Math.min(complexity, 1.5),
                glowIntensity: glowIntensity * 0.7,
            },
            high: {
                segments: [32, 32],
                layers: 3,
                blending: THREE.AdditiveBlending,
                complexity: complexity,
                glowIntensity: glowIntensity,
            },
            ultra: {
                segments: [64, 64],
                layers: 4,
                blending: THREE.AdditiveBlending,
                complexity: complexity * 1.2,
                glowIntensity: glowIntensity * 1.2,
            },
        }
        return settings[performanceLevel]
    }, [performanceLevel, complexity, glowIntensity])

    // Responsive optimization
    const responsiveSettings = useMemo(() => {
        if (!responsiveOptimizations || typeof window === "undefined") {
            return { scale: 1.0, pixelRatio: 1.0 }
        }

        const width = window.innerWidth
        const dpr = window.devicePixelRatio || 1

        if (width < 768) {
            return { scale: 0.7, pixelRatio: Math.min(dpr, 1.5) }
        } else if (width < 1024) {
            return { scale: 0.85, pixelRatio: Math.min(dpr, 2) }
        } else if (width < 1440) {
            return { scale: 1.0, pixelRatio: dpr }
        } else {
            return { scale: 1.2, pixelRatio: dpr }
        }
    }, [responsiveOptimizations])

    // Create enhanced shader material with all uniforms
    const shaderMaterial = useMemo(() => {
        const colors = colorSchemes[colorScheme]
        const settings = performanceSettings

        return new THREE.ShaderMaterial({
            // vertexShader: ArtisticBackgroundVertexShader,
            fragmentShader: ArtisticBackgroundFragmentShader,
            uniforms: {
                ...ArtisticBackgroundUniforms,
                uIntensity: { value: intensity },
                uSpeed: { value: speed },
                uComplexity: { value: settings.complexity },
                uWaveAmplitude: { value: waveAmplitude },
                uDistortionStrength: { value: distortionStrength },
                uElevation: { value: elevation },
                uGlowIntensity: { value: settings.glowIntensity },
                uContrastBoost: { value: contrastBoost },
                uSaturationBoost: { value: saturationBoost },
                uBrightnessBoost: { value: brightnessBoost },
                uColorA: { value: colors.colorA },
                uColorB: { value: colors.colorB },
                uColorC: { value: colors.colorC },
                uColorD: { value: colors.colorD },
                uLightDirection: { value: [0.5, 0.8, 0.3] },
                uLightColor: { value: [1.0, 0.98, 0.95] },
                uAmbientStrength: { value: ambientStrength },
                uSpecularStrength: { value: specularStrength },
                uShininess: { value: shininess },
                uFresnelStrength: { value: fresnelStrength },
                uDepthFade: { value: depthFade },
                uEdgeGlow: { value: edgeGlow },
                uHolographicEffect: { value: holographicEffect },
            },
            transparent: true,
            side: THREE.DoubleSide,
            blending: settings.blending,
            depthWrite: false,
            depthTest: true,
        })
    }, [
        intensity,
        speed,
        complexity,
        waveAmplitude,
        colorScheme,
        distortionStrength,
        elevation,
        glowIntensity,
        contrastBoost,
        saturationBoost,
        brightnessBoost,
        ambientStrength,
        specularStrength,
        shininess,
        fresnelStrength,
        depthFade,
        edgeGlow,
        holographicEffect,
        performanceSettings,
    ])

    // Update shader uniforms on each frame
    useFrame((state) => {
        if (shaderMaterial && shaderMaterial.uniforms) {
            shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
            shaderMaterial.uniforms.uResolution.value = [
                state.size.width * state.viewport.dpr,
                state.size.height * state.viewport.dpr,
            ]
        }
    })

    // Calculate layer configurations based on performance
    const layerConfigs = useMemo(() => {
        const baseScale = responsiveSettings.scale
        const segments = performanceSettings.segments
        const layerCount = performanceSettings.layers

        const configs = [
            {
                scale: [20 * baseScale, 20 * baseScale],
                segments: segments,
                position: [0, 0, -8],
                rotation: [0, 0, 0],
                opacity: 1.0,
            },
        ]

        if (layerCount > 1) {
            configs.push({
                scale: [15 * baseScale, 15 * baseScale],
                segments: [segments[0] * 0.7, segments[1] * 0.7],
                position: [2 * baseScale, -1 * baseScale, -6],
                rotation: [0, 0, Math.PI / 6],
                opacity: 0.7,
            })
        }

        if (layerCount > 2) {
            configs.push({
                scale: [12 * baseScale, 12 * baseScale],
                segments: [segments[0] * 0.5, segments[1] * 0.5],
                position: [-1 * baseScale, 2 * baseScale, -4],
                rotation: [0, 0, -Math.PI / 8],
                opacity: 0.5,
            })
        }

        if (layerCount > 3) {
            configs.push({
                scale: [8 * baseScale, 8 * baseScale],
                segments: [segments[0] * 0.3, segments[1] * 0.3],
                position: [1.5 * baseScale, -2 * baseScale, -2],
                rotation: [0, 0, Math.PI / 4],
                opacity: 0.3,
            })
        }

        return configs
    }, [performanceSettings, responsiveSettings])

    return (
        <>
            {layerConfigs.map((config, index) => {
                // Create material clone with opacity adjustment for layers
                const layerMaterial = shaderMaterial.clone()
                layerMaterial.uniforms = { ...shaderMaterial.uniforms }
                layerMaterial.uniforms.uIntensity = {
                    value: intensity * config.opacity,
                }

                return (
                    <Plane
                        key={index}
                        ref={index === 0 ? meshRef : undefined}
                        args={[
                            config.scale[0],
                            config.scale[1],
                            Math.floor(config.segments[0]),
                            Math.floor(config.segments[1]),
                        ]}
                        material={layerMaterial}
                        position={config.position as [number, number, number]}
                        rotation={config.rotation as [number, number, number]}
                    />
                )
            })}
        </>
    )
}

// Interactive Background with controls
export function InteractiveArtisticBackground() {
    const [config, setConfig] = React.useState({
        intensity: 1.0,
        speed: 1.0,
        complexity: 2.0,
        waveAmplitude: 0.1,
        colorScheme: "portfolio" as keyof typeof colorSchemes,
    })

    // Cycle through color schemes automatically
    React.useEffect(() => {
        const schemes = Object.keys(colorSchemes) as (keyof typeof colorSchemes)[]
        let currentIndex = 0

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % schemes.length
            setConfig((prev) => ({
                ...prev,
                colorScheme: schemes[currentIndex],
            }))
        }, 15000) // Change every 15 seconds

        return () => clearInterval(interval)
    }, [])

    // Respond to mouse movement for interactivity
    React.useEffect(() => {
        if (typeof window === "undefined") return

        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1
            const y = -(event.clientY / window.innerHeight) * 2 + 1

            setConfig((prev) => ({
                ...prev,
                intensity: 0.8 + Math.abs(x) * 0.4,
                speed: 0.8 + Math.abs(y) * 0.6,
                complexity: 1.5 + (Math.abs(x) + Math.abs(y)) * 0.5,
            }))
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [setConfig])

    return <ArtisticBackground {...config} />
}

export default ArtisticBackground
