'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute, Color, AdditiveBlending, Vector3 } from 'three';
import * as THREE from 'three';

interface NetworkConnection {
  source: {
    id: number;
    name: string;
    position: Vector3;
    renderPosition: Vector3;
    color: Color;
  };
  target: {
    id: number;
    name: string;
    position: Vector3;
    renderPosition: Vector3;
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

  type EdgeGeometryData = {
    geometry: BufferGeometry;
    positions: Float32Array;
    positionAttribute: BufferAttribute;
  };

  type HighlightGeometryData = EdgeGeometryData & {
    connections: NetworkConnection[];
  };

  // Connection type colors
  const connectionColors = useMemo(() => ({
    'fork': new Color('#ffd700'),      // Gold
    'language': new Color('#00ff88'),  // Green
    'topic': new Color('#ff6b6b'),     // Red
    'name': new Color('#4ecdc4')       // Cyan
  }), []);

  const staticData = useMemo<EdgeGeometryData | null>(() => {
    if (connections.length === 0) {
      return null;
    }

    const positions = new Float32Array(connections.length * 6);
    const colors = new Float32Array(connections.length * 6);
    const opacities = new Float32Array(connections.length * 2);

    connections.forEach((connection, index) => {
      const baseIndex = index * 6;
      const opacityIndex = index * 2;

      const sourcePosition = connection.source.renderPosition;
      const targetPosition = connection.target.renderPosition;

      positions[baseIndex] = sourcePosition.x;
      positions[baseIndex + 1] = sourcePosition.y;
      positions[baseIndex + 2] = sourcePosition.z;
      positions[baseIndex + 3] = targetPosition.x;
      positions[baseIndex + 4] = targetPosition.y;
      positions[baseIndex + 5] = targetPosition.z;

      const lineColor = connectionColors[connection.type] || connectionColors['name'];

      colors[baseIndex] = lineColor.r;
      colors[baseIndex + 1] = lineColor.g;
      colors[baseIndex + 2] = lineColor.b;
      colors[baseIndex + 3] = lineColor.r;
      colors[baseIndex + 4] = lineColor.g;
      colors[baseIndex + 5] = lineColor.b;

      const baseOpacity = connection.opacity * connection.strength;
      opacities[opacityIndex] = baseOpacity;
      opacities[opacityIndex + 1] = baseOpacity;
    });

    const geometry = new BufferGeometry();
    const positionAttribute = new BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('opacity', new BufferAttribute(opacities, 1));

    return { geometry, positions, positionAttribute };
  }, [connections, connectionColors]);

  const animatedData = useMemo<HighlightGeometryData | null>(() => {
    const highlightedConnections = connections.filter((connection) =>
      (selectedNodeId && (connection.source.id === selectedNodeId || connection.target.id === selectedNodeId)) ||
      (hoveredNodeId && (connection.source.id === hoveredNodeId || connection.target.id === hoveredNodeId))
    );

    if (highlightedConnections.length === 0) {
      return null;
    }

    const positions = new Float32Array(highlightedConnections.length * 6);
    const colors = new Float32Array(highlightedConnections.length * 6);

    highlightedConnections.forEach((connection, index) => {
      const baseIndex = index * 6;

      const sourcePosition = connection.source.renderPosition;
      const targetPosition = connection.target.renderPosition;

      positions[baseIndex] = sourcePosition.x;
      positions[baseIndex + 1] = sourcePosition.y;
      positions[baseIndex + 2] = sourcePosition.z;
      positions[baseIndex + 3] = targetPosition.x;
      positions[baseIndex + 4] = targetPosition.y;
      positions[baseIndex + 5] = targetPosition.z;

      const baseColor = connectionColors[connection.type] || connectionColors['name'];
      const highlightColor = baseColor.clone().multiplyScalar(1.5);

      colors[baseIndex] = highlightColor.r;
      colors[baseIndex + 1] = highlightColor.g;
      colors[baseIndex + 2] = highlightColor.b;
      colors[baseIndex + 3] = highlightColor.r;
      colors[baseIndex + 4] = highlightColor.g;
      colors[baseIndex + 5] = highlightColor.b;
    });

    const geometry = new BufferGeometry();
    const positionAttribute = new BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return {
      geometry,
      positions,
      positionAttribute,
      connections: highlightedConnections,
    };
  }, [connections, connectionColors, selectedNodeId, hoveredNodeId]);

  useEffect(() => {
    return () => {
      staticData?.geometry.dispose();
      animatedData?.geometry.dispose();
    };
  }, [staticData, animatedData]);

  useFrame((state) => {
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      const targetOpacity = selectedNodeId || hoveredNodeId ? 0.18 : 0.35;
      material.opacity += (targetOpacity - material.opacity) * 0.08;
    }

    if (animatedLinesRef.current) {
      const material = animatedLinesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 3.5) * 0.2;
    }

    if (staticData) {
      connections.forEach((connection, index) => {
        const baseIndex = index * 6;
        const sourcePosition = connection.source.renderPosition;
        const targetPosition = connection.target.renderPosition;

        staticData.positions[baseIndex] = sourcePosition.x;
        staticData.positions[baseIndex + 1] = sourcePosition.y;
        staticData.positions[baseIndex + 2] = sourcePosition.z;
        staticData.positions[baseIndex + 3] = targetPosition.x;
        staticData.positions[baseIndex + 4] = targetPosition.y;
        staticData.positions[baseIndex + 5] = targetPosition.z;
      });

      staticData.positionAttribute.needsUpdate = true;
    }

    if (animatedData) {
      animatedData.connections.forEach((connection, index) => {
        const baseIndex = index * 6;
        const sourcePosition = connection.source.renderPosition;
        const targetPosition = connection.target.renderPosition;

        animatedData.positions[baseIndex] = sourcePosition.x;
        animatedData.positions[baseIndex + 1] = sourcePosition.y;
        animatedData.positions[baseIndex + 2] = sourcePosition.z;
        animatedData.positions[baseIndex + 3] = targetPosition.x;
        animatedData.positions[baseIndex + 4] = targetPosition.y;
        animatedData.positions[baseIndex + 5] = targetPosition.z;
      });

      animatedData.positionAttribute.needsUpdate = true;
    }
  });

  if (connections.length === 0) {
    return null;
  }

  return (
    <group>
      {staticData && (
        <lineSegments ref={linesRef} geometry={staticData.geometry} frustumCulled={false}>
          <lineBasicMaterial
            vertexColors
            transparent
            depthWrite={false}
            opacity={0.3}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      )}

      {animatedData && (
        <lineSegments ref={animatedLinesRef} geometry={animatedData.geometry} frustumCulled={false}>
          <lineBasicMaterial
            vertexColors
            transparent
            depthWrite={false}
            opacity={0.85}
            linewidth={2}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      )}
    </group>
  );
};

export default NetworkEdge;
