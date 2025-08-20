'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

import { useTheme } from 'next-themes';

/**
 * Animated sphere component for background
 */
function AnimatedSphere({ position, color, size = 0.5 }: {
  position: [number, number, number];
  color: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

/**
 * Particle system component
 */
function ParticleField() {
  const points = useRef<THREE.Points>(null);
  
  // Generate random particle positions
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00f0ff"
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

/**
 * Main 3D scene content
 */
function SceneContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.2 : 0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isDark ? 0.3 : 0.8}
        color={isDark ? '#00f0ff' : '#ffffff'}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />

      {/* Environment */}
      <Environment preset="night" />

      {/* Animated spheres */}
      <AnimatedSphere position={[2, 0, -5]} color="#00f0ff" size={0.3} />
      <AnimatedSphere position={[-2, 2, -3]} color="#8b5cf6" size={0.4} />
      <AnimatedSphere position={[0, -2, -4]} color="#f472b6" size={0.35} />
      <AnimatedSphere position={[4, 1, -6]} color="#10b981" size={0.25} />
      <AnimatedSphere position={[-3, -1, -7]} color="#00f0ff" size={0.3} />

      {/* Particle field */}
      <ParticleField />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom 
          intensity={0.5} 
          width={300} 
          height={300} 
          kernelSize={5} 
          luminanceThreshold={0.15} 
          luminanceSmoothing={0.025}
        />
        <ChromaticAberration
          offset={[0.002, 0.001]}
        />
      </EffectComposer>
    </>
  );
}

/**
 * Loading fallback component
 */
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/20">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Main 3D background component
 */
export function ThreeDBackground() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}