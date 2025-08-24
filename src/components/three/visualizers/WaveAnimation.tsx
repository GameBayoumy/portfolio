'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, ShaderMaterial, Mesh, Vector2, Color } from 'three';
import * as THREE from 'three';

interface WaveAnimationProps {
  width?: number;
  height?: number;
  segments?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  interactive?: boolean;
  mouseInfluence?: number;
  waveTypes?: ('sine' | 'cosine' | 'gerstner' | 'noise')[];
  position?: [number, number, number];
  rotation?: [number, number, number];
}

// Wave physics simulation class
class WavePhysics {
  private waves: Array<{
    amplitude: number;
    frequency: number;
    phase: number;
    direction: Vector2;
    steepness: number;
    type: string;
  }>;
  
  private time: number = 0;
  private mousePosition: Vector2 = new Vector2();
  private mouseInfluence: number = 0;
  
  constructor(waveCount: number = 4) {
    this.waves = [];
    this.initializeWaves(waveCount);
  }
  
  private initializeWaves(count: number) {
    for (let i = 0; i < count; i++) {
      this.waves.push({
        amplitude: 0.1 + Math.random() * 0.3,
        frequency: 0.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        direction: new Vector2(
          Math.cos((i / count) * Math.PI * 2),
          Math.sin((i / count) * Math.PI * 2)
        ).normalize(),
        steepness: 0.2 + Math.random() * 0.6,
        type: ['sine', 'gerstner', 'noise'][Math.floor(Math.random() * 3)]
      });
    }
  }
  
  updateTime(deltaTime: number) {
    this.time += deltaTime;
  }
  
  setMousePosition(x: number, y: number) {
    this.mousePosition.set(x, y);
  }
  
  setMouseInfluence(influence: number) {
    this.mouseInfluence = influence;
  }
  
  calculateWaveHeight(x: number, z: number): number {
    let height = 0;
    let dx = 0;
    let dz = 0;
    
    for (const wave of this.waves) {
      const dot = wave.direction.dot(new Vector2(x, z));
      const phase = dot * wave.frequency + this.time + wave.phase;
      
      switch (wave.type) {
        case 'sine':
          height += wave.amplitude * Math.sin(phase);
          break;
        case 'gerstner':
          const gerstnerPhase = Math.sin(phase);
          height += wave.amplitude * gerstnerPhase;
          dx += wave.steepness * wave.amplitude * wave.direction.x * Math.cos(phase);
          dz += wave.steepness * wave.amplitude * wave.direction.y * Math.cos(phase);
          break;
        case 'noise':
          const noiseVal = (Math.sin(phase) + Math.sin(phase * 1.7) * 0.5 + Math.sin(phase * 2.3) * 0.25) / 1.75;
          height += wave.amplitude * noiseVal;
          break;
      }
    }
    
    // Add mouse influence
    if (this.mouseInfluence > 0) {
      const mouseDistance = Math.sqrt(
        Math.pow(x - this.mousePosition.x, 2) + 
        Math.pow(z - this.mousePosition.y, 2)
      );
      const influence = Math.exp(-mouseDistance * 2) * this.mouseInfluence;
      height += influence * Math.sin(this.time * 3) * 0.3;
    }
    
    return height;
  }
  
  getWaveNormal(x: number, z: number, epsilon: number = 0.01): Vector2 {
    const hL = this.calculateWaveHeight(x - epsilon, z);
    const hR = this.calculateWaveHeight(x + epsilon, z);
    const hD = this.calculateWaveHeight(x, z - epsilon);
    const hU = this.calculateWaveHeight(x, z + epsilon);
    
    return new Vector2(hL - hR, hD - hU).normalize();
  }
}

// Advanced water shader
const WaveShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new Color('#006994') },
    uOpacity: { value: 0.8 },
    uAmplitude: { value: 0.2 },
    uFrequency: { value: 1.0 },
    uSpeed: { value: 1.0 },
    uMousePosition: { value: new Vector2() },
    uMouseInfluence: { value: 0.0 },
    uResolution: { value: new Vector2() },
    uWireframe: { value: 0.0 },
    uFoamColor: { value: new Color('#ffffff') },
    uDepthColor: { value: new Color('#001f3f') },
    uSunDirection: { value: new THREE.Vector3(1, 1, 0).normalize() },
  },
  
  vertexShader: `
    uniform float uTime;
    uniform float uAmplitude;
    uniform float uFrequency;
    uniform float uSpeed;
    uniform vec2 uMousePosition;
    uniform float uMouseInfluence;
    uniform vec2 uResolution;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vWorldPosition;
    
    // Noise functions
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // Wave functions
    float gerstnerWave(vec2 direction, float amplitude, float frequency, float phase, vec2 position, float time) {
      float dot_product = dot(direction, position);
      return amplitude * sin(dot_product * frequency + time * uSpeed + phase);
    }
    
    vec3 calculateGerstnerPosition(vec2 position) {
      vec3 gerstnerPos = vec3(position.x, 0.0, position.y);
      float time = uTime * uSpeed;
      
      // Multiple wave layers
      vec2 dir1 = normalize(vec2(1.0, 0.3));
      vec2 dir2 = normalize(vec2(-0.7, 1.0));
      vec2 dir3 = normalize(vec2(0.2, -1.2));
      vec2 dir4 = normalize(vec2(-1.1, -0.4));
      
      float wave1 = gerstnerWave(dir1, uAmplitude * 0.8, uFrequency * 1.2, 0.0, position, time);
      float wave2 = gerstnerWave(dir2, uAmplitude * 0.6, uFrequency * 0.8, 1.5, position, time);
      float wave3 = gerstnerWave(dir3, uAmplitude * 0.4, uFrequency * 2.1, 2.8, position, time);
      float wave4 = gerstnerWave(dir4, uAmplitude * 0.3, uFrequency * 1.7, 4.2, position, time);
      
      // Add noise for more natural look
      float noise1 = snoise(vec3(position * 2.0, time * 0.5)) * uAmplitude * 0.2;
      float noise2 = snoise(vec3(position * 4.0, time * 0.3)) * uAmplitude * 0.1;
      
      float totalHeight = wave1 + wave2 + wave3 + wave4 + noise1 + noise2;
      
      // Mouse influence
      if (uMouseInfluence > 0.0) {
        vec2 mousePos = (uMousePosition - 0.5) * 10.0;
        float mouseDistance = length(position - mousePos);
        float influence = exp(-mouseDistance * 0.5) * uMouseInfluence;
        totalHeight += influence * sin(time * 3.0) * uAmplitude * 2.0;
      }
      
      gerstnerPos.y = totalHeight;
      
      // Calculate horizontal displacement for Gerstner waves
      float steepness = 0.3;
      gerstnerPos.x += steepness * dir1.x * uAmplitude * cos(dot(dir1, position) * uFrequency + time);
      gerstnerPos.z += steepness * dir1.y * uAmplitude * cos(dot(dir1, position) * uFrequency + time);
      
      return gerstnerPos;
    }
    
    vec3 calculateNormal(vec2 position) {
      float eps = 0.01;
      vec3 pos = calculateGerstnerPosition(position);
      vec3 posX = calculateGerstnerPosition(position + vec2(eps, 0.0));
      vec3 posZ = calculateGerstnerPosition(position + vec2(0.0, eps));
      
      vec3 tangentX = posX - pos;
      vec3 tangentZ = posZ - pos;
      
      return normalize(cross(tangentX, tangentZ));
    }
    
    void main() {
      vUv = uv;
      
      // Calculate wave position
      vec2 worldPos = position.xz;
      vec3 wavePosition = calculateGerstnerPosition(worldPos);
      
      // Calculate normal
      vec3 calculatedNormal = calculateNormal(worldPos);
      
      vPosition = wavePosition;
      vNormal = calculatedNormal;
      vElevation = wavePosition.y;
      vWorldPosition = (modelMatrix * vec4(wavePosition, 1.0)).xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(wavePosition, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uFoamColor;
    uniform vec3 uDepthColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uWireframe;
    uniform vec3 uSunDirection;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vWorldPosition;
    
    // Fresnel calculation
    float fresnel(vec3 viewDirection, vec3 normal, float power) {
      return pow(1.0 - dot(viewDirection, normal), power);
    }
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      vec3 normal = normalize(vNormal);
      
      // Base water color with depth
      float depth = smoothstep(-0.5, 0.5, vElevation);
      vec3 waterColor = mix(uDepthColor, uColor, depth);
      
      // Foam on wave peaks
      float foamMask = smoothstep(0.1, 0.3, vElevation);
      waterColor = mix(waterColor, uFoamColor, foamMask * 0.6);
      
      // Fresnel effect
      float fresnelFactor = fresnel(viewDirection, normal, 2.0);
      waterColor = mix(waterColor, vec3(0.8, 0.9, 1.0), fresnelFactor * 0.3);
      
      // Sun reflection
      vec3 reflectionDirection = reflect(-viewDirection, normal);
      float sunReflection = max(0.0, dot(reflectionDirection, normalize(uSunDirection)));
      sunReflection = pow(sunReflection, 128.0);
      waterColor += vec3(1.0, 0.9, 0.7) * sunReflection * 0.8;
      
      // Subsurface scattering approximation
      float scatter = max(0.0, dot(normal, uSunDirection));
      waterColor += uColor * scatter * 0.3;
      
      // Wireframe mode
      if (uWireframe > 0.5) {
        float wireWidth = 0.02;
        vec2 grid = abs(fract(vUv * 50.0) - 0.5);
        float line = smoothstep(0.0, wireWidth, min(grid.x, grid.y));
        waterColor = mix(vec3(1.0), waterColor, line);
      }
      
      // Final color with transparency
      float alpha = uOpacity * (0.7 + fresnelFactor * 0.3);
      
      gl_FragColor = vec4(waterColor, alpha);
    }
  `
};

export const WaveAnimation: React.FC<WaveAnimationProps> = ({
  width = 10,
  height = 10,
  segments = 128,
  amplitude = 0.2,
  frequency = 1.0,
  speed = 1.0,
  color = '#006994',
  opacity = 0.8,
  wireframe = false,
  interactive = true,
  mouseInfluence = 0.0,
  waveTypes = ['sine', 'gerstner', 'noise'],
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
}) => {
  const meshRef = useRef<Mesh>(null);
  const shaderRef = useRef<ShaderMaterial>(null);
  const mouseRef = useRef({ x: 0, y: 0, influence: 0 });
  
  // Wave physics simulation
  const wavePhysics = useMemo(() => new WavePhysics(waveTypes.length), [waveTypes]);
  
  // Create geometry and material
  const geometry = useMemo(() => {
    return new PlaneGeometry(width, height, segments, segments);
  }, [width, height, segments]);
  
  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      uniforms: { ...WaveShader.uniforms },
      vertexShader: WaveShader.vertexShader,
      fragmentShader: WaveShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    
    // Set initial uniform values
    mat.uniforms.uColor.value = new Color(color);
    mat.uniforms.uOpacity.value = opacity;
    mat.uniforms.uAmplitude.value = amplitude;
    mat.uniforms.uFrequency.value = frequency;
    mat.uniforms.uSpeed.value = speed;
    mat.uniforms.uWireframe.value = wireframe ? 1.0 : 0.0;
    mat.uniforms.uMouseInfluence.value = mouseInfluence;
    mat.uniforms.uResolution.value = new Vector2(segments, segments);
    
    return mat;
  }, [color, opacity, amplitude, frequency, speed, wireframe, mouseInfluence, segments]);
  
  // Mouse interaction
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      
      if (shaderRef.current) {
        shaderRef.current.uniforms.uMousePosition.value.set(x, y);
      }
      
      wavePhysics.setMousePosition(x * width / 2, y * height / 2);
    };
    
    const handleMouseDown = () => {
      mouseRef.current.influence = 1.0;
    };
    
    const handleMouseUp = () => {
      mouseRef.current.influence = 0.0;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactive, width, height, wavePhysics]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!shaderRef.current) return;
    
    // Update time
    shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    wavePhysics.updateTime(delta * speed);
    
    // Update mouse influence
    const targetInfluence = mouseRef.current.influence * mouseInfluence;
    const currentInfluence = shaderRef.current.uniforms.uMouseInfluence.value;
    const newInfluence = THREE.MathUtils.lerp(currentInfluence, targetInfluence, delta * 5);
    shaderRef.current.uniforms.uMouseInfluence.value = newInfluence;
    wavePhysics.setMouseInfluence(newInfluence);
    
    // Dynamic parameter updates
    shaderRef.current.uniforms.uAmplitude.value = amplitude * (1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    shaderRef.current.uniforms.uFrequency.value = frequency * (1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05);
  });
  
  // Update material when props change
  useEffect(() => {
    if (!shaderRef.current) return;
    
    shaderRef.current.uniforms.uColor.value = new Color(color);
    shaderRef.current.uniforms.uOpacity.value = opacity;
    shaderRef.current.uniforms.uAmplitude.value = amplitude;
    shaderRef.current.uniforms.uFrequency.value = frequency;
    shaderRef.current.uniforms.uSpeed.value = speed;
    shaderRef.current.uniforms.uWireframe.value = wireframe ? 1.0 : 0.0;
  }, [color, opacity, amplitude, frequency, speed, wireframe]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
      receiveShadow
    >
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        {...material}
      />
    </mesh>
  );
};

// Wave presets for easy configuration
export const WavePresets = {
  calm: {
    amplitude: 0.05,
    frequency: 0.5,
    speed: 0.5,
    color: '#4a90e2',
    opacity: 0.7,
  },
  
  moderate: {
    amplitude: 0.15,
    frequency: 1.0,
    speed: 1.0,
    color: '#006994',
    opacity: 0.8,
  },
  
  rough: {
    amplitude: 0.3,
    frequency: 1.8,
    speed: 1.5,
    color: '#003d5c',
    opacity: 0.9,
  },
  
  storm: {
    amplitude: 0.5,
    frequency: 2.5,
    speed: 2.0,
    color: '#001f3f',
    opacity: 0.95,
  },
  
  tropical: {
    amplitude: 0.2,
    frequency: 1.2,
    speed: 0.8,
    color: '#00b4d8',
    opacity: 0.75,
  }
};

// Utility function to create wave animation with preset
export const createWaveAnimation = (preset: keyof typeof WavePresets, overrides?: Partial<WaveAnimationProps>) => {
  const presetConfig = WavePresets[preset];
  return { ...presetConfig, ...overrides };
};

export default WaveAnimation;