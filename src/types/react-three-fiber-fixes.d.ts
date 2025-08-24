// Comprehensive React Three Fiber type fixes
declare module '@react-three/fiber' {
  import * as THREE from 'three'
  import * as React from 'react'
  
  export interface RootState {
    gl: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.Camera
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    clock: THREE.Clock
    linear: boolean
    flat: boolean
    legacy: boolean
    frameloop: 'always' | 'demand' | 'never'
    performance: {
      current: number
      min: number
      max: number
      debounce: number
    }
    size: {
      width: number
      height: number
      updateStyle?: boolean
    }
    viewport: {
      width: number
      height: number
      initialDpr: number
      dpr: number
      factor: number
      distance: number
      aspect: number
    }
    invalidate: (frames?: number) => void
    advance: (timestamp: number, runGlobalEffects?: boolean) => void
    setSize: (width: number, height: number, updateStyle?: boolean, top?: number, left?: number) => void
    setDpr: (dpr: number) => void
    setFrameloop: (frameloop?: 'always' | 'demand' | 'never') => void
    setEvents: (events: any) => void
    onPointerMissed?: (event: MouseEvent) => void
    events: any
  }

  export type useFrameCallback = (state: RootState, delta: number) => void

  export function useFrame(callback: useFrameCallback, renderPriority?: number): void
  export function useThree<T = RootState>(selector?: (state: RootState) => T): T extends undefined ? RootState : T

  export interface CanvasProps {
    children: React.ReactNode
    gl?: any
    camera?: any
    scene?: any
    shadows?: boolean | 'soft' | 'basic' | 'percentage' | 'soft-basic' | 'variance' | 'pcf' | 'pcfsoft'
    legacy?: boolean
    linear?: boolean
    flat?: boolean
    orthographic?: boolean
    frameloop?: 'always' | 'demand' | 'never'
    resize?: { scroll?: boolean; debounce?: number | { scroll: number; resize: number } }
    dpr?: number | [min: number, max: number] | 'auto'
    performance?: Partial<{
      current: number
      min: number
      max: number
      debounce: number
    }>
    raycaster?: Partial<THREE.Raycaster>
    onCreated?: (state: RootState) => void
    onPointerMissed?: (event: MouseEvent) => void
    [key: string]: any
  }

  export const Canvas: React.ForwardRefExoticComponent<CanvasProps & React.RefAttributes<HTMLCanvasElement>>
  
  export function extend(objects: { [key: string]: any }): void

  interface ThreeElements {
    // Override children property to be more flexible
    mesh: import('@react-three/fiber').ReactThreeFiber.Object3DNode<
      import('three').Mesh,
      typeof import('three').Mesh
    > & {
      children?: React.ReactNode;
    }
    
    // Fix light component color issues
    ambientLight: import('@react-three/fiber').ReactThreeFiber.Object3DNode<
      import('three').AmbientLight,
      typeof import('three').AmbientLight
    > & {
      color?: import('three').ColorRepresentation;
    }
    
    directionalLight: import('@react-three/fiber').ReactThreeFiber.Object3DNode<
      import('three').DirectionalLight,
      typeof import('three').DirectionalLight
    > & {
      color?: import('three').ColorRepresentation;
    }
    
    pointLight: import('@react-three/fiber').ReactThreeFiber.Object3DNode<
      import('three').PointLight,
      typeof import('three').PointLight
    > & {
      color?: import('three').ColorRepresentation;
    }
  }
}