'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group } from 'three';

export interface InteractiveGlobeProps {
  /** Size of the globe */
  radius?: number;
  /** Position in 3D space */
  position?: [number, number, number];
  /** Enable automatic rotation */
  autoRotate?: boolean;
  /** Rotation speed */
  rotationSpeed?: number;
  /** Show wireframe overlay */
  showWireframe?: boolean;
  /** Enable interactive controls */
  enableControls?: boolean;
  /** Globe texture type */
  textureType?: 'earth' | 'wireframe' | 'both';
  /** Ambient light intensity */
  ambientLightIntensity?: number;
  /** Point light intensity */
  pointLightIntensity?: number;
  /** Enable glow effect */
  enableGlow?: boolean;
  /** Enable particle field around globe */
  enableParticles?: boolean;
  /** Performance mode */
  performanceMode?: 'low' | 'medium' | 'high';
  /** Enable atmosphere effect */
  enableAtmosphere?: boolean;
  /** Show country borders */
  showBorders?: boolean;
  /** Interactive click handling */
  onGlobeClick?: (point: THREE.Vector3) => void;
  /** Hover handling */
  onGlobeHover?: (point: THREE.Vector3 | null) => void;
}

// Earth texture data URL (simple blue-green pattern for demo)
const createEarthTexture = (): THREE.Texture => {
  if (typeof document === 'undefined') {
    // Return a minimal texture for SSR
    return new THREE.Texture();
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Create gradient for ocean
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, '#1e3a8a'); // Ocean blue
  gradient.addColorStop(0.3, '#3b82f6'); // Lighter blue
  gradient.addColorStop(0.6, '#22c55e'); // Land green
  gradient.addColorStop(1, '#16a34a'); // Darker green
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  
  // Add some land masses (simplified)
  ctx.fillStyle = '#16a34a';
  // North America
  ctx.fillRect(80, 60, 60, 40);
  // Europe/Africa
  ctx.fillRect(200, 50, 40, 80);
  // Asia
  ctx.fillRect(280, 40, 80, 50);
  // Australia
  ctx.fillRect(350, 120, 30, 20);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createNormalMap = (): THREE.Texture => {
  if (typeof document === 'undefined') {
    // Return a minimal texture for SSR
    return new THREE.Texture();
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Create a subtle normal map
  const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
  gradient.addColorStop(0, '#8080ff');
  gradient.addColorStop(1, '#4040ff');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  
  return new THREE.CanvasTexture(canvas);
};

// Atmosphere shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float opacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, opacity * intensity);
  }
`;

// Particle system for space dust
const SpaceParticles: React.FC<{ count: number }> = ({ count }) => {
  const points = useRef<THREE.Points>(null);
  
  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create spherical distribution around globe
      const radius = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Vary particle colors
      const intensity = 0.5 + Math.random() * 0.5;
      colors[i3] = intensity;
      colors[i3 + 1] = intensity * 0.8;
      colors[i3 + 2] = intensity * 1.2;
    }
    
    return { positions, colors };
  }, [count]);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.positions.length / 3}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleData.colors.length / 3}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Wireframe overlay component
const WireframeOverlay: React.FC<{ radius: number }> = ({ radius }) => {
  const wireframeRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <mesh ref={wireframeRef}>
      <sphereGeometry args={[radius + 0.01, 32, 16]} />
      <meshBasicMaterial
        color="#00ffff"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

// Atmosphere glow component
const AtmosphereGlow: React.FC<{ radius: number; color: string }> = ({ 
  radius, 
  color = '#4fc3f7' 
}) => {
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        opacity: { value: 0.3 }
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, [color]);
  
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.1, 32, 16]} />
      <primitive object={atmosphereMaterial} />
    </mesh>
  );
};

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  radius = 1,
  position = [0, 0, 0],
  autoRotate = true,
  rotationSpeed = 0.01,
  showWireframe = false,
  enableControls = true,
  textureType = 'earth',
  ambientLightIntensity = 0.4,
  pointLightIntensity = 1,
  enableGlow = true,
  enableParticles = true,
  performanceMode = 'high',
  enableAtmosphere = true,
  showBorders = false,
  onGlobeClick,
  onGlobeHover
}) => {
  const globeRef = useRef<Group>(null);
  const earthRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState<THREE.Vector3 | null>(null);
  
  // Create textures
  const earthTexture = useMemo(() => createEarthTexture(), []);
  const normalMap = useMemo(() => createNormalMap(), []);
  
  // Performance settings
  const qualitySettings = useMemo(() => {
    switch (performanceMode) {
      case 'low':
        return {
          segments: 16,
          particleCount: 100,
          enableComplexShaders: false,
        };
      case 'medium':
        return {
          segments: 32,
          particleCount: 300,
          enableComplexShaders: true,
        };
      case 'high':
      default:
        return {
          segments: 64,
          particleCount: 500,
          enableComplexShaders: true,
        };
    }
  }, [performanceMode]);
  
  // Auto rotation
  useFrame((state, delta) => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += rotationSpeed * delta;
    }
    
    // Subtle floating animation
    if (globeRef.current) {
      globeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // Click handler
  const handleClick = (event: any) => {
    event.stopPropagation();
    const point = event.point as THREE.Vector3;
    setClicked(point);
    onGlobeClick?.(point);
  };
  
  // Hover handlers
  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    const point = event.point as THREE.Vector3;
    onGlobeHover?.(point);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };
  
  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
    onGlobeHover?.(null);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  };
  
  return (
    <group ref={globeRef} position={position}>
      {/* Ambient lighting */}
      <ambientLight intensity={ambientLightIntensity} color="#ffffff" />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[2, 1, 1]}
        intensity={pointLightIntensity}
        color="#ffffff"
        castShadow={performanceMode === 'high'}
      />
      
      {/* Secondary fill light */}
      <pointLight
        position={[-1, -0.5, 1]}
        intensity={0.3}
        color="#4fc3f7"
      />
      
      {/* Main Earth sphere */}
      <mesh
        ref={earthRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow={performanceMode === 'high'}
        receiveShadow={performanceMode === 'high'}
      >
        <sphereGeometry args={[radius, qualitySettings.segments, qualitySettings.segments]} />
        {textureType === 'earth' || textureType === 'both' ? (
          <meshPhongMaterial
            map={earthTexture}
            normalMap={qualitySettings.enableComplexShaders ? normalMap : undefined}
            shininess={10}
            transparent
            opacity={hovered ? 0.9 : 1}
          />
        ) : (
          <meshBasicMaterial
            color="#2563eb"
            wireframe={textureType === 'wireframe'}
            transparent
            opacity={hovered ? 0.7 : 0.8}
          />
        )}
      </mesh>
      
      {/* Wireframe overlay */}
      {(showWireframe || textureType === 'both') && (
        <WireframeOverlay radius={radius} />
      )}
      
      {/* Atmosphere glow */}
      {enableAtmosphere && enableGlow && qualitySettings.enableComplexShaders && (
        <AtmosphereGlow radius={radius} color="#4fc3f7" />
      )}
      
      {/* Click indicator */}
      {clicked && (
        <mesh position={clicked}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      )}
      
      {/* Particle field */}
      {enableParticles && (
        <SpaceParticles count={qualitySettings.particleCount} />
      )}
      
      {/* Stars background */}
      <Stars
        radius={15}
        depth={50}
        count={performanceMode === 'high' ? 5000 : 2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* Orbit controls */}
      {enableControls && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      )}
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && hovered && (
        <Html position={[0, radius + 0.5, 0]}>
          <div className="bg-black/80 text-white p-2 rounded text-xs">
            Interactive Globe
            <br />
            Performance: {performanceMode}
            <br />
            Segments: {qualitySettings.segments}
          </div>
        </Html>
      )}
    </group>
  );
};

export default InteractiveGlobe;