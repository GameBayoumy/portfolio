/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal Three.js type shims for offline type-checking. These definitions are
// intentionally lightweight and only cover the members referenced within the
// project. All classes expose index signatures so they can be used flexibly in
// type positions without requiring the full upstream type packages.

declare namespace THREE {
  class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
    clone(): Vector2;
    [key: string]: any;
  }

  class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    multiplyScalar(s: number): this;
    normalize(): this;
    clone(): Vector3;
    [key: string]: any;
  }

  class Color {
    constructor(color?: ColorRepresentation);
    set(value: ColorRepresentation): this;
    clone(): Color;
    [key: string]: any;
  }

  type ColorRepresentation = string | number | Color;

  class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    set(x: number, y: number, z: number, w: number): this;
    copy(q: Quaternion): this;
    [key: string]: any;
  }

  class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number;
    y: number;
    z: number;
    order: string;
    set(x: number, y: number, z: number, order?: string): this;
    clone(): Euler;
    [key: string]: any;
  }

  class Matrix4 {
    elements: number[];
    copy(m: Matrix4): this;
    multiply(m: Matrix4): this;
    invert(): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    [key: string]: any;
  }

  class Object3D {
    name: string;
    position: Vector3;
    rotation: Euler;
    quaternion: Quaternion;
    scale: Vector3;
    children: Object3D[];
    parent: Object3D | null;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    lookAt(vector: Vector3): void;
    traverse(callback: (object: Object3D) => void): void;
    updateMatrixWorld(force?: boolean): void;
    [key: string]: any;
  }

  class Group extends Object3D {}
  class Scene extends Object3D {}
  class Camera extends Object3D {}
  class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
  }
  class OrthographicCamera extends Camera {}

  class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number);
    array: ArrayLike<number>;
    itemSize: number;
    count: number;
    needsUpdate: boolean;
    setUsage(usage: number): this;
    [key: string]: any;
  }

  class BufferGeometry {
    attributes: Record<string, BufferAttribute>;
    setAttribute(name: string, attribute: BufferAttribute): this;
    setFromPoints(points: Vector2[] | Vector3[]): this;
    dispose(): void;
    [key: string]: any;
  }

  class Material {
    transparent: boolean;
    opacity: number;
    side?: Side;
    blending?: Blending;
    needsUpdate: boolean;
    dispose(): void;
    [key: string]: any;
  }

  class ShaderMaterial extends Material {
    constructor(parameters?: Record<string, any>);
    uniforms: Record<string, IUniform>;
    vertexShader: string;
    fragmentShader: string;
  }

  class MeshBasicMaterial extends Material {
    constructor(parameters?: Record<string, any>);
  }
  class MeshStandardMaterial extends Material {
    constructor(parameters?: Record<string, any>);
  }
  class MeshPhysicalMaterial extends Material {
    constructor(parameters?: Record<string, any>);
  }
  class PointsMaterial extends Material {
    constructor(parameters?: Record<string, any>);
  }
  class LineBasicMaterial extends Material {
    constructor(parameters?: Record<string, any>);
  }

  class Texture {
    wrapS: number;
    wrapT: number;
    repeat: Vector2;
    dispose(): void;
    [key: string]: any;
  }

  class CanvasTexture extends Texture {}

  class SphereGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class BoxGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class CylinderGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class ConeGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class PlaneGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class TorusGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class TorusKnotGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class DodecahedronGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class IcosahedronGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class OctahedronGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class TetrahedronGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class RingGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class CircleGeometry extends BufferGeometry {
    constructor(...args: any[]);
  }
  class BufferGeometryUtils {}

  class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material | Material[]);
    geometry: BufferGeometry;
    material: Material | Material[];
  }

  class Points extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
    geometry: BufferGeometry;
    material: PointsMaterial;
  }

  class Line extends Object3D {
    constructor(...args: any[]);
  }
  class LineSegments extends Line {}
  class InstancedMesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material, count?: number);
    count: number;
    instanceMatrix: BufferAttribute;
  }

  class Ray {
    origin: Vector3;
    direction: Vector3;
    [key: string]: any;
  }

  class Intersection {
    object: Object3D;
    point: Vector3;
    [key: string]: any;
  }

  class Face {
    a: number;
    b: number;
    c: number;
    normal: Vector3;
    [key: string]: any;
  }

  class Raycaster {
    ray: Ray;
    setFromCamera(coords: Vector2, camera: Camera): void;
    intersectObjects(objects: Object3D[], recursive?: boolean): Intersection[];
  }

  class Clock {
    getDelta(): number;
    elapsedTime: number;
  }

  class WebGLRenderer {
    domElement: HTMLCanvasElement;
    info: any;
    capabilities: any;
    constructor(params?: any);
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
    [key: string]: any;
  }

  class AmbientLight extends Object3D {
    constructor(color?: ColorRepresentation, intensity?: number);
  }
  class DirectionalLight extends Object3D {
    target: Object3D;
    intensity: number;
    constructor(color?: ColorRepresentation, intensity?: number);
  }
  class PointLight extends Object3D {
    constructor(color?: ColorRepresentation, intensity?: number, distance?: number, decay?: number);
  }
  class SpotLight extends Object3D {
    constructor(color?: ColorRepresentation, intensity?: number);
  }

  class Audio extends Object3D {}
  class PositionalAudio extends Audio {}
  class Skeleton {}
  class Bone extends Object3D {}
  class LOD extends Object3D {}
  class Sprite extends Object3D {}
  class SpriteMaterial extends Material {}

  class AnimationMixer {
    update(delta: number): void;
    clipAction(...args: any[]): AnimationAction;
    [key: string]: any;
  }

  class AnimationAction {
    play(): AnimationAction;
    stop(): AnimationAction;
    [key: string]: any;
  }

  class Sphere {
    center: Vector3;
    radius: number;
    [key: string]: any;
  }

  class Box3 {
    min: Vector3;
    max: Vector3;
    [key: string]: any;
  }

  interface IUniform {
    value: any;
  }

  type Side = number;
  type Blending = number;

  const DoubleSide: Side;
  const BackSide: Side;
  const AdditiveBlending: Blending;
  const NormalBlending: Blending;
  const PCFSoftShadowMap: number;
  const RepeatWrapping: number;
  const DynamicDrawUsage: number;
  const MOUSE: Record<string, number>;
  const TOUCH: Record<string, number>;

  const MathUtils: {
    degToRad(value: number): number;
    randFloatSpread(range: number): number;
    clamp(value: number, min: number, max: number): number;
    [key: string]: any;
  };
}

declare module 'three' {
  export = THREE;
}
