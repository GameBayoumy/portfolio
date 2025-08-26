/**
 * Shader Material Manager
 * 
 * Advanced material management system for optimized shader rendering.
 * Features material pooling, automatic cleanup, and performance optimization.
 */

import * as THREE from 'three'
import { 
  ImprovedBackgroundVertexShader,
  ImprovedBackgroundFragmentShader,
  ImprovedBackgroundUniforms,
  ProfessionalPresets,
  QualityConfigs
} from '../shaders/ImprovedBackgroundShader'
import type { PerformanceSettings } from '@/types/visualizer'

// Material configuration interface
interface MaterialConfig {
  preset: keyof typeof ProfessionalPresets
  quality: keyof typeof QualityConfigs
  responsive: {
    screenWidth: number
    screenHeight: number
    devicePixelRatio: number
    isMobile: boolean
    isTablet: boolean
  }
  performance: Partial<PerformanceSettings>
}

// Material instance with metadata
interface ManagedMaterial {
  material: THREE.ShaderMaterial
  config: MaterialConfig
  lastUsed: number
  referenceCount: number
  id: string
}

// Performance optimization strategies
class MaterialOptimizer {
  private static instance: MaterialOptimizer
  
  static getInstance(): MaterialOptimizer {
    if (!MaterialOptimizer.instance) {
      MaterialOptimizer.instance = new MaterialOptimizer()
    }
    return MaterialOptimizer.instance
  }
  
  // Optimize uniforms based on performance settings
  optimizeUniforms(config: MaterialConfig): Record<string, { value: any }> {
    const baseUniforms = { ...ImprovedBackgroundUniforms }
    const presetConfig = ProfessionalPresets[config.preset]
    const qualityConfig = QualityConfigs[config.quality]
    
    // Apply preset configuration
    Object.entries(presetConfig).forEach(([key, value]) => {
      if (baseUniforms[key as keyof typeof baseUniforms]) {
        baseUniforms[key as keyof typeof baseUniforms].value = value
      }
    })
    
    // Apply quality configuration
    Object.entries(qualityConfig).forEach(([key, value]) => {
      if (baseUniforms[key as keyof typeof baseUniforms]) {
        baseUniforms[key as keyof typeof baseUniforms].value = value
      }
    })
    
    // Responsive adjustments
    const { responsive } = config
    
    // Mobile-specific optimizations
    if (responsive.isMobile) {
      baseUniforms.uAnimationSpeed.value *= 0.7
      baseUniforms.uAnimationIntensity.value *= 0.6
      baseUniforms.uFlowSpeed.value *= 0.5
      baseUniforms.uOpacity.value *= 0.8
      baseUniforms.uQualityLevel.value = Math.min(baseUniforms.uQualityLevel.value, 1)
      baseUniforms.uEnableComplexEffects.value = false
    }
    
    // Tablet-specific optimizations
    if (responsive.isTablet && !responsive.isMobile) {
      baseUniforms.uAnimationSpeed.value *= 0.85
      baseUniforms.uQualityLevel.value = Math.min(baseUniforms.uQualityLevel.value, 2)
    }
    
    // High DPI adjustments
    if (responsive.devicePixelRatio > 2) {
      baseUniforms.uLodBias.value += 0.2 // Reduce detail on high DPI screens
    }
    
    // Screen size adjustments
    baseUniforms.uScreenSize.value = [responsive.screenWidth, responsive.screenHeight]
    baseUniforms.uViewportSize.value = [responsive.screenWidth, responsive.screenHeight]
    baseUniforms.uDevicePixelRatio.value = responsive.devicePixelRatio
    baseUniforms.uIsMobile.value = responsive.isMobile
    
    return baseUniforms
  }
  
  // Optimize shader compilation flags
  getCompilationFlags(config: MaterialConfig): {
    defines: Record<string, any>
    precision: 'lowp' | 'mediump' | 'highp'
  } {
    const defines: Record<string, any> = {}
    let precision: 'lowp' | 'mediump' | 'highp' = 'highp'
    
    // Quality-based defines
    switch (config.quality) {
      case 'low':
        defines.USE_LOW_QUALITY = 1
        defines.MAX_OCTAVES = 2
        precision = 'mediump'
        break
      case 'medium':
        defines.USE_MEDIUM_QUALITY = 1
        defines.MAX_OCTAVES = 3
        precision = 'mediump'
        break
      case 'high':
        defines.USE_HIGH_QUALITY = 1
        defines.MAX_OCTAVES = 4
        precision = 'highp'
        break
      case 'ultra':
        defines.USE_ULTRA_QUALITY = 1
        defines.MAX_OCTAVES = 5
        defines.ENABLE_COMPLEX_EFFECTS = 1
        precision = 'highp'
        break
    }
    
    // Device-specific defines
    if (config.responsive.isMobile) {
      defines.IS_MOBILE = 1
      defines.OPTIMIZE_FOR_MOBILE = 1
      precision = 'mediump'
    }
    
    if (config.responsive.devicePixelRatio > 2) {
      defines.HIGH_DPI = 1
    }
    
    return { defines, precision }
  }
}

// Material pool for efficient reuse
class MaterialPool {
  private pool: Map<string, ManagedMaterial[]> = new Map()
  private maxPoolSize: number = 10
  private cleanupInterval: number
  
  constructor() {
    // Cleanup unused materials every 30 seconds
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup()
    }, 30000)
  }
  
  private generateConfigHash(config: MaterialConfig): string {
    return JSON.stringify({
      preset: config.preset,
      quality: config.quality,
      isMobile: config.responsive.isMobile,
      isTablet: config.responsive.isTablet,
      dpr: Math.round(config.responsive.devicePixelRatio * 10) / 10
    })
  }
  
  acquire(config: MaterialConfig): THREE.ShaderMaterial {
    const hash = this.generateConfigHash(config)
    const pool = this.pool.get(hash) || []
    
    // Try to reuse an existing material
    const available = pool.find(managed => managed.referenceCount === 0)
    if (available) {
      available.referenceCount++
      available.lastUsed = Date.now()
      
      // Update responsive uniforms
      this.updateResponsiveUniforms(available.material, config)
      
      return available.material
    }
    
    // Create new material if pool is empty or all materials are in use
    const material = this.createMaterial(config)
    const managed: ManagedMaterial = {
      material,
      config,
      lastUsed: Date.now(),
      referenceCount: 1,
      id: this.generateMaterialId()
    }
    
    pool.push(managed)
    this.pool.set(hash, pool)
    
    return material
  }
  
  release(material: THREE.ShaderMaterial): void {
    // Find the managed material and decrease reference count
    for (const [hash, pool] of this.pool) {
      const managed = pool.find(m => m.material === material)
      if (managed) {
        managed.referenceCount = Math.max(0, managed.referenceCount - 1)
        managed.lastUsed = Date.now()
        return
      }
    }
  }
  
  private createMaterial(config: MaterialConfig): THREE.ShaderMaterial {
    const optimizer = MaterialOptimizer.getInstance()
    const uniforms = optimizer.optimizeUniforms(config)
    const { defines, precision } = optimizer.getCompilationFlags(config)
    
    return new THREE.ShaderMaterial({
      vertexShader: ImprovedBackgroundVertexShader,
      fragmentShader: ImprovedBackgroundFragmentShader,
      uniforms,
      defines,
      precision,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false,
      // Enable uniform updates for animation
      uniformsNeedUpdate: true
    })
  }
  
  private updateResponsiveUniforms(material: THREE.ShaderMaterial, config: MaterialConfig): void {
    const { responsive } = config
    
    if (material.uniforms.uScreenSize) {
      material.uniforms.uScreenSize.value = [responsive.screenWidth, responsive.screenHeight]
    }
    if (material.uniforms.uViewportSize) {
      material.uniforms.uViewportSize.value = [responsive.screenWidth, responsive.screenHeight]
    }
    if (material.uniforms.uDevicePixelRatio) {
      material.uniforms.uDevicePixelRatio.value = responsive.devicePixelRatio
    }
    if (material.uniforms.uIsMobile) {
      material.uniforms.uIsMobile.value = responsive.isMobile
    }
  }
  
  private generateMaterialId(): string {
    return Math.random().toString(36).substring(2, 9)
  }
  
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 60000 // 1 minute
    
    for (const [hash, pool] of this.pool) {
      const activePool = pool.filter(managed => {
        // Keep if in use or recently used
        const shouldKeep = managed.referenceCount > 0 || (now - managed.lastUsed) < maxAge
        
        if (!shouldKeep) {
          // Dispose of unused material
          managed.material.dispose()
        }
        
        return shouldKeep
      })
      
      if (activePool.length === 0) {
        this.pool.delete(hash)
      } else {
        this.pool.set(hash, activePool.slice(0, this.maxPoolSize))
      }
    }
  }
  
  public dispose(): void {
    // Clean up all materials and clear the pool
    for (const [hash, pool] of this.pool) {
      pool.forEach(managed => managed.material.dispose())
    }
    this.pool.clear()
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
  
  public getStats(): {
    totalPools: number
    totalMaterials: number
    activeMaterials: number
    memoryUsage: string
  } {
    let totalMaterials = 0
    let activeMaterials = 0
    
    for (const pool of this.pool.values()) {
      totalMaterials += pool.length
      activeMaterials += pool.filter(m => m.referenceCount > 0).length
    }
    
    return {
      totalPools: this.pool.size,
      totalMaterials,
      activeMaterials,
      memoryUsage: `${Math.round(totalMaterials * 0.1)}KB` // Rough estimate
    }
  }
}

// Main Shader Material Manager
export class ShaderMaterialManager {
  private static instance: ShaderMaterialManager
  private materialPool: MaterialPool
  private animationHandlers: Map<THREE.ShaderMaterial, (time: number) => void> = new Map()
  private uniformUpdateQueue: Set<THREE.ShaderMaterial> = new Set()
  
  private constructor() {
    this.materialPool = new MaterialPool()
    this.startAnimationLoop()
  }
  
  static getInstance(): ShaderMaterialManager {
    if (!ShaderMaterialManager.instance) {
      ShaderMaterialManager.instance = new ShaderMaterialManager()
    }
    return ShaderMaterialManager.instance
  }
  
  // Create or acquire a managed material
  public createMaterial(config: MaterialConfig): THREE.ShaderMaterial {
    const material = this.materialPool.acquire(config)
    
    // Set up default animation handler
    this.animationHandlers.set(material, (time: number) => {
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = time
      }
    })
    
    return material
  }
  
  // Release a material back to the pool
  public releaseMaterial(material: THREE.ShaderMaterial): void {
    this.materialPool.release(material)
    this.animationHandlers.delete(material)
    this.uniformUpdateQueue.delete(material)
  }
  
  // Update material configuration
  public updateMaterial(material: THREE.ShaderMaterial, config: Partial<MaterialConfig>): void {
    // Update uniforms based on new configuration
    if (config.preset) {
      const presetConfig = ProfessionalPresets[config.preset]
      Object.entries(presetConfig).forEach(([key, value]) => {
        if (material.uniforms[key]) {
          material.uniforms[key].value = value
        }
      })
    }
    
    if (config.quality) {
      const qualityConfig = QualityConfigs[config.quality]
      Object.entries(qualityConfig).forEach(([key, value]) => {
        if (material.uniforms[key]) {
          material.uniforms[key].value = value
        }
      })
    }
    
    if (config.responsive) {
      const optimizer = MaterialOptimizer.getInstance()
      const currentConfig = { ...config } as MaterialConfig
      const uniforms = optimizer.optimizeUniforms(currentConfig)
      
      // Update responsive uniforms
      Object.entries(uniforms).forEach(([key, uniform]) => {
        if (material.uniforms[key]) {
          material.uniforms[key].value = uniform.value
        }
      })
    }
    
    this.uniformUpdateQueue.add(material)
  }
  
  // Set custom animation handler for a material
  public setAnimationHandler(
    material: THREE.ShaderMaterial,
    handler: (time: number, material: THREE.ShaderMaterial) => void
  ): void {
    this.animationHandlers.set(material, (time: number) => handler(time, material))
  }
  
  // Batch update uniforms for multiple materials
  public batchUpdateUniforms(updates: Map<THREE.ShaderMaterial, Record<string, any>>): void {
    updates.forEach((uniformUpdates, material) => {
      Object.entries(uniformUpdates).forEach(([key, value]) => {
        if (material.uniforms[key]) {
          material.uniforms[key].value = value
        }
      })
      this.uniformUpdateQueue.add(material)
    })
  }
  
  // Start animation loop for uniform updates
  private startAnimationLoop(): void {
    const animate = (time: number) => {
      // Update all animated materials
      this.animationHandlers.forEach((handler, material) => {
        handler(time * 0.001) // Convert to seconds
      })
      
      // Mark materials for uniform updates
      this.uniformUpdateQueue.forEach(material => {
        material.uniformsNeedUpdate = true
      })
      this.uniformUpdateQueue.clear()
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }
  
  // Get manager statistics
  public getStats(): {
    pool: ReturnType<MaterialPool['getStats']>
    animatedMaterials: number
    queuedUpdates: number
  } {
    return {
      pool: this.materialPool.getStats(),
      animatedMaterials: this.animationHandlers.size,
      queuedUpdates: this.uniformUpdateQueue.size
    }
  }
  
  // Dispose of all resources
  public dispose(): void {
    this.animationHandlers.clear()
    this.uniformUpdateQueue.clear()
    this.materialPool.dispose()
  }
}

// Convenience functions for common operations
export function createBackgroundMaterial(
  preset: keyof typeof ProfessionalPresets = 'elegant',
  quality: keyof typeof QualityConfigs = 'high',
  responsive?: Partial<MaterialConfig['responsive']>
): THREE.ShaderMaterial {
  const manager = ShaderMaterialManager.getInstance()
  
  const defaultResponsive = {
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false
  }
  
  return manager.createMaterial({
    preset,
    quality,
    responsive: { ...defaultResponsive, ...responsive },
    performance: {}
  })
}

export function updateMaterialResponsive(
  material: THREE.ShaderMaterial,
  screenWidth: number,
  screenHeight: number,
  devicePixelRatio: number
): void {
  const manager = ShaderMaterialManager.getInstance()
  
  manager.updateMaterial(material, {
    responsive: {
      screenWidth,
      screenHeight,
      devicePixelRatio,
      isMobile: screenWidth < 768,
      isTablet: screenWidth >= 768 && screenWidth < 1024
    }
  })
}

export default ShaderMaterialManager