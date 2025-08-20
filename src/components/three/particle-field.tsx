'use client';

import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParticleSystemProps } from '@/types';

const ParticleField = memo(function ParticleField({
  count = 200,
  spread = 10,
  speed = 0.02,
  size = 0.05,
  color = '#00f0ff',
  opacity = 0.6,
  animationSpeed = 1,
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Generate particle positions and attributes
  const { positions, colors, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const baseColor = new THREE.Color(color);
    const accentColors = [
      new THREE.Color('#ff006e'),
      new THREE.Color('#8338ec'),
      new THREE.Color('#3a86ff'),
      new THREE.Color('#06ffa5'),
      new THREE.Color('#ffbe0b'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Positions - scattered in a sphere
      const radius = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Colors - mix of base color and accents
      const selectedColor = Math.random() < 0.7 ? baseColor : accentColors[Math.floor(Math.random() * accentColors.length)];
      colors[i3] = selectedColor.r;
      colors[i3 + 1] = selectedColor.g;
      colors[i3 + 2] = selectedColor.b;

      // Sizes - varying particle sizes
      sizes[i] = size * (0.5 + Math.random() * 1.5);

      // Velocities - random movement
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
    }

    return { positions, colors, sizes, velocities };
  }, [count, spread, speed, size, color]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.geometry.attributes.position) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime * animationSpeed;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update positions with velocities
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Add some wave motion
      positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.001;
      positions[i3] += Math.cos(time + i * 0.1) * 0.001;

      // Boundary conditions - wrap around
      const distance = Math.sqrt(
        positions[i3] * positions[i3] +
        positions[i3 + 1] * positions[i3 + 1] +
        positions[i3 + 2] * positions[i3 + 2]
      );

      if (distance > spread * 1.5) {
        // Respawn particle near center with new velocity
        const newRadius = Math.random() * spread * 0.3;
        const newTheta = Math.random() * Math.PI * 2;
        const newPhi = Math.acos(Math.random() * 2 - 1);
        
        positions[i3] = newRadius * Math.sin(newPhi) * Math.cos(newTheta);
        positions[i3 + 1] = newRadius * Math.sin(newPhi) * Math.sin(newTheta);
        positions[i3 + 2] = newRadius * Math.cos(newPhi);

        // New velocity
        velocities[i3] = (Math.random() - 0.5) * speed;
        velocities[i3 + 1] = (Math.random() - 0.5) * speed;
        velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      }
    }

    try {
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    } catch (error) {
      console.warn('Failed to update particle positions:', error);
    }

    // Rotate the entire particle system slowly
    if (meshRef.current.rotation) {
      meshRef.current.rotation.y += 0.001 * animationSpeed;
      meshRef.current.rotation.x += 0.0005 * animationSpeed;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={size}
        transparent
        opacity={opacity}
        vertexColors
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        alphaTest={0.001}
        depthTest={false}
      />
    </points>
  );
});

export { ParticleField };