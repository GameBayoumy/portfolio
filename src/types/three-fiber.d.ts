import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Extend the fiber catalog with Three.js elements
extend(THREE)

// Ensure comprehensive JSX type definitions for Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Object3D elements
      group: any
      mesh: any
      points: any
      lineSegments: any
      line: any
      scene: any
      object3D: any

      // Geometry elements
      sphereGeometry: any
      boxGeometry: any
      cylinderGeometry: any
      coneGeometry: any
      planeGeometry: any
      icosahedronGeometry: any
      octahedronGeometry: any
      dodecahedronGeometry: any
      tetrahedronGeometry: any
      torusGeometry: any
      torusKnotGeometry: any
      ringGeometry: any
      circleGeometry: any
      bufferGeometry: any
      
      // Material elements
      meshBasicMaterial: any
      meshStandardMaterial: any
      meshPhysicalMaterial: any
      meshLambertMaterial: any
      meshPhongMaterial: any
      meshToonMaterial: any
      meshNormalMaterial: any
      meshMatcapMaterial: any
      meshDepthMaterial: any
      meshDistanceMaterial: any
      pointsMaterial: any
      lineBasicMaterial: any
      lineDashedMaterial: any
      shaderMaterial: any
      rawShaderMaterial: any
      shadowMaterial: any
      spriteMaterial: any
      
      // Light elements
      ambientLight: any
      directionalLight: any
      pointLight: any
      spotLight: any
      hemisphereLight: any
      rectAreaLight: any
      
      // Camera elements
      perspectiveCamera: any
      orthographicCamera: any
      
      // Helper elements
      axesHelper: any
      boxHelper: any
      directionalLightHelper: any
      spotLightHelper: any
      pointLightHelper: any
      gridHelper: any
      polarGridHelper: any
      
      // Buffer attributes
      bufferAttribute: any
      
      // Sprites
      sprite: any
      
      // Instanced elements
      instancedMesh: any
      
      // LOD
      lOD: any
      
      // Skeleton and Bones
      skeleton: any
      bone: any
      
      // Audio
      audio: any
      positionalAudio: any
    }
  }
}

// Module augmentation for react-three-fiber
declare module '@react-three/fiber' {
  interface ThreeElements {
    // Core Objects
    group: ThreeElement<THREE.Group>
    mesh: ThreeElement<THREE.Mesh>
    points: ThreeElement<THREE.Points>
    lineSegments: ThreeElement<THREE.LineSegments>
    line: ThreeElement<THREE.Line>
    scene: ThreeElement<THREE.Scene>
    object3D: ThreeElement<THREE.Object3D>

    // Geometries
    sphereGeometry: ThreeElement<THREE.SphereGeometry>
    boxGeometry: ThreeElement<THREE.BoxGeometry>
    cylinderGeometry: ThreeElement<THREE.CylinderGeometry>
    coneGeometry: ThreeElement<THREE.ConeGeometry>
    planeGeometry: ThreeElement<THREE.PlaneGeometry>
    icosahedronGeometry: ThreeElement<THREE.IcosahedronGeometry>
    octahedronGeometry: ThreeElement<THREE.OctahedronGeometry>
    dodecahedronGeometry: ThreeElement<THREE.DodecahedronGeometry>
    tetrahedronGeometry: ThreeElement<THREE.TetrahedronGeometry>
    torusGeometry: ThreeElement<THREE.TorusGeometry>
    torusKnotGeometry: ThreeElement<THREE.TorusKnotGeometry>
    ringGeometry: ThreeElement<THREE.RingGeometry>
    circleGeometry: ThreeElement<THREE.CircleGeometry>
    bufferGeometry: ThreeElement<THREE.BufferGeometry>

    // Materials
    meshBasicMaterial: ThreeElement<THREE.MeshBasicMaterial>
    meshStandardMaterial: ThreeElement<THREE.MeshStandardMaterial>
    meshPhysicalMaterial: ThreeElement<THREE.MeshPhysicalMaterial>
    meshLambertMaterial: ThreeElement<THREE.MeshLambertMaterial>
    meshPhongMaterial: ThreeElement<THREE.MeshPhongMaterial>
    meshToonMaterial: ThreeElement<THREE.MeshToonMaterial>
    meshNormalMaterial: ThreeElement<THREE.MeshNormalMaterial>
    meshMatcapMaterial: ThreeElement<THREE.MeshMatcapMaterial>
    meshDepthMaterial: ThreeElement<THREE.MeshDepthMaterial>
    meshDistanceMaterial: ThreeElement<THREE.MeshDistanceMaterial>
    pointsMaterial: ThreeElement<THREE.PointsMaterial>
    lineBasicMaterial: ThreeElement<THREE.LineBasicMaterial>
    lineDashedMaterial: ThreeElement<THREE.LineDashedMaterial>
    shaderMaterial: ThreeElement<THREE.ShaderMaterial>
    rawShaderMaterial: ThreeElement<THREE.RawShaderMaterial>
    shadowMaterial: ThreeElement<THREE.ShadowMaterial>
    spriteMaterial: ThreeElement<THREE.SpriteMaterial>

    // Lights
    ambientLight: ThreeElement<THREE.AmbientLight>
    directionalLight: ThreeElement<THREE.DirectionalLight>
    pointLight: ThreeElement<THREE.PointLight>
    spotLight: ThreeElement<THREE.SpotLight>
    hemisphereLight: ThreeElement<THREE.HemisphereLight>
    rectAreaLight: ThreeElement<THREE.RectAreaLight>

    // Cameras
    perspectiveCamera: ThreeElement<THREE.PerspectiveCamera>
    orthographicCamera: ThreeElement<THREE.OrthographicCamera>

    // Buffer attributes
    bufferAttribute: ThreeElement<THREE.BufferAttribute>

    // Other elements
    sprite: ThreeElement<THREE.Sprite>
    instancedMesh: ThreeElement<THREE.InstancedMesh>
    lOD: ThreeElement<THREE.LOD>
    skeleton: ThreeElement<THREE.Skeleton>
    bone: ThreeElement<THREE.Bone>
    audio: ThreeElement<THREE.Audio>
    positionalAudio: ThreeElement<THREE.PositionalAudio>
  }

  // Generic ThreeElement type
  type ThreeElement<T> = {
    [K in keyof T]?: T[K]
  } & {
    attach?: string
    ref?: React.Ref<T>
    key?: React.Key
    args?: any[]
    position?: [number, number, number] | THREE.Vector3
    rotation?: [number, number, number] | THREE.Euler
    scale?: [number, number, number] | number | THREE.Vector3
    visible?: boolean
    castShadow?: boolean
    receiveShadow?: boolean
    renderOrder?: number
    userData?: { [key: string]: any }
  }
}

export {}