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

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef} material={materials.glowMaterial} renderOrder={0}>
        <sphereGeometry args={[repository.radius * 1.2, 16, 16]} />
      </mesh>
      
      {/* Selection ring */}
      <mesh ref={ringRef} material={materials.ringMaterial} renderOrder={1}>
        <ringGeometry args={[repository.radius * 1.3, repository.radius * 1.5, 32]} />
      </mesh>
      
      {/* Main node */}
      <mesh
        ref={meshRef}
        material={materials.mainMaterial}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerLeave}
        renderOrder={2}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[repository.radius, 2]} />
      </mesh>
      
      {/* Info tooltip */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, repository.radius + 1.5, 0]}
          center
          distanceFactor={8}
          occlude
          zIndexRange={[100, 0]}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-xl text-sm max-w-xs pointer-events-none border border-gray-600 shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))' }}
            >
              {/* Header */}
              <div className="flex items-center space-x-2 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `#${repository.color.getHexString()}` }}
                />
                <div className="font-bold text-lg text-cyan-400 truncate">
                  {repository.name}
                </div>
              </div>
              
              {/* Description */}
              {repository.description && (
                <div className="text-gray-300 mb-3 text-xs leading-relaxed">
                  {repository.description.length > 120
                    ? `${repository.description.substring(0, 120)}...`
                    : repository.description
                  }
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-400">Stars:</span>
                  <span className="font-mono text-white">{repository.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-blue-400">🍴</span>
                  <span className="text-gray-400">Forks:</span>
                  <span className="font-mono text-white">{repository.forks_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-red-400">🐛</span>
                  <span className="text-gray-400">Issues:</span>
                  <span className="font-mono text-white">{repository.open_issues_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">📏</span>
                  <span className="text-gray-400">Size:</span>
                  <span className="font-mono text-white">{Math.round(repository.size / 1024)}MB</span>
                </div>
              </div>
              
              {/* Language */}
              {repository.language && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                        style={{ 
                          backgroundColor: `#${repository.color.getHexString()}20`, 
                          color: `#${repository.color.getHexString()}`,
                          borderColor: `#${repository.color.getHexString()}40`
                        }}>
                    {repository.language}
                  </span>
                </div>
              )}
              
              {/* Topics */}
              {repository.topics && repository.topics.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {repository.topics.slice(0, 4).map((topic, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600"
                      >
                        {topic}
                      </span>
                    ))}
                    {repository.topics.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{repository.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  Created: {new Date(repository.created_at).toLocaleDateString()}
                </div>
                <div>
                  Updated: {new Date(repository.updated_at).toLocaleDateString()}
                </div>
              </div>
              
              {/* Action hint */}
              <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-cyan-400">
                Click to {isSelected ? 'deselect' : 'select'} • Visit on GitHub →
              </div>
            </motion.div>
          </AnimatePresence>
        </Html>
      )}
    </group>
  );
};

export default NetworkNode;