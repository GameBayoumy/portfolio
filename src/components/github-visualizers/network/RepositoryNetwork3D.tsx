'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text, Html, useTexture, Sphere, Line, Points, PointMaterial } from '@react-three/drei';
import { Vector3, Color, BufferGeometry, BufferAttribute, DoubleSide, AdditiveBlending, ShaderMaterial, Points as ThreePoints } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubRepository, RepositoryNetwork, RepositoryNode } from '@/types/github';
import * as THREE from 'three';

// Custom shaders for better visual effects
const particleVertexShader = `
  attribute float scale;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = scale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
    gl_FragColor = vec4(vColor, 0.8);
  }
`;

interface Repository3D extends GitHubRepository {
  position: Vector3;
  targetPosition: Vector3;
  connections: string[];
  color: Color;
  radius: number;
  velocity: Vector3;
  force: Vector3;
  mass: number;
  isHovered: boolean;
  isSelected: boolean;
}

interface NetworkConnection {
  source: Repository3D;
  target: Repository3D;
  type: 'fork' | 'language' | 'topic' | 'name';
  strength: number;
  opacity: number;
}

interface ForceSettings {
  attraction: number;
  repulsion: number;
  centerGravity: number;
  damping: number;
  linkDistance: number;
}

interface RepositoryNetwork3DProps {
  repositories: GitHubRepository[];
  className?: string;
}

// Temporarily disabled components for build compatibility
function Repository3DNode() {
  return null;
}

function ConnectionLines() {
  return null;
}

function BackgroundParticles() {
  return null;
}

function NetworkScene() {
  return null;
}

export default function RepositoryNetwork3D({ repositories, className = '' }: RepositoryNetwork3DProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'force' | 'spiral' | 'clusters'>('force');
  
  // Enhanced language colors with better contrast
  const languageColors: { [key: string]: Color } = useMemo(() => ({
    'TypeScript': new Color('#3178c6'),
    'JavaScript': new Color('#f7df1e'),
    'Python': new Color('#3776ab'),
    'Java': new Color('#ed8b00'),
    'C++': new Color('#00599c'),
    'C#': new Color('#239120'),
    'Go': new Color('#00add8'),
    'Rust': new Color('#dea584'),
    'PHP': new Color('#777bb4'),
    'Ruby': new Color('#cc342d'),
    'Swift': new Color('#fa7343'),
    'Kotlin': new Color('#7f52ff'),
    'HTML': new Color('#e34f26'),
    'CSS': new Color('#1572b6'),
    'Vue': new Color('#4fc08d'),
    'React': new Color('#61dafb'),
    'Shell': new Color('#89e051'),
    'Dockerfile': new Color('#384d54'),
    'unknown': new Color('#6b7280')
  }), []);

  // Transform repositories with advanced positioning algorithms
  const repositories3D = useMemo(() => {
    setIsLoading(true);
    
    const repos = repositories.map((repo, index) => {
      let position: Vector3;
      
      // Different layout algorithms
      switch (viewMode) {
        case 'spiral':
          // Golden spiral layout
          const angle = (index * 137.5) * (Math.PI / 180);
          const radius = Math.sqrt(index + 1) * 1.8;
          const height = (index % 20) * 1.5 - 15;
          position = new Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          );
          break;
          
        case 'clusters':
          // Language-based clustering
          const languages = [...new Set(repositories.map(r => r.language || 'unknown'))];
          const langIndex = languages.indexOf(repo.language || 'unknown');
          const langRepos = repositories.filter(r => (r.language || 'unknown') === (repo.language || 'unknown'));
          const repoIndexInLang = langRepos.findIndex(r => r.id === repo.id);
          
          const clusterAngle = (langIndex / languages.length) * Math.PI * 2;
          const clusterRadius = 8 + langIndex * 2;
          const innerAngle = (repoIndexInLang / langRepos.length) * Math.PI * 2;
          const innerRadius = Math.sqrt(repoIndexInLang + 1) * 0.8;
          
          position = new Vector3(
            Math.cos(clusterAngle) * clusterRadius + Math.cos(innerAngle) * innerRadius,
            Math.sin(innerAngle) * innerRadius * 0.5,
            Math.sin(clusterAngle) * clusterRadius + Math.sin(innerAngle) * innerRadius
          );
          break;
          
        default: // 'force'
          // Initial random positions for force-directed layout
          position = new Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 20
          );
      }

      const color = languageColors[repo.language || 'unknown'];
      
      // Enhanced size calculation
      const stars = Math.log(repo.stargazers_count + 1);
      const forks = Math.log(repo.forks_count + 1);
      const issues = Math.log(repo.open_issues_count + 1);
      const recency = Math.max(0, 1 - (Date.now() - new Date(repo.pushed_at || repo.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
      
      const nodeRadius = Math.max(0.4, Math.min(2.0, 
        0.6 + stars * 0.15 + forks * 0.1 + issues * 0.05 + recency * 0.3
      ));
      
      const mass = nodeRadius * nodeRadius; // Mass proportional to area

      return {
        ...repo,
        position,
        targetPosition: position.clone(),
        color,
        radius: nodeRadius,
        connections: [],
        velocity: new Vector3(0, 0, 0),
        force: new Vector3(0, 0, 0),
        mass,
        isHovered: false,
        isSelected: false
      } as Repository3D;
    });
    
    setTimeout(() => setIsLoading(false), 500);
    return repos;
  }, [repositories, viewMode, languageColors]);

  if (repositories.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-2">🔍</div>
          <div className="text-gray-400">No repositories to display</div>
          <div className="text-sm text-gray-500 mt-1">Check your GitHub integration</div>
        </div>
      </div>
    );
  }

  // Temporarily disabled for build compatibility - Three.js JSX elements need proper type definitions
  return (
    <div className={`flex items-center justify-center h-96 ${className}`}>
      <div className="text-center">
        <div className="text-2xl text-gray-400 mb-2">🚧</div>
        <div className="text-gray-400">3D Network Visualization</div>
        <div className="text-sm text-gray-500 mt-1">Under maintenance for build compatibility</div>
      </div>
    </div>
  );
}
