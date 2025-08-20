'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Group, Vector3 } from 'three';
import { RoundedBox, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import type { VRHeadsetModelProps } from '@/types';

const AnimatedMesh = animated(Mesh);
const AnimatedGroup = animated(Group);

export function VRHeadsetModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  interactive = true,
  animationSpeed = 1,
  glowIntensity = 0.5,
}: VRHeadsetModelProps) {
  const groupRef = useRef<Group>(null);
  const headsetRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { viewport } = useThree();

  // Responsive scaling based on viewport
  const responsiveScale = Math.min(viewport.width / 8, viewport.height / 8, 1.2);

  // Spring animation for interactions
  const { rotationY, scaleValue, glowColor } = useSpring({
    rotationY: clicked ? Math.PI * 2 : hovered ? 0.2 : 0,
    scaleValue: hovered ? 1.1 : 1,
    glowColor: hovered ? '#00f0ff' : '#4a90e2',
    config: { mass: 1, tension: 280, friction: 120 },
  });

  // Continuous rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005 * animationSpeed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
    
    // Reset click animation
    if (clicked && state.clock.elapsedTime > 2) {
      setClicked(false);
    }
  });

  const handleClick = () => {
    if (interactive) {
      setClicked(true);
      // Optional: emit custom event for parent components
      window.dispatchEvent(new CustomEvent('vr-headset-clicked'));
    }
  };

  const handlePointerOver = () => {
    if (interactive) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <AnimatedGroup
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale[0] * responsiveScale, scale[1] * responsiveScale, scale[2] * responsiveScale]}
    >
      {/* Main Headset Body */}
      <AnimatedMesh
        ref={headsetRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        rotation-y={rotationY}
        scale={scaleValue}
      >
        <RoundedBox args={[2.5, 1.2, 1.8]} radius={0.1} smoothness={4}>
          <MeshDistortMaterial
            color={glowColor}
            transparent
            opacity={0.9}
            distort={0.1}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive={glowColor}
            emissiveIntensity={glowIntensity}
          />
        </RoundedBox>
      </AnimatedMesh>

      {/* Front Visor */}
      <mesh position={[0, 0, 0.9]}>
        <boxGeometry args={[2.2, 1, 0.05]} />
        <meshStandardMaterial
          color="#000814"
          transparent
          opacity={0.8}
          metalness={0.9}
          roughness={0.1}
          emissive="#001d3d"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Side Cameras/Sensors */}
      {[-0.8, 0.8].map((x, index) => (
        <Float key={index} speed={1.5} rotationIntensity={0.2} floatIntensity={0.1}>
          <mesh position={[x, 0.3, 0.85]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
            <meshStandardMaterial
              color="#003566"
              emissive="#0077b6"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}

      {/* Top Tracking Sensors */}
      {[-0.5, 0, 0.5].map((x, index) => (
        <mesh key={index} position={[x, 0.6, 0.5]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#7209b7"
            emissive="#c77dff"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Head Strap */}
      <mesh position={[0, 0, -1.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#2d3748"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Controller Hints (floating beside headset) */}
      {interactive && hovered && (
        <>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
            <mesh position={[-2.5, -0.5, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.08, 0.12, 0.8, 16]} />
              <meshStandardMaterial
                color="#ff6b9d"
                emissive="#ff006e"
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          </Float>
          
          <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.3}>
            <mesh position={[2.5, -0.5, 0]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.08, 0.12, 0.8, 16]} />
              <meshStandardMaterial
                color="#ff6b9d"
                emissive="#ff006e"
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          </Float>
        </>
      )}

      {/* Floating Text Labels */}
      {hovered && (
        <>
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.3}
            color="#00f0ff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff2"
          >
            XR Developer
          </Text>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-regular.woff2"
          >
            Click to explore VR projects
          </Text>
        </>
      )}

      {/* Particle Trails when clicked */}
      {clicked && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <Float key={i} speed={3 + i * 0.1} rotationIntensity={1} floatIntensity={2}>
              <mesh
                position={[
                  (Math.random() - 0.5) * 4,
                  (Math.random() - 0.5) * 4,
                  (Math.random() - 0.5) * 4,
                ]}
              >
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial
                  color="#00f0ff"
                  emissive="#00f0ff"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </Float>
          ))}
        </>
      )}

      {/* Ambient Glow Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[2.8, 3.2, 32]} />
        <meshStandardMaterial
          color="#4a90e2"
          transparent
          opacity={0.1}
          emissive="#4a90e2"
          emissiveIntensity={glowIntensity * 0.5}
        />
      </mesh>
    </AnimatedGroup>
  );
}