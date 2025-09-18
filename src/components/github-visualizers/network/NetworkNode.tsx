'use client';

import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AdditiveBlending } from 'three';
import type { Color, Vector3 } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubRepository } from '@/types/github';
import * as THREE from 'three';

interface NetworkNodeProps {
  repository: GitHubRepository & {
    position: Vector3;
    renderPosition: Vector3;
    targetPosition: Vector3;
    color: Color;
    radius: number;
    velocity: Vector3;
    force: Vector3;
    mass: number;
    connections: string[];
  };
  isSelected: boolean;
  isHovered: boolean;
  isConnectedToHovered: boolean;
  isConnectedToSelected: boolean;
  onClick: (repo: any) => void;
  onHover: (repo: any) => void;
  onPointerOut: () => void;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  repository,
  isSelected,
  isHovered,
  isConnectedToHovered,
  isConnectedToSelected,
  onClick,
  onHover,
  onPointerOut
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const tempVector = useMemo(() => new THREE.Vector3(), []);
  const scaleVector = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  // Memoized materials for performance
  const materials = useMemo(() => {
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: repository.color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: repository.color.clone().multiplyScalar(0.1),
      transparent: true,
      opacity: 0.9
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: repository.color,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: AdditiveBlending
    });

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: repository.color,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    return { mainMaterial, glowMaterial, ringMaterial };
  }, [repository.color]);

  useEffect(() => {
    return () => {
      materials.mainMaterial.dispose();
      materials.glowMaterial.dispose();
      materials.ringMaterial.dispose();
    };
  }, [materials]);

  const handleClick = useCallback((e: any) => {
    e?.stopPropagation?.();
    onClick(repository);
  }, [onClick, repository]);

  const handlePointerOver = useCallback((e: any) => {
    e?.stopPropagation?.();
    onHover(repository);
  }, [onHover, repository]);

  const handlePointerLeave = useCallback((e: any) => {
    e?.stopPropagation?.();
    onPointerOut();
  }, [onPointerOut]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current || !glowRef.current || !ringRef.current) {
      return;
    }

    // Smooth position interpolation with gentle float offset
    const floatOffset = Math.sin(state.clock.elapsedTime * 0.8 + repository.id * 0.35) * (0.2 + repository.radius * 0.05);
    tempVector.copy(repository.position);
    tempVector.y += floatOffset;
    groupRef.current.position.lerp(tempVector, 0.12);
    repository.renderPosition.copy(groupRef.current.position);

    // Dynamic scaling based on interaction state
    let targetScale = 1;
    let glowScale = 1.35;
    let ringScale = 1.8;

    if (isSelected) {
      targetScale = 1.65;
      glowScale = 2.1;
      ringScale = 2.8;
    } else if (isHovered) {
      targetScale = 1.4;
      glowScale = 1.9;
      ringScale = 2.3;
    } else if (isConnectedToHovered || isConnectedToSelected) {
      targetScale = 1.18;
      glowScale = 1.55;
      ringScale = 2;
    }

    scaleVector.setScalar(targetScale);
    meshRef.current.scale.lerp(scaleVector, 0.15);

    const elapsed = state.clock.elapsedTime;
    const glowPulse = 1 + Math.sin(elapsed * 3) * 0.08;
    glowRef.current.scale.setScalar(repository.radius * glowScale * glowPulse);
    materials.glowMaterial.opacity = (isHovered || isSelected ? 0.55 : 0.28) + Math.sin(elapsed * 2.5) * 0.05;

    ringRef.current.visible = isHovered || isSelected;
    if (ringRef.current.visible) {
      ringRef.current.scale.setScalar(repository.radius * ringScale);
      ringRef.current.rotation.z += delta * 1.5;
      materials.ringMaterial.opacity = isSelected ? 0.85 : 0.55;
    }

    // Subtle rotation for visual interest
    meshRef.current.rotation.y += delta * 0.8;
    meshRef.current.rotation.x += delta * 0.2;

    // Emissive intensity based on state
    materials.mainMaterial.emissive
      .copy(repository.color)
      .multiplyScalar(isSelected ? 0.35 : isHovered ? 0.25 : 0.12);
  });

  const tooltipContent = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.18 }}
      className="pointer-events-none min-w-[220px] rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-left shadow-lg shadow-neon-blue/10 backdrop-blur"
    >
      <div className="flex items-center justify-between text-xs text-gray-300">
        <span className="font-semibold text-white">{repository.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-neon-blue">
          {repository.language || 'Other'}
        </span>
      </div>
      {repository.description && (
        <p className="mt-2 text-[11px] text-gray-400 line-clamp-3">{repository.description}</p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-gray-400">
        <div className="rounded-lg bg-white/5 px-2 py-1 text-center">
          <div className="text-xs font-semibold text-white">{repository.stargazers_count}</div>
          <div>Stars</div>
        </div>
        <div className="rounded-lg bg-white/5 px-2 py-1 text-center">
          <div className="text-xs font-semibold text-white">{repository.forks_count}</div>
          <div>Forks</div>
        </div>
        <div className="rounded-lg bg-white/5 px-2 py-1 text-center">
          <div className="text-xs font-semibold text-white">{repository.open_issues_count}</div>
          <div>Issues</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(repository.topics || []).slice(0, 4).map(topic => (
          <span
            key={topic}
            className="rounded-full bg-neon-blue/10 px-2 py-0.5 text-[10px] text-neon-blue"
          >
            #{topic}
          </span>
        ))}
      </div>
    </motion.div>
  );

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={materials.mainMaterial}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerLeave}
      >
        <icosahedronGeometry args={[repository.radius, 2]} />
      </mesh>

      <mesh ref={glowRef} material={materials.glowMaterial}>
        <sphereGeometry args={[repository.radius * 1.1, 32, 32]} />
      </mesh>

      <mesh
        ref={ringRef}
        material={materials.ringMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[repository.radius * 1.25, repository.radius * 1.85, 64]} />
      </mesh>

      <AnimatePresence>
        {(isHovered || isSelected) && (
          <Html
            transform
            distanceFactor={6}
            position={[0, repository.radius * (isSelected ? 2.6 : 2.2), 0]}
            zIndexRange={[10, 0]}
          >
            {tooltipContent}
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
};

export default NetworkNode;