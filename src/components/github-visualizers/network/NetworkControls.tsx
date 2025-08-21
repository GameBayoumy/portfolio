'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkControlsProps {
  autoRotate?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  target?: [number, number, number];
  onCameraMove?: (position: THREE.Vector3, target: THREE.Vector3) => void;
}

const NetworkControls: React.FC<NetworkControlsProps> = ({
  autoRotate = false,
  enableDamping = true,
  dampingFactor = 0.05,
  autoRotateSpeed = 0.5,
  minDistance = 8,
  maxDistance = 60,
  minPolarAngle = Math.PI / 6,
  maxPolarAngle = Math.PI - Math.PI / 6,
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  target = [0, 0, 0],
  onCameraMove
}) => {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();

  // Camera animation state
  const cameraState = useRef({
    targetPosition: new THREE.Vector3(25, 20, 25),
    targetLookAt: new THREE.Vector3(...target),
    animating: false
  });

  useEffect(() => {
    if (controlsRef.current) {
      // Set initial camera position smoothly
      cameraState.current.animating = true;
      
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      const animateCamera = (progress: number) => {
        if (progress >= 1) {
          camera.position.copy(cameraState.current.targetPosition);
          controlsRef.current.target.copy(cameraState.current.targetLookAt);
          cameraState.current.animating = false;
          controlsRef.current.update();
          return;
        }
        
        // Smooth interpolation
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPosition, cameraState.current.targetPosition, easeProgress);
        controlsRef.current.target.lerpVectors(startTarget, cameraState.current.targetLookAt, easeProgress);
        
        controlsRef.current.update();
        
        requestAnimationFrame(() => animateCamera(progress + 0.02));
      };
      
      animateCamera(0);
    }
  }, [camera]);

  useFrame(() => {
    if (controlsRef.current && !cameraState.current.animating) {
      controlsRef.current.update();
      
      // Call callback if camera has moved
      if (onCameraMove) {
        onCameraMove(camera.position, controlsRef.current.target);
      }
    }
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!controlsRef.current) return;
      
      const moveSpeed = 2;
      const rotateSpeed = 0.2;
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          controlsRef.current.object.position.z -= moveSpeed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          controlsRef.current.object.position.z += moveSpeed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          controlsRef.current.object.position.x -= moveSpeed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          controlsRef.current.object.position.x += moveSpeed;
          break;
        case 'KeyQ':
          controlsRef.current.object.position.y += moveSpeed;
          break;
        case 'KeyE':
          controlsRef.current.object.position.y -= moveSpeed;
          break;
        case 'KeyR':
          // Reset camera position
          cameraState.current.targetPosition.set(25, 20, 25);
          cameraState.current.targetLookAt.set(0, 0, 0);
          cameraState.current.animating = true;
          break;
        case 'Space':
          // Toggle auto-rotation
          controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
          event.preventDefault();
          break;
      }
      
      controlsRef.current.update();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate={enableRotate}
      minDistance={minDistance}
      maxDistance={maxDistance}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      screenSpacePanning={false}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      target={target}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  );
};

export default NetworkControls;