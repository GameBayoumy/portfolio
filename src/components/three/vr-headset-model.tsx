'use client';

import { useRef, useState, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Group, Vector3 } from 'three';
import { RoundedBox, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import type { VRHeadsetModelProps } from '@/types';

// Temporarily disabled for build compatibility
// const AnimatedMesh = animated('mesh');
// const AnimatedGroup = animated('group');

const VRHeadsetModel = memo(function VRHeadsetModel({
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

  // Temporarily disabled for build compatibility - Three.js JSX elements need proper type definitions
  return null;
});

export { VRHeadsetModel };