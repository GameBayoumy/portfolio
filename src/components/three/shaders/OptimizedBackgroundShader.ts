/**
 * High-Performance 3D Background Shader System
 * Adaptive quality levels with graceful degradation
 * Target: 60fps on all devices
 */

import * as THREE from 'three';

// Performance levels for adaptive quality
export type ShaderQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface ShaderPerformanceConfig {
  quality: ShaderQuality;
  noiseOctaves: number;
  complexityReduction: number;
  textureSize: number;
  useMobileOptimizations: boolean;
}

// Quality-based configurations
export const SHADER_PERFORMANCE_CONFIGS: Record<ShaderQuality, ShaderPerformanceConfig> = {
  low: {
    quality: 'low',
    noiseOctaves: 2,
    complexityReduction: 0.3,
    textureSize: 256,
    useMobileOptimizations: true
  },
  medium: {
    quality: 'medium',
    noiseOctaves: 3,
    complexityReduction: 0.6,
    textureSize: 512,
    useMobileOptimizations: false
  },
  high: {
    quality: 'high',
    noiseOctaves: 4,
    complexityReduction: 0.85,
    textureSize: 1024,
    useMobileOptimizations: false
  },
  ultra: {
    quality: 'ultra',
    noiseOctaves: 6,
    complexityReduction: 1.0,
    textureSize: 2048,
    useMobileOptimizations: false
  }
};

// Optimized vertex shader - minimal computations
export const OptimizedVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Ultra-lightweight vertex shader for mobile
export const MobileVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// High-performance fragment shader with adaptive quality
export const OptimizedFragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uSpeed;
  uniform float uComplexity;
  uniform float uWaveAmplitude;
  uniform int uQuality;
  uniform float uFrameTime;
  uniform bool uMobileMode;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Optimized hash function for noise generation
  float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }
  
  // Ultra-fast 2D noise
  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Quintic interpolation for smoothness
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    
    return mix(
      mix(a, b, f.x),
      mix(c, d, f.x),
      f.y
    );
  }
  
  // 3D noise using 2D noise for performance
  float noise3D(vec3 p) {
    return noise2D(p.xy + p.z * 0.1);
  }
  
  // Fractional Brownian Motion with early termination
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * noise3D(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  // Mobile-optimized FBM using simple patterns
  float mobileFbm(vec2 p) {
    float value = 0.0;
    value += sin(p.x * 3.0) * cos(p.y * 2.0) * 0.5;
    value += sin(p.x * 6.0 + 1.0) * cos(p.y * 4.0 + 1.0) * 0.25;
    return value;
  }
  
  // Quality-adaptive aurora effect
  vec3 computeAurora(vec2 uv, float time) {
    if (uMobileMode) {
      // Ultra-simplified mobile version
      vec2 p = uv * 2.0 - 1.0;
      float wave1 = sin(p.x * 4.0 + time * uSpeed) * 0.5 + 0.5;
      float wave2 = cos(p.y * 3.0 + time * uSpeed * 0.7) * 0.5 + 0.5;
      return mix(uColorA, uColorB, wave1 * wave2) * uIntensity;
    }
    
    vec3 pos = vec3(uv * 2.0 - 1.0, time * uSpeed * 0.1);
    int octaves = uQuality == 0 ? 2 : uQuality == 1 ? 3 : 4;
    
    float noise1 = fbm(pos * uComplexity, octaves);
    float aurora1 = smoothstep(-0.2, 0.8, noise1);
    
    vec3 color = uColorA * aurora1;
    
    if (uQuality > 0) {
      float noise2 = fbm(pos * uComplexity * 1.2 + vec3(100.0), octaves);
      float aurora2 = smoothstep(0.0, 0.6, noise2);
      color = mix(color, uColorB, aurora2 * 0.7);
    }
    
    if (uQuality > 1) {
      float noise3 = fbm(pos * uComplexity * 0.8 + vec3(200.0), octaves);
      float aurora3 = smoothstep(0.1, 0.9, noise3);
      color = mix(color, uColorC, aurora3 * 0.5);
    }
    
    return color * uIntensity;
  }
  
  // Simplified fluid waves for performance
  vec3 computeFluidWaves(vec2 uv, float time) {
    if (uMobileMode) {
      vec2 p = uv * 3.0;
      float wave = sin(p.x + time * uSpeed) * cos(p.y + time * uSpeed * 0.8);
      return mix(uColorA, uColorB, (wave + 1.0) * 0.5) * uIntensity * 0.3;
    }
    
    vec2 p = uv * 3.0;
    int octaves = max(2, uQuality);
    
    vec2 q = vec2(
      fbm(vec3(p, time * uSpeed * 0.05), octaves),
      fbm(vec3(p + vec2(1.7, 4.6), time * uSpeed * 0.05), octaves)
    );
    
    float f = fbm(vec3(p + 2.0 * q, time * uSpeed * 0.03), octaves);
    vec3 color = mix(uColorA, uColorB, clamp(f * 2.0, 0.0, 1.0));
    
    if (uQuality > 1) {
      vec2 r = vec2(
        fbm(vec3(p + 3.0 * q + vec2(0.7, 2.3), time * uSpeed * 0.02), octaves)
      );
      color = mix(color, uColorC, clamp(length(r), 0.0, 1.0) * 0.3);
    }
    
    return color * uIntensity;
  }
  
  // Performance-optimized main function
  void main() {
    vec2 uv = vUv;
    float time = uTime;
    
    // Early exit for extreme performance mode
    if (uQuality < 0) {
      float simple = sin(uv.x * 6.28 + time * uSpeed) * cos(uv.y * 6.28 + time * uSpeed * 0.7);
      vec3 color = mix(uColorA, uColorB, (simple + 1.0) * 0.5);
      gl_FragColor = vec4(color * uIntensity, 0.6);
      return;
    }
    
    // Compute effects based on quality level
    vec3 auroraColor = computeAurora(uv, time);
    vec3 finalColor = auroraColor;
    
    if (uQuality > 0 && !uMobileMode) {
      vec3 fluidColor = computeFluidWaves(uv, time);
      finalColor = auroraColor * 0.7 + fluidColor * 0.3;
    }
    
    // Optional wave distortion for high quality
    if (uQuality > 1 && !uMobileMode) {
      float wave = sin(vPosition.x * 1.5 + time * uSpeed) * 
                   cos(vPosition.y * 2.0 + time * uSpeed * 0.7) * 
                   uWaveAmplitude;
      finalColor += wave * 0.05;
    }
    
    // Subtle depth fog for immersion
    if (uQuality > 0) {
      float depth = length(vPosition * 0.1);
      float fog = 1.0 - exp(-depth);
      finalColor = mix(finalColor, vec3(0.05, 0.1, 0.2), fog * 0.2);
    }
    
    // Efficient color grading
    finalColor = pow(finalColor, vec3(0.9));
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    // Adaptive transparency
    float alpha = uMobileMode ? 0.6 : 0.85;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Ultra-mobile optimized fragment shader
export const UltraMobileFragmentShader = `
  precision lowp float;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  uniform float uSpeed;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    float time = uTime * uSpeed * 0.2;
    
    // Super simple animated pattern
    float pattern1 = sin(uv.x * 8.0 + time);
    float pattern2 = cos(uv.y * 6.0 + time * 0.7);
    float blend = (pattern1 * pattern2 + 1.0) * 0.5;
    
    // Simple color mixing
    vec3 color = mix(uColorA * 0.8, uColorB * 0.6, blend);
    gl_FragColor = vec4(color * uIntensity, 0.5);
  }
`;

// Default uniforms for the optimized shader
export const OptimizedBackgroundUniforms = {
  uTime: { value: 0 },
  uResolution: { 
    value: typeof window !== 'undefined' 
      ? [window.innerWidth, window.innerHeight] 
      : [1920, 1080] 
  },
  uIntensity: { value: 1.0 },
  uColorA: { value: new THREE.Vector3(0.2, 0.4, 0.8) },
  uColorB: { value: new THREE.Vector3(0.8, 0.2, 0.6) },
  uColorC: { value: new THREE.Vector3(0.1, 0.8, 0.4) },
  uSpeed: { value: 1.0 },
  uComplexity: { value: 1.5 },
  uWaveAmplitude: { value: 0.08 },
  uQuality: { value: 2 },
  uFrameTime: { value: 16.67 }, // Target 60fps
  uMobileMode: { value: false }
};

// Shader factory function
export function createOptimizedShaderMaterial(
  quality: ShaderQuality, 
  isMobile: boolean = false
): THREE.ShaderMaterial {
  const config = SHADER_PERFORMANCE_CONFIGS[quality];
  
  let vertexShader: string;
  let fragmentShader: string;
  let uniforms: any;
  
  if (isMobile || quality === 'low') {
    vertexShader = MobileVertexShader;
    fragmentShader = config.useMobileOptimizations ? UltraMobileFragmentShader : OptimizedFragmentShader;
    uniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Vector3(0.2, 0.4, 0.8) },
      uColorB: { value: new THREE.Vector3(0.8, 0.2, 0.6) },
      uIntensity: { value: 0.8 },
      uSpeed: { value: 1.0 }
    };
    
    if (!config.useMobileOptimizations) {
      uniforms = { ...OptimizedBackgroundUniforms };
      uniforms.uMobileMode.value = true;
      uniforms.uQuality.value = 0;
    }
  } else {
    vertexShader = OptimizedVertexShader;
    fragmentShader = OptimizedFragmentShader;
    uniforms = { ...OptimizedBackgroundUniforms };
    uniforms.uQuality.value = quality === 'medium' ? 1 : quality === 'high' ? 2 : 3;
    uniforms.uMobileMode.value = false;
  }
  
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
  });
  
  // Performance optimizations
  material.needsUpdate = false;
  
  return material;
}

// Performance monitoring utilities
export interface ShaderPerformanceMetrics {
  frameTime: number;
  fps: number;
  quality: ShaderQuality;
  recommendedQuality: ShaderQuality;
}

export class ShaderPerformanceMonitor {
  private frameTimeSamples: number[] = [];
  private lastFrameTime = 0;
  private sampleCount = 60; // 1 second at 60fps
  
  update(currentTime: number): ShaderPerformanceMetrics {
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimeSamples.push(frameTime);
      
      if (this.frameTimeSamples.length > this.sampleCount) {
        this.frameTimeSamples.shift();
      }
    }
    
    this.lastFrameTime = currentTime;
    
    const avgFrameTime = this.frameTimeSamples.length > 0
      ? this.frameTimeSamples.reduce((a, b) => a + b, 0) / this.frameTimeSamples.length
      : 16.67;
    
    const fps = 1000 / avgFrameTime;
    const quality = this.getCurrentQuality(fps);
    const recommendedQuality = this.getRecommendedQuality(fps);
    
    return {
      frameTime: avgFrameTime,
      fps,
      quality,
      recommendedQuality
    };
  }
  
  private getCurrentQuality(fps: number): ShaderQuality {
    if (fps >= 50) return 'ultra';
    if (fps >= 40) return 'high';
    if (fps >= 30) return 'medium';
    return 'low';
  }
  
  private getRecommendedQuality(fps: number): ShaderQuality {
    // Conservative recommendations with hysteresis
    if (fps < 25) return 'low';
    if (fps < 35) return 'medium';
    if (fps < 45) return 'high';
    return 'ultra';
  }
}

export const shaderPerformanceMonitor = new ShaderPerformanceMonitor();