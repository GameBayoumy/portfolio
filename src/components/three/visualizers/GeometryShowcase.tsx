// @ts-nocheck
'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  Text3D, 
  Center,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sparkles,
  Html,
  useTexture,
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
const HtmlAny = Html as any;

// Custom shader material for dynamic effects
const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - dot(normal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    float noise = sin(vPosition.x * 10.0 + time) * sin(vPosition.y * 10.0 + time) * 0.1;
    vec3 finalColor = color + vec3(noise) * intensity;
    finalColor += fresnel * vec3(0.2, 0.4, 1.0);
    
    gl_FragColor = vec4(finalColor, 0.8 + fresnel * 0.2);
  }
`;

const vertexShader = `
  uniform float time;
  uniform float amplitude;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normal;
    vPosition = position;
    
    vec3 newPosition = position;
    float wave = sin(position.x * 5.0 + time) * sin(position.y * 5.0 + time) * amplitude;
    newPosition += normal * wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Animated Cube Component
const AnimatedCube: React.FC<{ position: [number, number, number]; color: string; hovered: boolean }> = ({ 
  position, 
  color, 
  hovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.intensity.value = hovered ? 0.5 : 0.2;
    }
  });

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) },
    intensity: { value: 0.2 },
    amplitude: { value: 0.05 }
  }), [color]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
  <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <shaderMaterial
          attach="material"
          ref={materialRef}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
        <Sparkles count={30} scale={1 as any} size={2} speed={0.4} />
      </mesh>
    </Float>
  );
};

// Morphing Sphere Component
const MorphingSphere: React.FC<{ position: [number, number, number]; color: string; hovered: boolean }> = ({ 
  position, 
  color, 
  hovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.scale.setScalar(hovered ? 1.3 : 1);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
  <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial 
          attach="material"
          color={new THREE.Color(color)}
          distort={hovered ? 0.8 : 0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
        <Sparkles count={50} scale={1 as any} size={1} speed={0.6} />
      </mesh>
    </Float>
  );
};

// Animated Torus Component
const AnimatedTorus: React.FC<{ position: [number, number, number]; color: string; hovered: boolean }> = ({ 
  position, 
  color, 
  hovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [direction, setDirection] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * direction;
      meshRef.current.rotation.y += 0.02 * direction;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.scale.setScalar(hovered ? 1.25 : 1);

      // Change direction randomly
      if (Math.random() < 0.01) {
        setDirection(direction * -1);
      }
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
  <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1, 0.4, 16, 100]} />
        <MeshWobbleMaterial 
          attach="material"
          color={new THREE.Color(color)}
          factor={hovered ? 2 : 1}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
        <Sparkles count={40} scale={2 as any} size={1.5} speed={0.5} />
      </mesh>
    </Float>
  );
};

// Complex Octahedron Component
const ComplexOctahedron: React.FC<{ position: [number, number, number]; color: string; hovered: boolean }> = ({ 
  position, 
  color, 
  hovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.2;
      meshRef.current.scale.setScalar(hovered ? 1.4 : 1);
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.amplitude.value = hovered ? 0.15 : 0.08;
    }
  });

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) },
    intensity: { value: 0.3 },
    amplitude: { value: 0.08 }
  }), [color]);

  return (
    <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.4}>
  <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[1.3, 0]} />
        <shaderMaterial
          attach="material"
          ref={materialRef}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
        <Sparkles count={35} scale={2.2 as any} size={1.8} speed={0.7} />
      </mesh>
    </Float>
  );
};

// Shape transition component
const TransitionShape: React.FC<{ 
  position: [number, number, number]; 
  shapeIndex: number; 
  color: string;
  hovered: boolean;
}> = ({ position, shapeIndex, color, hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentShape, setCurrentShape] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShape((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  const shapes = [
    <boxGeometry key="box" args={[1, 1, 1]} />,
    <sphereGeometry key="sphere" args={[0.8, 32, 32]} />,
    <torusGeometry key="torus" args={[0.8, 0.3, 16, 100]} />,
    <octahedronGeometry key="octahedron" args={[1, 0]} />
  ];

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1}>
  <mesh ref={meshRef} position={position}>
        {shapes[currentShape]}
        <meshStandardMaterial 
          attach="material"
          color={new THREE.Color(color)}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.9}
          emissive={hovered ? new THREE.Color(color).multiplyScalar(0.2) : new THREE.Color(0x000000)}
        />
        <Sparkles count={25} scale={1.8 as any} size={1.2} speed={0.3} />
      </mesh>
    </Float>
  );
};

// Lighting setup component
const LightingSetup: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 5;
    }
    if (spotLightRef.current) {
      spotLightRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 2 + 3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        ref={lightRef}
        intensity={0.8} 
        position={[5, 5, 5]} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight 
        ref={spotLightRef}
        intensity={1.2} 
        position={[0, 5, 0]} 
        angle={0.6} 
        penumbra={0.5}
        castShadow
        color="#ffffff"
      />
      <pointLight intensity={0.6} position={[-5, -5, 5]} color="#ff6b6b" />
      <pointLight intensity={0.6} position={[5, -5, -5]} color="#4ecdc4" />
      <pointLight intensity={0.4} position={[0, 5, -5]} color="#45b7d1" />
    </>
  );
};

// Main Scene Component
const GeometryScene: React.FC = () => {
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);
  const [activeTransition, setActiveTransition] = useState(true);
  
  const { camera } = useThree();

  useEffect(() => {
    // Set camera position
    camera.position.set(0, 0, 8);
  }, [camera]);

  const shapes = [
    { id: 'cube', position: [-3, 2, 0] as [number, number, number], color: '#ff6b6b', Component: AnimatedCube },
    { id: 'sphere', position: [3, 2, 0] as [number, number, number], color: '#4ecdc4', Component: MorphingSphere },
    { id: 'torus', position: [-3, -2, 0] as [number, number, number], color: '#45b7d1', Component: AnimatedTorus },
    { id: 'octahedron', position: [3, -2, 0] as [number, number, number], color: '#f9ca24', Component: ComplexOctahedron },
  ];

  return (
    <>
      <LightingSetup />
      
      {/* Background sphere for environment */}
      <Sphere args={[50]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#0a0a0f" 
          side={THREE.BackSide}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Main geometric shapes */}
      {shapes.map(({ id, position, color, Component }) => (
        <group 
          key={id}
          onPointerEnter={() => setHoveredShape(id)}
          onPointerLeave={() => setHoveredShape(null)}
        >
          <Component 
            position={position}
            color={color}
            hovered={hoveredShape === id}
          />
          {/* Shape labels */}
          <HtmlAny position={[position[0], position[1] + 2, position[2]]} center>
            <div className={`
              text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm
              transition-all duration-300 ${hoveredShape === id ? 'bg-white/20 scale-110' : 'bg-white/10'}
            `}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </div>
          </HtmlAny>
        </group>
      ))}

      {/* Center transitioning shape */}
      <group
        onPointerEnter={() => setHoveredShape('transition')}
        onPointerLeave={() => setHoveredShape(null)}
      >
        <TransitionShape 
          position={[0, 0, 0]}
          shapeIndex={0}
          color="#e056fd"
          hovered={hoveredShape === 'transition'}
        />
  <HtmlAny position={[0, 2.5, 0]} center>
          <div className={`
            text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm
            transition-all duration-300 ${hoveredShape === 'transition' ? 'bg-purple-500/30 scale-110' : 'bg-purple-500/20'}
          `}>
            Morphing
          </div>
  </HtmlAny>
      </group>

      {/* Title */}
  <Center position={[0, 4.5, 0] as any}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
        >
          Geometry Showcase
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#222222"
          />
        </Text3D>
      </Center>

      {/* Orbit Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        maxDistance={15}
        minDistance={3}
      />

      {/* Environment mapping */}
      <Environment preset="city" background={false} />
      
      {/* Additional atmospheric effects */}
      <fog attach="fog" args={['#0a0a0f', 10, 50]} />
    </>
  );
};

// Control Panel Component
const ControlPanel: React.FC<{
  onReset: () => void;
  autoRotate: boolean;
  onAutoRotateToggle: () => void;
}> = ({ onReset, autoRotate, onAutoRotateToggle }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-6 z-10 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10"
    >
      <div className="flex flex-col gap-3">
        <h3 className="text-white text-sm font-medium mb-2">Controls</h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white text-xs rounded-lg border border-blue-400/30 transition-colors"
        >
          Reset View
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAutoRotateToggle}
          className={`px-4 py-2 text-xs rounded-lg border transition-colors ${
            autoRotate 
              ? 'bg-green-500/20 hover:bg-green-500/30 text-white border-green-400/30' 
              : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border-gray-400/30'
          }`}
        >
          {autoRotate ? 'Stop Auto-Rotate' : 'Auto-Rotate'}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-4"
      />
      <p className="text-white/70 text-sm">Loading Geometry Showcase...</p>
    </div>
  </div>
);

// Main GeometryShowcase Component
const GeometryShowcase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    // Reset functionality would be implemented here
    console.log('Resetting view...');
  };

  const handleAutoRotateToggle = () => {
    setAutoRotate(!autoRotate);
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading 3D scene</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-gray-900"
          >
            <LoadingScreen />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            <Canvas
              shadows
              gl={{ 
                antialias: true, 
                alpha: true,
                powerPreference: "high-performance"
              }}
              camera={{ 
                position: [0, 0, 8], 
                fov: 60,
                near: 0.1,
                far: 100
              }}
              onCreated={({ gl }) => {
                gl.setSize(window.innerWidth, window.innerHeight);
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
              }}
            >
              <React.Suspense fallback={<LoadingScreen />}>
                <GeometryScene />
              </React.Suspense>
            </Canvas>

            <ControlPanel 
              onReset={handleReset}
              autoRotate={autoRotate}
              onAutoRotateToggle={handleAutoRotateToggle}
            />

            {/* Info panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 right-6 z-10 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs"
            >
              <h3 className="text-white text-sm font-medium mb-2">Interactive 3D Geometry</h3>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Hover over shapes for effects</li>
                <li>• Drag to rotate the scene</li>
                <li>• Scroll to zoom in/out</li>
                <li>• Center shape morphs automatically</li>
                <li>• Dynamic lighting and materials</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeometryShowcase;