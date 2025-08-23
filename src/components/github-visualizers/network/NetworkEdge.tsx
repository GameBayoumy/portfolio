'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute, Color, Vector3, AdditiveBlending } from 'three';
import * as THREE from 'three';

interface NetworkConnection {
  source: {
    id: number;
    name: string;
    position: Vector3;
    color: Color;
  };
  target: {
    id: number;
    name: string;
    position: Vector3;
    color: Color;
  };
  type: 'fork' | 'language' | 'topic' | 'name';
  strength: number;
  opacity: number;
}

interface NetworkEdgeProps {
  connections: NetworkConnection[];
  selectedNodeId?: number | null;
  hoveredNodeId?: number | null;
}

const NetworkEdge: React.FC<NetworkEdgeProps> = ({
  connections,
  selectedNodeId,
  hoveredNodeId
}) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const animatedLinesRef = useRef<THREE.LineSegments>(null);

  // Connection type colors
  const connectionColors = useMemo(() => ({
    'fork': new Color('#ffd700'),      // Gold
    'language': new Color('#00ff88'),  // Green  
    'topic': new Color('#ff6b6b'),     // Red
    'name': new Color('#4ecdc4')       // Cyan
  }), []);

  // Create static geometry for all connections
  const staticGeometry = useMemo(() => {
    const points: number[] = [];
    const colors: number[] = [];
    const opacities: number[] = [];
    
    connections.forEach((connection) => {
      // Add line points
      points.push(
        connection.source.position.x,
        connection.source.position.y,
        connection.source.position.z,
        connection.target.position.x,
        connection.target.position.y,
        connection.target.position.z
      );
      
      // Connection color based on type
      const lineColor = connectionColors[connection.type] || connectionColors['name'];
      
      // Add colors for both vertices
      colors.push(
        lineColor.r, lineColor.g, lineColor.b,
        lineColor.r, lineColor.g, lineColor.b
      );
      
      // Base opacity
      const baseOpacity = connection.opacity * connection.strength;
      opacities.push(baseOpacity, baseOpacity);
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    geometry.setAttribute('opacity', new BufferAttribute(new Float32Array(opacities), 1));
    
    return geometry;
  }, [connections, connectionColors]);

  // Create animated geometry for highlighted connections
  const animatedGeometry = useMemo(() => {
    const highlightedConnections = connections.filter(connection =>
      (selectedNodeId && (connection.source.id === selectedNodeId || connection.target.id === selectedNodeId)) ||
      (hoveredNodeId && (connection.source.id === hoveredNodeId || connection.target.id === hoveredNodeId))
    );

    if (highlightedConnections.length === 0) {
      return null;
    }

    const points: number[] = [];
    const colors: number[] = [];
    
    highlightedConnections.forEach((connection) => {
      // Add line points
      points.push(
        connection.source.position.x,
        connection.source.position.y,
        connection.source.position.z,
        connection.target.position.x,
        connection.target.position.y,
        connection.target.position.z
      );
      
      // Brighter color for highlighted connections
      const lineColor = connectionColors[connection.type] || connectionColors['name'];
      lineColor.multiplyScalar(1.5);
      
      colors.push(
        lineColor.r, lineColor.g, lineColor.b,
        lineColor.r, lineColor.g, lineColor.b
      );
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
    
    return geometry;
  }, [connections, connectionColors, selectedNodeId, hoveredNodeId]);

  useFrame((state) => {
    if (linesRef.current) {
      // Update static lines opacity based on interaction state
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      const targetOpacity = selectedNodeId || hoveredNodeId ? 0.2 : 0.4;
      material.opacity += (targetOpacity - material.opacity) * 0.1;
    }

    if (animatedLinesRef.current && animatedGeometry) {
      // Pulse effect for highlighted connections
      const material = animatedLinesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  // Temporarily disabled for build compatibility
  return null;
};

export default NetworkEdge;
// Temporarily disabled for build
