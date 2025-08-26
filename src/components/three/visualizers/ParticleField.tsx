import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Particle configuration interface
interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  mouseInfluence: number;
  colorRange: [string, string];
  opacity: number;
  turbulence: number;
}

// Default particle configuration
const defaultConfig: ParticleConfig = {
  count: 5000,
  size: 0.02,
  speed: 0.5,
  mouseInfluence: 2.0,
  colorRange: ['#0ea5e9', '#8b5cf6'],
  opacity: 0.8,
  turbulence: 0.3,
};

// Particle system component
interface ParticleSystemProps {
  config: ParticleConfig;
}

function ParticleSystem({ config }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse, camera } = useThree();
  
  // Particle data storage
  const particleData = useMemo(() => {
    const data = [];
    const positions = new Float32Array(config.count * 3);
    const velocities = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);
    const sizes = new Float32Array(config.count);
    const phases = new Float32Array(config.count);
    
    // Color interpolation
    const color1 = new THREE.Color(config.colorRange[0]);
    const color2 = new THREE.Color(config.colorRange[1]);
    
    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      
      // Initial positions (scattered in 3D space)
      positions[i3] = (Math.random() - 0.5) * viewport.width * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Initial velocities
      velocities[i3] = (Math.random() - 0.5) * config.speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * config.speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * config.speed * 0.5;
      
      // Color interpolation
      const t = Math.random();
      const color = color1.clone().lerp(color2, t);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Varying sizes
      sizes[i] = config.size * (0.5 + Math.random() * 1.5);
      
      // Phase offset for wave motion
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return {
      positions,
      velocities,
      colors,
      sizes,
      phases,
    };
  }, [config.count, config.speed, config.size, config.colorRange, viewport]);
  
  // Mouse position in 3D space
  const mousePos = useMemo(() => new THREE.Vector3(), []);
  
  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const { positions, velocities, colors, sizes, phases } = particleData;
    
    // Update mouse position
    mousePos.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );
    
    // Temporary vectors for calculations
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempScale = new THREE.Vector3();
    const mouseForce = new THREE.Vector3();
    
    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      
      // Current position
      tempPosition.set(
        positions[i3],
        positions[i3 + 1],
        positions[i3 + 2]
      );
      
      // Mouse interaction force
      mouseForce.subVectors(mousePos, tempPosition);
      const distance = mouseForce.length();
      const maxInfluenceDistance = 3;
      
      if (distance < maxInfluenceDistance && distance > 0) {
        const influence = (1 - distance / maxInfluenceDistance) * config.mouseInfluence;
        mouseForce.normalize().multiplyScalar(influence * 0.01);
        
        velocities[i3] += mouseForce.x;
        velocities[i3 + 1] += mouseForce.y;
        velocities[i3 + 2] += mouseForce.z * 0.5;
      }
      
      // Add turbulence
      const turbulenceX = Math.sin(time * 0.5 + phases[i]) * config.turbulence * 0.01;
      const turbulenceY = Math.cos(time * 0.7 + phases[i] * 1.3) * config.turbulence * 0.01;
      const turbulenceZ = Math.sin(time * 0.3 + phases[i] * 0.7) * config.turbulence * 0.005;
      
      velocities[i3] += turbulenceX;
      velocities[i3 + 1] += turbulenceY;
      velocities[i3 + 2] += turbulenceZ;
      
      // Apply damping
      velocities[i3] *= 0.99;
      velocities[i3 + 1] *= 0.99;
      velocities[i3 + 2] *= 0.99;
      
      // Update positions
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Boundary wrapping
      const boundaryX = viewport.width;
      const boundaryY = viewport.height;
      const boundaryZ = 5;
      
      if (positions[i3] > boundaryX) positions[i3] = -boundaryX;
      if (positions[i3] < -boundaryX) positions[i3] = boundaryX;
      if (positions[i3 + 1] > boundaryY) positions[i3 + 1] = -boundaryY;
      if (positions[i3 + 1] < -boundaryY) positions[i3 + 1] = boundaryY;
      if (positions[i3 + 2] > boundaryZ) positions[i3 + 2] = -boundaryZ;
      if (positions[i3 + 2] < -boundaryZ) positions[i3 + 2] = boundaryZ;
      
      // Dynamic scaling based on distance and time
      const waveScale = 1 + Math.sin(time * 2 + phases[i]) * 0.3;
      const distanceScale = Math.max(0.2, 1 - distance / 10);
      const finalSize = sizes[i] * waveScale * distanceScale;
      
      tempScale.setScalar(finalSize);
      
      // Set matrix for this instance
      tempMatrix.compose(tempPosition, new THREE.Quaternion(), tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);
      
      // Dynamic color based on velocity and position
      const speed = Math.sqrt(velocities[i3] ** 2 + velocities[i3 + 1] ** 2 + velocities[i3 + 2] ** 2);
      const colorIntensity = Math.min(1, speed * 10 + 0.3);
      const hue = (time * 0.1 + phases[i] * 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 0.7, colorIntensity * 0.8);
      
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  // Geometry and material
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: config.opacity,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }), [config.opacity]);
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, config.count]}
      frustumCulled={false}
    />
  );
}

// Background effect component
function ParticleBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    
    if (material.uniforms) {
      material.uniforms.time.value = time;
      material.uniforms.mouse.value.set(state.mouse.x, state.mouse.y);
    }
  });
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        resolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 mouse;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        void main() {
          vec2 st = vUv;
          vec2 center = vec2(0.5) + mouse * 0.1;
          float dist = distance(st, center);
          
          float wave = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
          float radial = 1.0 - smoothstep(0.0, 0.8, dist);
          
          vec3 color = mix(
            vec3(0.05, 0.1, 0.2),
            vec3(0.1, 0.2, 0.4),
            wave * radial
          );
          
          gl_FragColor = vec4(color, radial * 0.3);
        }
      `,
    });
  }, [viewport]);
  
  return (
    <mesh ref={meshRef} position={[0, 0, -10] as [number, number, number]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

// Control panel component
interface ControlPanelProps {
  config: ParticleConfig;
  onConfigChange: (config: Partial<ParticleConfig>) => void;
  visible: boolean;
}

function ControlPanel({ config, onConfigChange, visible }: ControlPanelProps) {
  if (!visible) return null;
  
  return (
    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white text-sm">
      <h3 className="font-semibold mb-3">Particle Controls</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs opacity-70 mb-1">Count: {config.count}</label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={config.count}
            onChange={(e) => onConfigChange({ count: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs opacity-70 mb-1">Speed: {config.speed.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={config.speed}
            onChange={(e) => onConfigChange({ speed: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs opacity-70 mb-1">Mouse Influence: {config.mouseInfluence.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={config.mouseInfluence}
            onChange={(e) => onConfigChange({ mouseInfluence: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs opacity-70 mb-1">Turbulence: {config.turbulence.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.turbulence}
            onChange={(e) => onConfigChange({ turbulence: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs opacity-70 mb-1">Opacity: {config.opacity.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.opacity}
            onChange={(e) => onConfigChange({ opacity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

// Main ParticleField component
interface ParticleFieldProps {
  config?: Partial<ParticleConfig>;
  showControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ParticleField({
  config: configOverrides = {},
  showControls = false,
  className = '',
  style = {},
}: ParticleFieldProps) {
  const [config, setConfig] = useState<ParticleConfig>({
    ...defaultConfig,
    ...configOverrides,
  });
  
  const [showControlPanel, setShowControlPanel] = useState(false);
  
  const handleConfigChange = (updates: Partial<ParticleConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'c' || e.key === 'C') {
      setShowControlPanel(prev => !prev);
    }
  };
  
  useEffect(() => {
    if (showControls && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showControls]);
  
  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 2]}
      >
        <ParticleBackground />
        <ParticleSystem config={config} />
      </Canvas>
      
      {showControls && (
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          visible={showControlPanel}
        />
      )}
      
      {showControls && (
        <div className="absolute bottom-4 left-4 text-white/60 text-xs">
          Press 'C' to toggle controls
        </div>
      )}
    </div>
  );
}

// Export types and utilities
export type { ParticleConfig, ParticleFieldProps };
export { defaultConfig };

// Preset configurations
export const presets = {
  gentle: {
    count: 3000,
    speed: 0.3,
    mouseInfluence: 1.0,
    turbulence: 0.1,
    opacity: 0.6,
  } as Partial<ParticleConfig>,
  
  energetic: {
    count: 7000,
    speed: 1.2,
    mouseInfluence: 3.0,
    turbulence: 0.5,
    opacity: 0.9,
  } as Partial<ParticleConfig>,
  
  cosmic: {
    count: 5000,
    speed: 0.4,
    mouseInfluence: 2.5,
    turbulence: 0.3,
    colorRange: ['#1e1b4b', '#7c3aed'],
    opacity: 0.7,
  } as Partial<ParticleConfig>,
  
  ocean: {
    count: 4000,
    speed: 0.6,
    mouseInfluence: 1.5,
    turbulence: 0.4,
    colorRange: ['#0ea5e9', '#06b6d4'],
    opacity: 0.8,
  } as Partial<ParticleConfig>,
};