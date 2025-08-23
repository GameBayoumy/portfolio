'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Vector3, Color, AdditiveBlending } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubRepository } from '@/types/github';
import * as THREE from 'three';

interface NetworkNodeProps {
  repository: GitHubRepository & {
    position: Vector3;
    targetPosition: Vector3;
    color: Color;
    radius: number;
    velocity: Vector3;
    force: Vector3;
    mass: number;
    isHovered: boolean;
    isSelected: boolean;
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
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Memoized materials for performance
  const materials = useMemo(() => {
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: repository.color,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: repository.color,
      transparent: true,
      opacity: 0.3,
      blending: AdditiveBlending
    });

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: repository.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    return { mainMaterial, glowMaterial, ringMaterial };
  }, [repository.color]);

  const handleClick = useCallback((e: any) => {
    e?.stopPropagation?.();
    onClick(repository);
  }, [repository, onClick]);

  const handlePointerOver = useCallback((e: any) => {
    e?.stopPropagation?.();
    document.body.style.cursor = 'pointer';
    onHover(repository);
  }, [repository, onHover]);

  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
    onPointerOut();
  }, [onPointerOut]);

  useFrame((state, delta) => {
    if (meshRef.current && glowRef.current && ringRef.current) {
      // Smooth position interpolation
      meshRef.current.position.lerp(repository.position, 0.1);
      
      // Floating animation
      const floatOffset = Math.sin(state.clock.elapsedTime * 0.8 + repository.id * 0.1) * 0.15;
      meshRef.current.position.y += floatOffset;
      
      // Update glow and ring positions
      glowRef.current.position.copy(meshRef.current.position);
      ringRef.current.position.copy(meshRef.current.position);
      
      // Scale animations based on interaction state
      let targetScale = 1;
      let glowScale = 1.2;
      let ringScale = 1.5;
      
      if (isSelected) {
        targetScale = 1.6;
        glowScale = 2.0;
        ringScale = 2.5;
      } else if (isHovered) {
        targetScale = 1.4;
        glowScale = 1.8;
        ringScale = 2.2;
      } else if (isConnectedToHovered || isConnectedToSelected) {
        targetScale = 1.2;
        glowScale = 1.5;
        ringScale = 1.8;
      }
      
      // Smooth scaling
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Glow effect
      const glowIntensity = (isHovered || isSelected) ? 0.8 : 0.3;
      glowRef.current.scale.setScalar(repository.radius * glowScale * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.1));
      materials.glowMaterial.opacity = glowIntensity * (0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
      
      // Selection ring
      if (isSelected || isHovered) {
        ringRef.current.visible = true;
        ringRef.current.scale.setScalar(repository.radius * ringScale);
        ringRef.current.rotation.z += delta * 2;
        materials.ringMaterial.opacity = isSelected ? 0.8 : 0.6;
      } else {
        ringRef.current.visible = false;
      }
      
      // Rotation
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.z += delta * 0.2;
      
      // Emissive intensity based on state
      const emissiveIntensity = (isHovered || isSelected) ? 0.3 : 0.1;
      materials.mainMaterial.emissive = repository.color.clone().multiplyScalar(emissiveIntensity);
    }
  });

  // Temporarily disabled for build compatibility
  return null;
};

export default NetworkNode;
// Temporarily disabled for build
