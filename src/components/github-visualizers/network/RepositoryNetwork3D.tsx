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

// Enhanced Repository Node Component with Physics
function Repository3DNode({ 
  repository,
  onClick,
  onHover,
  selectedRepo,
  hoveredRepo,
  forceSettings
}: {
  repository: Repository3D;
  onClick: (repo: Repository3D | null) => void;
  onHover: (repo: Repository3D | null) => void;
  selectedRepo: Repository3D | null;
  hoveredRepo: Repository3D | null;
  forceSettings: ForceSettings;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  
  const isHovered = hoveredRepo?.id === repository.id;
  const isSelected = selectedRepo?.id === repository.id;
  const isConnectedToHovered = hoveredRepo && repository.connections.includes(hoveredRepo.name);
  const isConnectedToSelected = selectedRepo && repository.connections.includes(selectedRepo.name);

  useFrame((state, delta) => {
    if (meshRef.current && glowRef.current) {
      // Physics-based position update
      repository.force.set(0, 0, 0);
      
      // Apply forces (simplified force-directed layout)
      const center = new Vector3(0, 0, 0);
      const centerForce = center.clone().sub(repository.position).multiplyScalar(forceSettings.centerGravity);
      repository.force.add(centerForce);
      
      // Apply velocity and damping
      repository.velocity.add(repository.force.clone().multiplyScalar(delta));
      repository.velocity.multiplyScalar(forceSettings.damping);
      repository.position.add(repository.velocity.clone().multiplyScalar(delta));
      
      // Smooth position interpolation
      meshRef.current.position.lerp(repository.position, 0.1);
      glowRef.current.position.copy(meshRef.current.position);
      
      // Floating animation
      const floatOffset = Math.sin(state.clock.elapsedTime * 0.5 + repository.id * 0.1) * 0.2;
      meshRef.current.position.y += floatOffset;
      
      // Scale animations
      let targetScale = 1;
      if (isSelected) targetScale = 1.5;
      else if (isHovered) targetScale = 1.3;
      else if (isConnectedToHovered || isConnectedToSelected) targetScale = 1.2;
      
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.15);
      
      // Glow effect
      const glowIntensity = isHovered || isSelected ? 0.8 : 0.3;
      glowRef.current.scale.setScalar(repository.radius * (1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1));
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
      
      // Rotation
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation?.();
    onClick(isSelected ? null : repository);
  }, [repository, isSelected, onClick]);

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation?.();
    onHover(repository);
  }, [repository, onHover]);

  const handlePointerOut = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef} renderOrder={0}>
        <sphereGeometry args={[repository.radius * 1.2, 16, 16]} />
        <meshBasicMaterial
          color={repository.color}
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
        />
      </mesh>
      
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        renderOrder={1}
      >
        <icosahedronGeometry args={[repository.radius, 2]} />
        <meshPhysicalMaterial
          color={repository.color}
          emissive={repository.color.clone().multiplyScalar(isHovered || isSelected ? 0.3 : 0.1)}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Info tooltip */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, repository.radius + 1, 0]}
          center
          distanceFactor={8}
          occlude
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg text-sm max-w-xs pointer-events-none border border-gray-700 shadow-2xl"
            >
              <div className="font-bold text-lg mb-2 text-cyan-400">{repository.name}</div>
              {repository.description && (
                <div className="text-gray-300 mb-2 text-xs leading-relaxed">
                  {repository.description.length > 100
                    ? `${repository.description.substring(0, 100)}...`
                    : repository.description
                  }
                </div>
              )}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span>{repository.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-blue-400">🍴</span>
                  <span>{repository.forks_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">📝</span>
                  <span>{repository.open_issues_count}</span>
                </div>
              </div>
              {repository.language && (
                <div className="mt-2 text-xs">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                        style={{ backgroundColor: `${repository.color.getHexString()}20`, color: `#${repository.color.getHexString()}` }}>
                    {repository.language}
                  </span>
                </div>
              )}
              {repository.topics && repository.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {repository.topics.slice(0, 3).map((topic, index) => (
                    <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                      {topic}
                    </span>
                  ))}
                  {repository.topics.length > 3 && (
                    <span className="text-xs text-gray-400">+{repository.topics.length - 3} more</span>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Html>
      )}
    </group>
  );
}

// Enhanced Connection Lines with Dynamic Opacity
function ConnectionLines({ 
  repositories, 
  connections, 
  selectedRepo, 
  hoveredRepo 
}: { 
  repositories: Repository3D[]; 
  connections: NetworkConnection[];
  selectedRepo: Repository3D | null;
  hoveredRepo: Repository3D | null;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const { geometry, lineData } = useMemo(() => {
    const points: number[] = [];
    const colors: number[] = [];
    const lineData: Array<{ connection: NetworkConnection; isHighlighted: boolean }> = [];
    
    connections.forEach((connection) => {
      const isHighlighted = Boolean(
        (selectedRepo && (connection.source.id === selectedRepo.id || connection.target.id === selectedRepo.id)) ||
        (hoveredRepo && (connection.source.id === hoveredRepo.id || connection.target.id === hoveredRepo.id))
      );
      
      lineData.push({ connection, isHighlighted });
      
      // Add line points
      points.push(
        connection.source.position.x, connection.source.position.y, connection.source.position.z,
        connection.target.position.x, connection.target.position.y, connection.target.position.z
      );
      
      // Dynamic colors based on connection type and state
      let lineColor = new Color();
      switch (connection.type) {
        case 'fork':
          lineColor.setHex(0xffd700); // Gold
          break;
        case 'language':
          lineColor.setHex(0x00ff88); // Green
          break;
        case 'topic':
          lineColor.setHex(0xff6b6b); // Red
          break;
        default:
          lineColor.setHex(0x4ecdc4); // Cyan
      }
      
      if (isHighlighted) {
        lineColor.multiplyScalar(1.5);
      }
      
      colors.push(lineColor.r, lineColor.g, lineColor.b, lineColor.r, lineColor.g, lineColor.b);
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    
    return { geometry, lineData };
  }, [repositories, connections, selectedRepo, hoveredRepo]);

  useFrame((state) => {
    if (linesRef.current) {
      // Animate line opacity based on selection
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      const targetOpacity = selectedRepo || hoveredRepo ? 0.8 : 0.3;
      material.opacity += (targetOpacity - material.opacity) * 0.1;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.3}
        blending={AdditiveBlending}
        linewidth={2}
      />
    </lineSegments>
  );
}

// Background Particles Component
function BackgroundParticles() {
  const particlesRef = useRef<ThreePoints>(null);
  const particleCount = 1000;
  
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere
      const r = Math.random() * 50 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Random colors (blue to purple spectrum)
      const hue = 0.6 + Math.random() * 0.3;
      const color = new Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      scales[i] = Math.random() * 2 + 0.5;
    }
    
    return { positions, colors, scales };
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={particleCount}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

// Enhanced Scene Component with Advanced Features
function NetworkScene({ repositories }: { repositories: Repository3D[] }) {
  const { camera, scene } = useThree();
  const [selectedRepo, setSelectedRepo] = useState<Repository3D | null>(null);
  const [hoveredRepo, setHoveredRepo] = useState<Repository3D | null>(null);
  const [forceSettings] = useState<ForceSettings>({
    attraction: 0.01,
    repulsion: 100,
    centerGravity: 0.02,
    damping: 0.95,
    linkDistance: 5
  });

  // Generate sophisticated connections
  const connections = useMemo(() => {
    const connections: NetworkConnection[] = [];
    
    repositories.forEach((repoA, i) => {
      repositories.slice(i + 1).forEach((repoB) => {
        // Language-based connections
        if (repoA.language === repoB.language && repoA.language !== null) {
          connections.push({
            source: repoA,
            target: repoB,
            type: 'language',
            strength: 0.8,
            opacity: 0.6
          });
        }
        
        // Fork relationships
        if (repoA.fork || repoB.fork) {
          const similarity = calculateNameSimilarity(repoA.name, repoB.name);
          if (similarity > 0.7) {
            connections.push({
              source: repoA,
              target: repoB,
              type: 'fork',
              strength: 1.0,
              opacity: 0.8
            });
          }
        }
        
        // Topic-based connections
        const sharedTopics = repoA.topics?.filter(topic => repoB.topics?.includes(topic)) || [];
        if (sharedTopics.length > 0) {
          connections.push({
            source: repoA,
            target: repoB,
            type: 'topic',
            strength: Math.min(sharedTopics.length * 0.3, 0.9),
            opacity: 0.4
          });
        }
        
        // Activity correlation (recent vs old)
        const dateA = new Date(repoA.pushed_at || repoA.updated_at);
        const dateB = new Date(repoB.pushed_at || repoB.updated_at);
        const timeDiff = Math.abs(dateA.getTime() - dateB.getTime());
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 30 && (repoA.stargazers_count > 5 || repoB.stargazers_count > 5)) {
          connections.push({
            source: repoA,
            target: repoB,
            type: 'name',
            strength: 0.3,
            opacity: 0.2
          });
        }
      });
    });
    
    return connections;
  }, [repositories]);

  const calculateNameSimilarity = (nameA: string, nameB: string): number => {
    const a = nameA.toLowerCase();
    const b = nameB.toLowerCase();
    
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.8;
    
    // Simple Levenshtein distance approximation
    const maxLength = Math.max(a.length, b.length);
    let distance = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) distance++;
    }
    distance += Math.abs(a.length - b.length);
    
    return 1 - (distance / maxLength);
  };

  useEffect(() => {
    // Set initial camera position with smooth transition
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Update repository connections for physics
  useEffect(() => {
    repositories.forEach(repo => {
      repo.connections = connections
        .filter(conn => conn.source.id === repo.id || conn.target.id === repo.id)
        .map(conn => conn.source.id === repo.id ? conn.target.name : conn.source.name);
    });
  }, [repositories, connections]);

  return (
    <>
      {/* Advanced Lighting Setup */}
      <ambientLight intensity={0.2} color="#1a1a2e" />
      <directionalLight 
        position={[10, 10, 5]} 
        color="#4ecdc4" 
        intensity={0.5} 
        castShadow
      />
      <pointLight 
        position={[15, 15, 15]} 
        color="#ff6b6b" 
        intensity={0.4} 
        distance={30}
      />
      <pointLight 
        position={[-15, -10, -15]} 
        color="#45b7d1" 
        intensity={0.3} 
        distance={25}
      />
      <hemisphereLight 
        color="#87ceeb" 
        groundColor="#4a4a4a" 
        intensity={0.3}
      />
      
      {/* Background Particles */}
      <BackgroundParticles />
      
      {/* Connection Lines */}
      <ConnectionLines 
        repositories={repositories} 
        connections={connections}
        selectedRepo={selectedRepo}
        hoveredRepo={hoveredRepo}
      />
      
      {/* Repository Nodes */}
      {repositories.map((repo) => (
        <Repository3DNode
          key={repo.id}
          repository={repo}
          onClick={setSelectedRepo}
          onHover={setHoveredRepo}
          selectedRepo={selectedRepo}
          hoveredRepo={hoveredRepo}
          forceSettings={forceSettings}
        />
      ))}
      
      {/* Enhanced Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={60}
        autoRotate={(!selectedRepo && !hoveredRepo) || false}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </>
  );
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

  return (
    <motion.div 
      className={`relative h-[600px] rounded-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div>Initializing 3D Network...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [25, 20, 25], fov: 45 }}
        style={{ 
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)'
        }}
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <NetworkScene repositories={repositories3D} />
        </Suspense>
      </Canvas>
      
      {/* Enhanced UI Controls */}
      <div className="absolute top-4 left-4 space-y-3">
        {/* Legend */}
        <motion.div 
          className="bg-gray-900/90 backdrop-blur-md rounded-lg p-4 text-sm border border-gray-700/50"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-white font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
            3D Repository Network
          </div>
          <div className="space-y-2 text-gray-300 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-2"></div>
              Node size = popularity
            </div>
            <div className="flex items-center">
              <div className="w-3 h-1 bg-gradient-to-r from-green-400 to-blue-400 mr-2"></div>
              Color = language
            </div>
            <div className="flex items-center">
              <div className="w-3 h-px bg-cyan-400 mr-2"></div>
              Lines = relationships
            </div>
          </div>
        </motion.div>

        {/* Layout Controls */}
        <motion.div 
          className="bg-gray-900/90 backdrop-blur-md rounded-lg p-3 border border-gray-700/50"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-white font-semibold mb-2 text-sm">Layout</div>
          <div className="flex flex-col space-y-1">
            {[
              { key: 'force', label: 'Force', icon: '⚡' },
              { key: 'spiral', label: 'Spiral', icon: '🌀' },
              { key: 'clusters', label: 'Clusters', icon: '🎯' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center space-x-2 px-2 py-1 rounded text-xs transition-all ${
                  viewMode === key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Statistics Panel */}
      <motion.div 
        className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md rounded-lg p-4 text-sm border border-gray-700/50"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-white font-semibold mb-3 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Network Stats
        </div>
        <div className="space-y-2 text-gray-300 text-xs">
          <div className="flex justify-between">
            <span>Repositories:</span>
            <span className="text-white font-mono">{repositories.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Languages:</span>
            <span className="text-white font-mono">
              {new Set(repositories.map(r => r.language)).size}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Stars:</span>
            <span className="text-yellow-400 font-mono">
              {repositories.reduce((sum, r) => sum + r.stargazers_count, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Forks:</span>
            <span className="text-blue-400 font-mono">
              {repositories.reduce((sum, r) => sum + r.forks_count, 0)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Interaction Help */}
      <motion.div 
        className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md rounded-lg p-3 text-xs border border-gray-700/30"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-gray-400 space-y-1">
          <div>🖱️ Drag to rotate • 🔍 Scroll to zoom</div>
          <div>👆 Click nodes for details • ⌨️ Right-click to pan</div>
        </div>
      </motion.div>
    </motion.div>
  );
}