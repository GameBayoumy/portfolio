# 3D Visualizer Architecture Specification

## Executive Summary

This document defines the comprehensive architecture for 3D visualizers in the XR Portfolio project. The design emphasizes modularity, performance optimization, TypeScript compatibility, and responsive design patterns.

## Current State Analysis

### Existing Three.js Setup
- **Framework**: @react-three/fiber v9.3.0 with @react-three/drei v10.7.4
- **Status**: Components temporarily disabled due to TypeScript build compatibility issues
- **Strengths**: Performance-aware design, spring animations, WebGL detection
- **Issues**: TypeScript JSX compatibility, missing modular structure

### Dependencies
```json
{
  "@react-three/fiber": "^9.3.0",
  "@react-three/drei": "^10.7.4", 
  "@react-three/postprocessing": "^3.0.4",
  "@react-spring/three": "^10.0.1",
  "three": "^0.179.1",
  "leva": "^0.9.36"
}
```

## Architecture Overview

### Directory Structure
```
src/components/three/
├── visualizers/                    # Main visualizer components
│   ├── core/                      # Core reusable components
│   │   ├── Scene/                 # Scene wrapper components
│   │   ├── Camera/                # Camera controllers
│   │   ├── Lighting/              # Lighting systems
│   │   ├── Materials/             # Custom materials
│   │   └── Effects/               # Post-processing effects
│   ├── geometric/                 # Geometric visualizers
│   │   ├── MathematicalShapes/    # Complex geometric forms
│   │   ├── ParticleSystem/        # Particle-based effects
│   │   ├── FluidDynamics/         # Fluid simulation
│   │   └── FractalRenderer/       # Fractal mathematics
│   ├── data/                      # Data-driven visualizers
│   │   ├── NetworkGraph3D/        # 3D network visualizations
│   │   ├── DataClusters/          # 3D data clustering
│   │   ├── TimeSeriesViz/         # 3D time series
│   │   └── StatisticalPlots/      # 3D statistical charts
│   ├── interactive/               # Interactive 3D components
│   │   ├── VRHeadsetModel/        # VR device models
│   │   ├── ControlPanels/         # 3D UI panels
│   │   ├── GestureRecognizer/     # Gesture interactions
│   │   └── SpatialInterface/      # Spatial UI components
│   └── environmental/             # Environmental effects
│       ├── SkyboxSystem/          # Sky and environment
│       ├── TerrainGenerator/      # Procedural terrain
│       ├── WeatherEffects/        # Weather simulation
│       └── AtmosphericEffects/    # Atmospheric rendering
├── hooks/                         # Custom Three.js hooks
│   ├── useThreePerformance.ts     # Performance monitoring
│   ├── useResponsiveScene.ts      # Responsive scaling
│   ├── useDeviceCapabilities.ts   # Device detection
│   └── useAnimationLoop.ts        # Animation management
├── providers/                     # Context providers
│   ├── ThreeProvider.tsx          # Global Three.js context
│   ├── PerformanceProvider.tsx    # Performance context
│   └── SceneProvider.tsx          # Scene management
├── utils/                         # Utility functions
│   ├── performance.ts             # Performance utilities
│   ├── geometry.ts                # Geometry helpers
│   ├── materials.ts               # Material utilities
│   └── animation.ts               # Animation helpers
├── types/                         # TypeScript definitions
│   ├── visualizer.ts              # Visualizer interfaces
│   ├── performance.ts             # Performance types
│   └── scene.ts                   # Scene configuration
└── config/                        # Configuration files
    ├── performance.ts             # Performance presets
    ├── materials.ts               # Material presets
    └── scenes.ts                  # Scene configurations
```

## Component Architecture Patterns

### 1. Core Scene System

#### BaseScene Component
```typescript
interface BaseSceneProps {
  children: React.ReactNode;
  performanceMode: PerformanceLevel;
  backgroundColor?: string;
  fog?: FogConfiguration;
  onRender?: (state: RenderState) => void;
}

const BaseScene: React.FC<BaseSceneProps> = ({
  children,
  performanceMode,
  backgroundColor = '#0a0a0a',
  fog,
  onRender
}) => {
  // Scene setup logic
};
```

#### Performance-Adaptive Rendering
```typescript
interface PerformanceSettings {
  pixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  postprocessing: boolean;
  maxLights: number;
  lodThreshold: number;
  cullingDistance: number;
}

const getPerformanceSettings = (tier: PerformanceLevel): PerformanceSettings => {
  const settings = {
    low: {
      pixelRatio: Math.min(window.devicePixelRatio, 1),
      antialias: false,
      shadows: false,
      postprocessing: false,
      maxLights: 2,
      lodThreshold: 50,
      cullingDistance: 100
    },
    medium: {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      antialias: true,
      shadows: true,
      postprocessing: true,
      maxLights: 4,
      lodThreshold: 100,
      cullingDistance: 200
    },
    high: {
      pixelRatio: window.devicePixelRatio,
      antialias: true,
      shadows: true,
      postprocessing: true,
      maxLights: 8,
      lodThreshold: 200,
      cullingDistance: 400
    }
  };
  return settings[tier];
};
```

### 2. Modular Visualizer Pattern

#### Base Visualizer Interface
```typescript
interface BaseVisualizerProps {
  id: string;
  visible?: boolean;
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  animationSpeed?: number;
  interactionEnabled?: boolean;
  performanceMode?: PerformanceLevel;
  onInteraction?: (event: InteractionEvent) => void;
}

interface VisualizerConfig {
  geometry: GeometryConfig;
  material: MaterialConfig;
  animation: AnimationConfig;
  interaction: InteractionConfig;
}
```

#### Composition-Based Visualizers
```typescript
const MathematicalShapeVisualizer: React.FC<MathematicalShapeProps> = ({
  shapeType,
  complexity,
  ...baseProps
}) => {
  const geometry = useMemo(() => {
    return createGeometry(shapeType, complexity);
  }, [shapeType, complexity]);

  const material = useMaterial({
    type: 'standard',
    roughness: 0.3,
    metalness: 0.7
  });

  const animation = useAnimation({
    type: 'orbital',
    speed: baseProps.animationSpeed
  });

  return (
    <BaseVisualizer {...baseProps}>
      <mesh geometry={geometry} material={material}>
        <AnimationController config={animation} />
      </mesh>
    </BaseVisualizer>
  );
};
```

### 3. Responsive Design Pattern

#### Responsive Hook
```typescript
interface ResponsiveConfig {
  mobile: SceneConfig;
  tablet: SceneConfig;
  desktop: SceneConfig;
  ultrawide: SceneConfig;
}

const useResponsiveScene = (config: ResponsiveConfig) => {
  const { viewport, size } = useThree();
  
  const currentConfig = useMemo(() => {
    const aspectRatio = size.width / size.height;
    
    if (size.width < 768) return config.mobile;
    if (size.width < 1024) return config.tablet;
    if (aspectRatio > 2) return config.ultrawide;
    return config.desktop;
  }, [size, config]);

  return currentConfig;
};
```

#### Adaptive Component Rendering
```typescript
const AdaptiveParticleSystem: React.FC<ParticleSystemProps> = (props) => {
  const { mobile, tablet, desktop } = useResponsiveScene({
    mobile: { count: 50, complexity: 'low' },
    tablet: { count: 150, complexity: 'medium' },
    desktop: { count: 500, complexity: 'high' },
    ultrawide: { count: 1000, complexity: 'ultra' }
  });

  const config = mobile || tablet || desktop;

  return (
    <ParticleField
      {...props}
      count={config.count}
      complexity={config.complexity}
    />
  );
};
```

## Performance Optimization Strategies

### 1. Level of Detail (LOD) System
```typescript
interface LODConfig {
  distances: number[];
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
}

const useLOD = (config: LODConfig) => {
  const lodRef = useRef<THREE.LOD>();
  
  useEffect(() => {
    const lod = new THREE.LOD();
    config.distances.forEach((distance, index) => {
      const mesh = new THREE.Mesh(
        config.geometries[index],
        config.materials[index]
      );
      lod.addLevel(mesh, distance);
    });
    lodRef.current = lod;
  }, [config]);

  return lodRef;
};
```

### 2. Instanced Rendering
```typescript
interface InstancedVisualizerProps {
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  positions: Vector3[];
  rotations?: Euler[];
  scales?: Vector3[];
}

const InstancedVisualizer: React.FC<InstancedVisualizerProps> = ({
  count,
  geometry,
  material,
  positions,
  rotations,
  scales
}) => {
  const meshRef = useRef<THREE.InstancedMesh>();
  
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    positions.forEach((position, i) => {
      matrix.compose(
        position,
        rotations?.[i] || new THREE.Euler(),
        scales?.[i] || new THREE.Vector3(1, 1, 1)
      );
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, rotations, scales]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
    />
  );
};
```

### 3. Object Pooling
```typescript
class GeometryPool {
  private pool: Map<string, THREE.BufferGeometry[]> = new Map();
  
  acquire(type: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    const pool = this.pool.get(type) || [];
    if (pool.length > 0) {
      return pool.pop()!;
    }
    return factory();
  }
  
  release(type: string, geometry: THREE.BufferGeometry): void {
    const pool = this.pool.get(type) || [];
    pool.push(geometry);
    this.pool.set(type, pool);
  }
}

const geometryPool = new GeometryPool();
```

## Error Boundary Implementation

### 3D Error Boundary
```typescript
interface ThreeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  fallbackMode: 'canvas' | 'webgl' | 'none';
}

class ThreeErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ThreeErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      fallbackMode: 'canvas'
    };
  }

  static getDerivedStateFromError(error: Error): ThreeErrorBoundaryState {
    const isWebGLError = error.message.includes('WebGL');
    const isThreeError = error.message.includes('THREE');
    
    return {
      hasError: true,
      error,
      fallbackMode: isWebGLError ? 'canvas' : isThreeError ? 'webgl' : 'none'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js Error:', error, errorInfo);
    
    // Report to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Three.js: ${error.message}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ThreeFallback mode={this.state.fallbackMode} />;
    }

    return this.props.children;
  }
}
```

### Fallback Components
```typescript
interface ThreeFallbackProps {
  mode: 'canvas' | 'webgl' | 'none';
}

const ThreeFallback: React.FC<ThreeFallbackProps> = ({ mode }) => {
  switch (mode) {
    case 'canvas':
      return <Canvas2DFallback />;
    case 'webgl':
      return <BasicThreeFallback />;
    case 'none':
      return <StaticFallback />;
    default:
      return <StaticFallback />;
  }
};
```

## TypeScript Integration

### Comprehensive Type Definitions
```typescript
// Visualizer base types
export interface VisualizerProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  visible?: boolean;
  interactive?: boolean;
  performanceMode?: PerformanceLevel;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Scene configuration
export interface SceneConfig {
  background: ColorRepresentation;
  fog?: {
    type: 'linear' | 'exponential';
    color: ColorRepresentation;
    near: number;
    far: number;
    density?: number;
  };
  lights: LightConfig[];
  camera: CameraConfig;
  controls: ControlsConfig;
}

// Performance monitoring
export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  memory: {
    geometries: number;
    textures: number;
    programs: number;
  };
}
```

### JSX Element Extensions
```typescript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Custom visualizer elements
      'mathematical-shapes': VisualizerProps & MathematicalShapeProps;
      'particle-field': VisualizerProps & ParticleFieldProps;
      'network-graph-3d': VisualizerProps & NetworkGraph3DProps;
      'vr-headset-model': VisualizerProps & VRHeadsetModelProps;
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Fix TypeScript compatibility issues
2. Implement BaseScene and core providers
3. Create performance monitoring hooks
4. Establish error boundary system

### Phase 2: Core Components (Week 2)
1. Migrate existing components to new architecture
2. Implement responsive design patterns
3. Create reusable material and geometry utilities
4. Add LOD and instancing support

### Phase 3: Advanced Visualizers (Week 3)
1. Build data-driven visualizers
2. Implement interactive components
3. Add environmental effects
4. Create gesture recognition system

### Phase 4: Optimization & Polish (Week 4)
1. Performance optimization and profiling
2. Comprehensive testing
3. Documentation and examples
4. Deployment and monitoring

## Quality Assurance

### Testing Strategy
- Unit tests for utility functions
- Integration tests for component composition
- Performance benchmarks for rendering
- Cross-device compatibility testing
- Accessibility compliance verification

### Performance Targets
- 60 FPS on high-end devices
- 30 FPS on mobile devices
- < 2s initial load time
- < 100MB memory usage
- Graceful degradation on low-end devices

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with WebGL support

## Conclusion

This architecture provides a solid foundation for scalable, performance-optimized 3D visualizations while maintaining code quality and developer experience. The modular design allows for incremental implementation and easy maintenance.

The focus on TypeScript compatibility, responsive design, and error handling ensures robust production deployment across diverse device capabilities and network conditions.