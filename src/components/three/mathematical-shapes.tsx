'use client';

import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface MathematicalShapesProps {
  complexity?: 'low' | 'medium' | 'high';
  animationSpeed?: number;
  glowEffect?: boolean;
}

const MathematicalShapes = memo(function MathematicalShapes({
  complexity = 'medium',
  animationSpeed = 1,
  glowEffect = true,
}: MathematicalShapesProps) {
  const groupRef = useRef<Group>(null);
  
  // Complexity settings
  const settings = useMemo(() => {
    const complexityMap = {
      low: { shapes: 3, segments: 16, detail: 2 },
      medium: { shapes: 5, segments: 32, detail: 3 },
      high: { shapes: 8, segments: 64, detail: 4 },
    };
    return complexityMap[complexity];
  }, [complexity]);

  // Generate mathematical geometries
  const geometries = useMemo(() => {
    return [
      // Torus Knot
      new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16, 3, 5),
      // Icosahedron
      new THREE.IcosahedronGeometry(0.6, settings.detail),
      // Octahedron
      new THREE.OctahedronGeometry(0.7),
      // Dodecahedron
      new THREE.DodecahedronGeometry(0.5),
      // Complex Torus
      new THREE.TorusGeometry(0.7, 0.2, 16, 32),
      // Cylinder with twist
      new THREE.CylinderGeometry(0.3, 0.5, 1.2, settings.segments),
      // Cone
      new THREE.ConeGeometry(0.5, 1, settings.segments),
      // Sphere with variations
      new THREE.SphereGeometry(0.6, settings.segments, settings.segments),
    ].slice(0, settings.shapes);
  }, [settings]);

  const colors = [
    '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', 
    '#ffbe0b', '#ff5400', '#ff8500', '#c77dff'
  ];

  useFrame((state) => {
    if (!groupRef.current || !groupRef.current.children) return;

    const time = state.clock.elapsedTime * animationSpeed;

    try {
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof Mesh && child.rotation && child.position && child.scale) {
        // Rotate each shape differently
        child.rotation.x = time * (0.5 + index * 0.1);
        child.rotation.y = time * (0.3 + index * 0.05);
        child.rotation.z = time * (0.2 + index * 0.02);

        // Orbital motion around center
        const radius = 4 + index * 0.5;
        const angle = time * 0.2 + index * (Math.PI * 2 / settings.shapes);
        
        child.position.x = Math.cos(angle) * radius;
        child.position.z = Math.sin(angle) * radius;
        child.position.y = Math.sin(time * 0.5 + index) * 2;

          // Pulsing scale effect
          const scale = 0.8 + Math.sin(time * 2 + index) * 0.2;
          child.scale.setScalar(scale);
        }
      });
    } catch (error) {
      console.warn('Failed to animate mathematical shapes:', error);
    }

    // Rotate entire group
    if (groupRef.current.rotation) {
      groupRef.current.rotation.y += 0.002 * animationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geometry, index) => (
        <Float
          key={index}
          speed={1 + index * 0.1}
          rotationIntensity={0.3}
          floatIntensity={0.2}
        >
          <mesh
            geometry={geometry}
            position={[
              Math.cos(index * (Math.PI * 2 / settings.shapes)) * 4,
              Math.sin(index * 0.5) * 2,
              Math.sin(index * (Math.PI * 2 / settings.shapes)) * 4,
            ]}
          >
            <meshStandardMaterial
              color={colors[index % colors.length]}
              transparent
              opacity={0.7}
              metalness={0.8}
              roughness={0.2}
              emissive={colors[index % colors.length]}
              emissiveIntensity={glowEffect ? 0.2 : 0}
              wireframe={complexity === 'low'}
            />
          </mesh>
        </Float>
      ))}

      {/* Central connecting lines */}
      {complexity === 'high' && (
        <LineConnections
          count={settings.shapes}
          radius={4}
          color="#4a90e2"
          opacity={0.3}
        />
      )}
    </group>
  );
});

// Component for drawing connecting lines between shapes
const LineConnections = memo(function LineConnections({
  count,
  radius,
  color,
  opacity,
}: {
  count: number;
  radius: number;
  color: string;
  opacity: number;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle1 = (i / count) * Math.PI * 2;
      const angle2 = ((i + 1) / count) * Math.PI * 2;
      
      points.push(
        new THREE.Vector3(Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius),
        new THREE.Vector3(Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius)
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [count, radius]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        linewidth={2}
      />
    </lineSegments>
  );
});

export { MathematicalShapes };