# Three.js 3D Visualization Architecture

## 3D Repository Network Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 3D Visualization Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ React Three │ │ Scene        │ │ Camera Controls        │ │
│  │ Fiber       │ │ Manager      │ │ & Interactions         │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ Node        │ │ Edge         │ │ Animation              │ │
│  │ System      │ │ System       │ │ Controller             │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ Force       │ │ Collision    │ │ Performance            │ │
│  │ Simulation  │ │ Detection    │ │ Optimizer              │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core 3D Components Architecture

### 1. Scene Manager Component

```typescript
interface SceneConfig {
  backgroundColor: string;
  fogNear: number;
  fogFar: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
}

interface RepositoryNetwork3DProps {
  repositories: Repository[];
  width: number;
  height: number;
  interactive?: boolean;
  onNodeClick?: (repo: Repository) => void;
  onNodeHover?: (repo: Repository | null) => void;
}

const RepositoryNetwork3D: React.FC<RepositoryNetwork3DProps> = ({
  repositories,
  width,
  height,
  interactive = true,
  onNodeClick,
  onNodeHover
}) => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Process repository data into network structure
  useEffect(() => {
    const processedData = NetworkDataProcessor.processRepositories(repositories);
    setNetworkData(processedData);
  }, [repositories]);
  
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Scene Setup */}
        <fog attach="fog" args={['#1a1a1a', 30, 100]} />
        
        {/* Network Visualization */}
        {networkData && (
          <NetworkScene
            data={networkData}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            onNodeInteraction={{
              onHover: (nodeId) => {
                setHoveredNode(nodeId);
                const repo = repositories.find(r => r.id.toString() === nodeId);
                onNodeHover?.(repo || null);
              },
              onClick: (nodeId) => {
                setSelectedNode(nodeId);
                const repo = repositories.find(r => r.id.toString() === nodeId);
                onNodeClick?.(repo);
              }
            }}
            interactive={interactive}
          />
        )}
        
        {/* Camera Controls */}
        <CameraControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI}
        />
        
        {/* Performance Monitor */}
        <PerformanceMonitor
          onIncline={() => console.log('Performance increased')}
          onDecline={() => console.log('Performance decreased')}
        />
      </Canvas>
    </div>
  );
};
```

### 2. Network Scene Component

```typescript
interface NetworkSceneProps {
  data: NetworkData;
  hoveredNode: string | null;
  selectedNode: string | null;
  onNodeInteraction: NodeInteractionHandlers;
  interactive: boolean;
}

const NetworkScene: React.FC<NetworkSceneProps> = ({
  data,
  hoveredNode,
  selectedNode,
  onNodeInteraction,
  interactive
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'stable' | 'interacting'>('loading');
  
  // Force simulation for node positioning
  const forceSimulation = useMemo(() => {
    return new ForceSimulation(data.nodes, data.edges);
  }, [data]);
  
  // Animation controller
  useFrame((state, delta) => {
    if (groupRef.current && animationPhase === 'loading') {
      forceSimulation.tick(delta);
      
      // Update node positions
      data.nodes.forEach((node, index) => {
        const mesh = groupRef.current?.children[index] as THREE.Mesh;
        if (mesh) {
          mesh.position.lerp(
            new THREE.Vector3(node.x, node.y, node.z),
            0.1
          );
        }
      });
      
      // Check if simulation has stabilized
      if (forceSimulation.isStable()) {
        setAnimationPhase('stable');
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Render Edges */}
      <EdgesRenderer
        edges={data.edges}
        nodes={data.nodes}
        hoveredNode={hoveredNode}
        selectedNode={selectedNode}
      />
      
      {/* Render Nodes */}
      {data.nodes.map((node) => (
        <RepositoryNode
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          isSelected={selectedNode === node.id}
          onHover={interactive ? onNodeInteraction.onHover : undefined}
          onClick={interactive ? onNodeInteraction.onClick : undefined}
          animationPhase={animationPhase}
        />
      ))}
      
      {/* Particle Effects */}
      <ParticleField
        count={100}
        area={80}
        color="#4a90e2"
        opacity={0.3}
      />
    </group>
  );
};
```

### 3. Repository Node Component

```typescript
interface RepositoryNodeProps {
  node: NetworkNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover?: (nodeId: string) => void;
  onClick?: (nodeId: string) => void;
  animationPhase: AnimationPhase;
}

const RepositoryNode: React.FC<RepositoryNodeProps> = ({
  node,
  isHovered,
  isSelected,
  onHover,
  onClick,
  animationPhase
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Node size based on repository metrics
  const baseSize = useMemo(() => {
    const activity = node.stars + (node.forks * 2);
    return Math.max(0.5, Math.min(3, Math.log(activity + 1) * 0.5));
  }, [node.stars, node.forks]);
  
  // Dynamic scaling animation
  const { scale, emissive } = useSpring({
    scale: isHovered ? baseSize * 1.5 : isSelected ? baseSize * 1.2 : baseSize,
    emissive: isHovered ? 0.3 : isSelected ? 0.2 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Floating animation
  useFrame((state) => {
    if (meshRef.current && animationPhase === 'stable') {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + node.id) * 0.01;
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  // Handle pointer events
  const handlePointerEnter = useCallback(() => {
    document.body.style.cursor = 'pointer';
    onHover?.(node.id);
  }, [node.id, onHover]);
  
  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
    onHover?.('');
  }, [onHover]);
  
  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(node.id);
  }, [node.id, onClick]);
  
  return (
    <animated.mesh
      ref={meshRef}
      position={[node.x, node.y, node.z]}
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      {/* Geometry based on repository type */}
      {node.type === 'fork' ? (
        <octahedronGeometry args={[1, 0]} />
      ) : (
        <icosahedronGeometry args={[1, 1]} />
      )}
      
      {/* Material with language color */}
      <animated.meshStandardMaterial
        ref={materialRef}
        color={node.color}
        emissive={emissive.to(e => new THREE.Color(node.color).multiplyScalar(e))}
        roughness={0.4}
        metalness={0.6}
        transparent
        opacity={0.9}
      />
      
      {/* Glow effect for important repositories */}
      {node.stars > 50 && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </animated.mesh>
  );
};
```

### 4. Edges Renderer Component

```typescript
interface EdgesRendererProps {
  edges: NetworkEdge[];
  nodes: NetworkNode[];
  hoveredNode: string | null;
  selectedNode: string | null;
}

const EdgesRenderer: React.FC<EdgesRendererProps> = ({
  edges,
  nodes,
  hoveredNode,
  selectedNode
}) => {
  const linesMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x444444,
    transparent: true,
    opacity: 0.3
  }), []);
  
  const highlightMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.8
  }), []);
  
  const edgeGeometries = useMemo(() => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const geometry = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
        new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
      ];
      
      geometry.setFromPoints(points);
      return { geometry, edge, sourceNode, targetNode };
    }).filter(Boolean) as Array<{
      geometry: THREE.BufferGeometry;
      edge: NetworkEdge;
      sourceNode: NetworkNode;
      targetNode: NetworkNode;
    }>;
  }, [edges, nodes]);
  
  return (
    <group>
      {edgeGeometries.map(({ geometry, edge, sourceNode, targetNode }, index) => {
        const isHighlighted = 
          hoveredNode === sourceNode.id || 
          hoveredNode === targetNode.id ||
          selectedNode === sourceNode.id || 
          selectedNode === targetNode.id;
        
        return (
          <line key={`edge-${index}`} geometry={geometry}>
            <primitive
              object={isHighlighted ? highlightMaterial : linesMaterial}
              attach="material"
            />
          </line>
        );
      })}
    </group>
  );
};
```

## Force Simulation System

```typescript
interface ForceConfig {
  linkStrength: number;
  linkDistance: number;
  chargeStrength: number;
  centerStrength: number;
  collisionRadius: number;
}

class ForceSimulation {
  private nodes: NetworkNode[];
  private edges: NetworkEdge[];
  private config: ForceConfig;
  private velocities: Map<string, THREE.Vector3>;
  private stabilityThreshold = 0.01;
  private tickCount = 0;
  
  constructor(nodes: NetworkNode[], edges: NetworkEdge[]) {
    this.nodes = [...nodes];
    this.edges = edges;
    this.velocities = new Map();
    this.config = {
      linkStrength: 0.1,
      linkDistance: 10,
      chargeStrength: -300,
      centerStrength: 0.1,
      collisionRadius: 2
    };
    
    this.initializePositions();
  }
  
  private initializePositions(): void {
    // Place nodes in a sphere for better 3D distribution
    this.nodes.forEach((node, index) => {
      const phi = Math.acos(-1 + (2 * index) / this.nodes.length);
      const theta = Math.sqrt(this.nodes.length * Math.PI) * phi;
      const radius = 20;
      
      node.x = radius * Math.cos(theta) * Math.sin(phi);
      node.y = radius * Math.sin(theta) * Math.sin(phi);
      node.z = radius * Math.cos(phi);
      
      this.velocities.set(node.id, new THREE.Vector3(0, 0, 0));
    });
  }
  
  tick(deltaTime: number): void {
    const alpha = Math.max(0.01, 1 - (this.tickCount * 0.02));
    
    // Apply forces
    this.applyLinkForces(alpha);
    this.applyChargeForces(alpha);
    this.applyCenterForces(alpha);
    this.applyCollisionForces(alpha);
    
    // Update positions
    this.updatePositions(deltaTime * alpha);
    
    this.tickCount++;
  }
  
  private applyLinkForces(alpha: number): void {
    this.edges.forEach(edge => {
      const source = this.nodes.find(n => n.id === edge.source);
      const target = this.nodes.find(n => n.id === edge.target);
      
      if (!source || !target) return;
      
      const sourcePos = new THREE.Vector3(source.x, source.y, source.z);
      const targetPos = new THREE.Vector3(target.x, target.y, target.z);
      const distance = sourcePos.distanceTo(targetPos);
      
      if (distance === 0) return;
      
      const force = (distance - this.config.linkDistance) * this.config.linkStrength;
      const direction = targetPos.sub(sourcePos).normalize();
      
      const forceVector = direction.multiplyScalar(force * alpha);
      
      const sourceVel = this.velocities.get(source.id)!;
      const targetVel = this.velocities.get(target.id)!;
      
      sourceVel.add(forceVector);
      targetVel.sub(forceVector);
    });
  }
  
  private applyChargeForces(alpha: number): void {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        const posA = new THREE.Vector3(nodeA.x, nodeA.y, nodeA.z);
        const posB = new THREE.Vector3(nodeB.x, nodeB.y, nodeB.z);
        const distance = Math.max(1, posA.distanceTo(posB));
        
        const force = this.config.chargeStrength / (distance * distance);
        const direction = posA.sub(posB).normalize();
        const forceVector = direction.multiplyScalar(force * alpha);
        
        const velA = this.velocities.get(nodeA.id)!;
        const velB = this.velocities.get(nodeB.id)!;
        
        velA.add(forceVector);
        velB.sub(forceVector);
      }
    }
  }
  
  private applyCenterForces(alpha: number): void {
    const center = new THREE.Vector3(0, 0, 0);
    
    this.nodes.forEach(node => {
      const position = new THREE.Vector3(node.x, node.y, node.z);
      const force = center.sub(position).multiplyScalar(this.config.centerStrength * alpha);
      
      const velocity = this.velocities.get(node.id)!;
      velocity.add(force);
    });
  }
  
  private applyCollisionForces(alpha: number): void {
    // Simplified collision detection for performance
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        const posA = new THREE.Vector3(nodeA.x, nodeA.y, nodeA.z);
        const posB = new THREE.Vector3(nodeB.x, nodeB.y, nodeB.z);
        const distance = posA.distanceTo(posB);
        const minDistance = this.config.collisionRadius * 2;
        
        if (distance < minDistance) {
          const overlap = minDistance - distance;
          const direction = posA.sub(posB).normalize();
          const correction = direction.multiplyScalar(overlap * 0.5 * alpha);
          
          const velA = this.velocities.get(nodeA.id)!;
          const velB = this.velocities.get(nodeB.id)!;
          
          velA.add(correction);
          velB.sub(correction);
        }
      }
    }
  }
  
  private updatePositions(deltaTime: number): void {
    this.nodes.forEach(node => {
      const velocity = this.velocities.get(node.id)!;
      
      // Apply damping
      velocity.multiplyScalar(0.9);
      
      // Update position
      node.x += velocity.x * deltaTime;
      node.y += velocity.y * deltaTime;
      node.z += velocity.z * deltaTime;
    });
  }
  
  isStable(): boolean {
    let totalKineticEnergy = 0;
    
    this.velocities.forEach(velocity => {
      totalKineticEnergy += velocity.lengthSq();
    });
    
    const averageKineticEnergy = totalKineticEnergy / this.nodes.length;
    return averageKineticEnergy < this.stabilityThreshold;
  }
}
```

## Performance Optimization

```typescript
// Level of Detail (LOD) system for large networks
const useLevelOfDetail = (nodes: NetworkNode[], camera: THREE.Camera) => {
  return useMemo(() => {
    return nodes.map(node => {
      const distance = camera.position.distanceTo(
        new THREE.Vector3(node.x, node.y, node.z)
      );
      
      if (distance > 50) return { ...node, lod: 'low' };
      if (distance > 25) return { ...node, lod: 'medium' };
      return { ...node, lod: 'high' };
    });
  }, [nodes, camera.position]);
};

// Frustum culling for off-screen nodes
const useFrustumCulling = (nodes: NetworkNode[], camera: THREE.Camera) => {
  const frustum = useMemo(() => new THREE.Frustum(), []);
  
  return useMemo(() => {
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);
    
    return nodes.filter(node => {
      const point = new THREE.Vector3(node.x, node.y, node.z);
      return frustum.containsPoint(point);
    });
  }, [nodes, camera, frustum]);
};
```

This Three.js architecture provides a robust, performant, and interactive 3D repository network visualization with force-directed layout, smooth animations, and optimized rendering.