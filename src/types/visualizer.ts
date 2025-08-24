import * as THREE from 'three';
import { ReactNode } from 'react';
import { Vector3, Euler, Color } from 'three';

// Base visualizer types
export type PerformanceLevel = 'low' | 'medium' | 'high' | 'ultra';
export type VisualizerCategory = 'geometric' | 'data' | 'interactive' | 'environmental';
export type InteractionType = 'hover' | 'click' | 'drag' | 'gesture' | 'voice';
export type AnimationType = 'rotation' | 'orbital' | 'float' | 'pulse' | 'wave' | 'custom';

// Core interfaces
export interface BaseVisualizerProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  visible?: boolean;
  position?: [number, number, number] | Vector3;
  rotation?: [number, number, number] | Euler;
  scale?: [number, number, number] | number | Vector3;
  animationSpeed?: number;
  interactionEnabled?: boolean;
  performanceMode?: PerformanceLevel;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onInteraction?: (event: InteractionEvent) => void;
}

export interface InteractionEvent {
  type: InteractionType;
  target: THREE.Object3D;
  point?: Vector3;
  distance?: number;
  face?: THREE.Face;
  uv?: THREE.Vector2;
  object?: THREE.Object3D;
  eventObject?: THREE.Object3D;
  intersections?: THREE.Intersection[];
  ray?: THREE.Ray;
  camera?: THREE.Camera;
  delta?: THREE.Vector2;
  pointer?: THREE.Vector2;
  unprojectedPoint?: Vector3;
  stopped?: boolean;
  originalEvent?: Event;
}

// Scene configuration types
export interface SceneConfig {
  background: THREE.ColorRepresentation;
  environment?: string | THREE.Texture;
  fog?: FogConfiguration;
  lights: LightConfig[];
  camera: CameraConfig;
  controls?: ControlsConfig;
  physics?: PhysicsConfig;
  postprocessing?: PostProcessingConfig;
}

export interface FogConfiguration {
  type: 'linear' | 'exponential';
  color: THREE.ColorRepresentation;
  near: number;
  far: number;
  density?: number;
}

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'area';
  color: THREE.ColorRepresentation;
  intensity: number;
  position?: [number, number, number];
  target?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: number;
  penumbra?: number;
  angle?: number;
  distance?: number;
  decay?: number;
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic';
  fov?: number;
  aspect?: number;
  near: number;
  far: number;
  position: [number, number, number];
  lookAt?: [number, number, number];
  zoom?: number;
}

export interface ControlsConfig {
  type: 'orbit' | 'fly' | 'first-person' | 'map' | 'trackball';
  enabled?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
}

export interface PhysicsConfig {
  enabled: boolean;
  engine: 'cannon' | 'ammo' | 'rapier';
  gravity: [number, number, number];
  worldStep: number;
  broadphase?: 'naive' | 'sap';
}

export interface PostProcessingConfig {
  enabled: boolean;
  effects: PostProcessingEffect[];
  multisampling?: number;
}

export interface PostProcessingEffect {
  type: 'bloom' | 'bokeh' | 'ssao' | 'outline' | 'tone-mapping' | 'color-grading';
  parameters: Record<string, any>;
}

// Performance types
export interface PerformanceSettings {
  pixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  shadowType: 'basic' | 'pcf' | 'pcf-soft' | 'vsm';
  shadowMapSize: number;
  postprocessing: boolean;
  maxLights: number;
  lodEnabled: boolean;
  lodThreshold: number;
  cullingEnabled: boolean;
  cullingDistance: number;
  frustumCulling: boolean;
  geometryLOD: boolean;
  textureLOD: boolean;
  instancedRendering: boolean;
  batchedRendering: boolean;
  memoryManagement: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  programs: number;
  memory: {
    used: number;
    total: number;
    geometries: number;
    textures: number;
    programs: number;
    rendertargets: number;
  };
  gpu: {
    memory?: number;
    memoryInfo?: any;
  };
  timing: {
    render: number;
    compute: number;
    update: number;
  };
}

export interface DeviceCapabilities {
  webgl: boolean;
  webgl2: boolean;
  webgpu?: boolean;
  extensions: string[];
  maxTextureSize: number;
  maxCubeMapTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  maxVaryingVectors: number;
  maxTextureUnits: number;
  maxVertexTextureImageUnits: number;
  supportsFloatTextures: boolean;
  supportsHalfFloatTextures: boolean;
  supportsVertexArrayObjects: boolean;
  supportsInstancedArrays: boolean;
  mobile: boolean;
  touch: boolean;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
  vendor: string;
  renderer: string;
}

// Responsive design types
export interface ResponsiveConfig<T = any> {
  mobile: T;
  tablet: T;
  desktop: T;
  ultrawide?: T;
}

export interface ViewportConfig {
  width: number;
  height: number;
  aspect: number;
  factor: number;
  distance: number;
  dpr: number;
}

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  ultrawide: number;
}

// Material system types
export interface MaterialConfig {
  type: 'basic' | 'standard' | 'physical' | 'lambert' | 'phong' | 'toon' | 'matcap' | 'shader' | 'points' | 'line';
  color?: THREE.ColorRepresentation;
  opacity?: number;
  transparent?: boolean;
  alphaTest?: number;
  side?: THREE.Side;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
  reflectivity?: number;
  iridescence?: number;
  iridescenceIOR?: number;
  sheen?: number;
  sheenColor?: THREE.ColorRepresentation;
  sheenRoughness?: number;
  anisotropy?: number;
  anisotropyRotation?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  normalScale?: THREE.Vector2;
  displacementScale?: number;
  displacementBias?: number;
  textures?: {
    map?: THREE.Texture;
    normalMap?: THREE.Texture;
    displacementMap?: THREE.Texture;
    roughnessMap?: THREE.Texture;
    metalnessMap?: THREE.Texture;
    emissiveMap?: THREE.Texture;
    bumpMap?: THREE.Texture;
    alphaMap?: THREE.Texture;
    envMap?: THREE.Texture;
    aoMap?: THREE.Texture;
    lightMap?: THREE.Texture;
    clearcoatMap?: THREE.Texture;
    clearcoatNormalMap?: THREE.Texture;
    clearcoatRoughnessMap?: THREE.Texture;
    transmissionMap?: THREE.Texture;
    thicknessMap?: THREE.Texture;
    sheenColorMap?: THREE.Texture;
    sheenRoughnessMap?: THREE.Texture;
    iridescenceMap?: THREE.Texture;
    iridescenceThicknessMap?: THREE.Texture;
    anisotropyMap?: THREE.Texture;
  };
  uniforms?: Record<string, THREE.IUniform>;
  vertexShader?: string;
  fragmentShader?: string;
  defines?: Record<string, any>;
}

export interface GeometryConfig {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'torusKnot' | 'icosahedron' | 'octahedron' | 'dodecahedron' | 'tetrahedron' | 'ring' | 'circle' | 'lathe' | 'extrude' | 'custom';
  parameters: Record<string, any>;
  attributes?: Record<string, THREE.BufferAttribute>;
  morphAttributes?: Record<string, THREE.BufferAttribute[]>;
  morphTargetsRelative?: boolean;
  groups?: Array<{
    start: number;
    count: number;
    materialIndex: number;
  }>;
  boundingBox?: THREE.Box3;
  boundingSphere?: THREE.Sphere;
}

// Animation system types
export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string | ((t: number) => number);
  loop?: boolean | number;
  yoyo?: boolean;
  autoplay?: boolean;
  direction?: 'forward' | 'reverse' | 'alternate';
  parameters?: Record<string, any>;
}

export interface AnimationClip {
  name: string;
  duration: number;
  tracks: AnimationTrack[];
}

export interface AnimationTrack {
  name: string;
  type: 'position' | 'rotation' | 'scale' | 'morphTarget' | 'color' | 'number';
  times: number[];
  values: number[];
  interpolation?: 'discrete' | 'linear' | 'cubic';
}

export interface AnimationState {
  clip?: AnimationClip;
  action?: THREE.AnimationAction;
  mixer?: THREE.AnimationMixer;
  playing: boolean;
  paused: boolean;
  time: number;
  timeScale: number;
  weight: number;
  repetitions: number;
  clampWhenFinished: boolean;
  zeroSlopeAtStart: boolean;
  zeroSlopeAtEnd: boolean;
}

// Specific visualizer props
export interface MathematicalShapeProps extends BaseVisualizerProps {
  shapeType: 'torusKnot' | 'icosahedron' | 'octahedron' | 'dodecahedron' | 'tetrahedron' | 'torus' | 'cylinder' | 'cone' | 'sphere';
  complexity: 'low' | 'medium' | 'high';
  geometryParameters?: Record<string, any>;
  material?: MaterialConfig;
  animation?: AnimationConfig;
  orbitalRadius?: number;
  orbitalSpeed?: number;
  rotationSpeed?: Vector3;
  pulseIntensity?: number;
  colorScheme?: string[];
  glowEffect?: boolean;
  wireframeMode?: boolean;
  morphing?: boolean;
}

export interface ParticleSystemProps extends BaseVisualizerProps {
  count: number;
  spread: number;
  speed: number;
  size: number;
  sizeVariation?: number;
  color: THREE.ColorRepresentation;
  colorVariation?: THREE.ColorRepresentation[];
  opacity: number;
  opacityVariation?: number;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'custom';
  texture?: THREE.Texture;
  blending?: THREE.Blending;
  distribution: 'sphere' | 'box' | 'plane' | 'line' | 'custom';
  emissionRate?: number;
  lifetime?: number;
  lifetimeVariation?: number;
  gravity?: Vector3;
  turbulence?: number;
  collision?: boolean;
  trail?: boolean;
  sorting?: boolean;
  billboarding?: boolean;
  customUpdateFunction?: (particle: Particle, delta: number) => void;
}

export interface Particle {
  id: number;
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  age: number;
  lifetime: number;
  size: number;
  opacity: number;
  color: THREE.Color;
  rotation: number;
  angularVelocity: number;
  userData: Record<string, any>;
}

export interface NetworkGraph3DProps extends BaseVisualizerProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  layout: 'force-directed' | 'hierarchical' | 'circular' | 'grid' | 'custom';
  nodeSize?: number | ((node: NetworkNode) => number);
  edgeWidth?: number | ((edge: NetworkEdge) => number);
  nodeColor?: THREE.ColorRepresentation | ((node: NetworkNode) => THREE.ColorRepresentation);
  edgeColor?: THREE.ColorRepresentation | ((edge: NetworkEdge) => THREE.ColorRepresentation);
  gravity?: number;
  repulsion?: number;
  linkDistance?: number;
  linkStrength?: number;
  clustering?: boolean;
  labelsVisible?: boolean;
  interactive3D?: boolean;
  physicsEnabled?: boolean;
  stabilization?: boolean;
  smooth?: boolean;
  arrows?: boolean;
  highlightConnected?: boolean;
}

export interface NetworkNode {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
  size?: number;
  color?: THREE.ColorRepresentation;
  shape?: 'sphere' | 'box' | 'cylinder' | 'custom';
  group?: string;
  mass?: number;
  fixed?: boolean;
  hidden?: boolean;
  metadata?: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
  width?: number;
  color?: THREE.ColorRepresentation;
  dashes?: boolean;
  arrows?: 'to' | 'from' | 'both' | 'none';
  smooth?: boolean;
  hidden?: boolean;
  metadata?: Record<string, any>;
}

export interface VRHeadsetModelProps extends BaseVisualizerProps {
  modelType: 'quest2' | 'quest3' | 'vive' | 'index' | 'pico' | 'generic';
  displayScreen?: boolean;
  screenContent?: THREE.Texture | string;
  controllersVisible?: boolean;
  tracking?: boolean;
  playArea?: boolean;
  baseStations?: boolean;
  cables?: boolean;
  realistic?: boolean;
  animated?: boolean;
  glowEffects?: boolean;
  materialOverride?: MaterialConfig;
}

// LOD (Level of Detail) types
export interface LODConfig {
  enabled: boolean;
  distances: number[];
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  hysteresis?: number;
}

// Instancing types
export interface InstancedRenderingConfig {
  enabled: boolean;
  count: number;
  positions: Float32Array | Vector3[];
  rotations?: Float32Array | Euler[];
  scales?: Float32Array | Vector3[] | number[];
  colors?: Float32Array | THREE.Color[];
  customAttributes?: Record<string, Float32Array>;
  dynamic?: boolean;
  frustumCulled?: boolean;
}

// Error handling types
export interface VisualizerError extends Error {
  code: 'WEBGL_UNSUPPORTED' | 'SHADER_COMPILE_ERROR' | 'TEXTURE_LOAD_ERROR' | 'GEOMETRY_ERROR' | 'ANIMATION_ERROR' | 'MEMORY_ERROR' | 'PERFORMANCE_ERROR';
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  fallbackAvailable: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: VisualizerError;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  fallbackMode: 'none' | 'canvas2d' | 'webgl-basic' | 'static';
}

// Context types
export interface ThreeContextValue {
  scene?: THREE.Scene;
  camera?: THREE.Camera;
  renderer?: THREE.WebGLRenderer;
  gl?: WebGLRenderingContext | WebGL2RenderingContext;
  raycaster?: THREE.Raycaster;
  size: { width: number; height: number };
  viewport: ViewportConfig;
  performance: PerformanceMetrics;
  capabilities: DeviceCapabilities;
  clock: THREE.Clock;
  frameloop: 'always' | 'demand' | 'never';
  events: any;
  setFrameloop: (frameloop: 'always' | 'demand' | 'never') => void;
  invalidate: () => void;
  advance: (timestamp: number, runGlobalEffects?: boolean) => void;
}

// Hook return types
export interface UseThreePerformanceReturn {
  metrics: PerformanceMetrics;
  settings: PerformanceSettings;
  updateSettings: (settings: Partial<PerformanceSettings>) => void;
  adaptToPerformance: boolean;
  isLowPerformance: boolean;
  optimizationSuggestions: string[];
}

export interface UseResponsiveSceneReturn<T> {
  config: T;
  breakpoint: keyof ResponsiveConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isUltrawide: boolean;
  viewport: ViewportConfig;
}

export interface UseAnimationLoopReturn {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setTimeScale: (scale: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

// Utility types
export type Vector3Array = [number, number, number];
export type Vector2Array = [number, number];
export type EulerArray = [number, number, number, string?];
export type ColorRepresentation = THREE.ColorRepresentation;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};