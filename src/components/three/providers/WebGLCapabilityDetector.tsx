'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import * as THREE from 'three';

// WebGL capability detection interface
interface WebGLCapabilities {
  supported: boolean;
  version: 'webgl' | 'webgl2' | 'none';
  context: WebGLRenderingContext | WebGL2RenderingContext | null;
  extensions: string[];
  parameters: {
    maxTextureSize: number;
    maxCubeMapTextureSize: number;
    maxRenderBufferSize: number;
    maxTextureImageUnits: number;
    maxVertexTextureImageUnits: number;
    maxCombinedTextureImageUnits: number;
    maxVertexUniforms: number;
    maxFragmentUniforms: number;
    maxVaryingVectors: number;
    aliasedLineWidthRange: [number, number];
    aliasedPointSizeRange: [number, number];
  };
  features: {
    floatTextures: boolean;
    halfFloatTextures: boolean;
    vertexArrayObjects: boolean;
    instancedArrays: boolean;
    drawBuffers: boolean;
    depthTexture: boolean;
    standardDerivatives: boolean;
    shaderTextureLod: boolean;
  };
  renderer: {
    vendor: string;
    renderer: string;
    version: string;
    shadingLanguageVersion: string;
  };
  performance: {
    tier: 'low' | 'medium' | 'high' | 'unknown';
    mobile: boolean;
    integrated: boolean;
  };
  errors: string[];
}

// Context for WebGL capabilities
const WebGLCapabilityContext = createContext<WebGLCapabilities | null>(null);

// WebGL capability detector class
class WebGLCapabilityDetector {
  private static instance: WebGLCapabilityDetector;
  private canvas: HTMLCanvasElement | null = null;
  private capabilities: WebGLCapabilities | null = null;
  private detectionPromise: Promise<WebGLCapabilities> | null = null;

  static getInstance(): WebGLCapabilityDetector {
    if (!WebGLCapabilityDetector.instance) {
      WebGLCapabilityDetector.instance = new WebGLCapabilityDetector();
    }
    return WebGLCapabilityDetector.instance;
  }

  async detect(): Promise<WebGLCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.performDetection();
    return this.detectionPromise;
  }

  private async performDetection(): Promise<WebGLCapabilities> {
    const errors: string[] = [];
    
    try {
      // Create test canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1;
      this.canvas.height = 1;
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '-9999px';
      document.body.appendChild(this.canvas);

      // Try WebGL2 first, then WebGL1
      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
      let version: 'webgl' | 'webgl2' | 'none' = 'none';

      try {
        gl = this.canvas.getContext('webgl2', {
          failIfMajorPerformanceCaveat: false,
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false,
        }) as WebGL2RenderingContext;
        
        if (gl) {
          version = 'webgl2';
        }
      } catch (error) {
        errors.push(`WebGL2 context creation failed: ${error}`);
      }

      if (!gl) {
        try {
          gl = this.canvas.getContext('webgl', {
            failIfMajorPerformanceCaveat: false,
            antialias: false,
            alpha: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
          }) as WebGLRenderingContext;
          
          if (gl) {
            version = 'webgl';
          }
        } catch (error) {
          errors.push(`WebGL1 context creation failed: ${error}`);
        }
      }

      if (!gl) {
        throw new Error('WebGL not supported');
      }

      // Detect extensions
      const extensions = gl.getSupportedExtensions() || [];
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      // Get renderer info
      const renderer = {
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      };

      // Get parameters
      const parameters = {
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
        aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
      };

      // Detect features
      const features = {
        floatTextures: extensions.includes('OES_texture_float') || version === 'webgl2',
        halfFloatTextures: extensions.includes('OES_texture_half_float') || version === 'webgl2',
        vertexArrayObjects: extensions.includes('OES_vertex_array_object') || version === 'webgl2',
        instancedArrays: extensions.includes('ANGLE_instanced_arrays') || version === 'webgl2',
        drawBuffers: extensions.includes('WEBGL_draw_buffers') || version === 'webgl2',
        depthTexture: extensions.includes('WEBGL_depth_texture') || version === 'webgl2',
        standardDerivatives: extensions.includes('OES_standard_derivatives') || version === 'webgl2',
        shaderTextureLod: extensions.includes('EXT_shader_texture_lod') || version === 'webgl2',
      };

      // Performance assessment
      const performance = this.assessPerformance(renderer, parameters);

      this.capabilities = {
        supported: true,
        version,
        context: gl,
        extensions,
        parameters,
        features,
        renderer,
        performance,
        errors,
      };

      return this.capabilities;

    } catch (error) {
      errors.push(`WebGL detection failed: ${error}`);
      
      this.capabilities = {
        supported: false,
        version: 'none',
        context: null,
        extensions: [],
        parameters: {
          maxTextureSize: 0,
          maxCubeMapTextureSize: 0,
          maxRenderBufferSize: 0,
          maxTextureImageUnits: 0,
          maxVertexTextureImageUnits: 0,
          maxCombinedTextureImageUnits: 0,
          maxVertexUniforms: 0,
          maxFragmentUniforms: 0,
          maxVaryingVectors: 0,
          aliasedLineWidthRange: [0, 0],
          aliasedPointSizeRange: [0, 0],
        },
        features: {
          floatTextures: false,
          halfFloatTextures: false,
          vertexArrayObjects: false,
          instancedArrays: false,
          drawBuffers: false,
          depthTexture: false,
          standardDerivatives: false,
          shaderTextureLod: false,
        },
        renderer: {
          vendor: 'unknown',
          renderer: 'unknown',
          version: 'unknown',
          shadingLanguageVersion: 'unknown',
        },
        performance: {
          tier: 'unknown',
          mobile: this.isMobile(),
          integrated: false,
        },
        errors,
      };
      
      return this.capabilities;
    } finally {
      // Clean up test canvas
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
      }
    }
  }

  private assessPerformance(renderer: any, parameters: any) {
    const mobile = this.isMobile();
    const integrated = this.isIntegratedGPU(renderer.renderer);
    const tier = this.determinePerformanceTier(renderer, parameters, mobile, integrated);
    
    return { tier, mobile, integrated };
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private isIntegratedGPU(rendererString: string): boolean {
    const integrated = ['intel', 'intel(r) hd', 'intel(r) iris', 'intel(r) uhd', 'adreno', 'mali', 'powervr', 'videocore'];
    const rendererLower = rendererString.toLowerCase();
    return integrated.some(gpu => rendererLower.includes(gpu));
  }

  private determinePerformanceTier(
    renderer: any, 
    parameters: any, 
    mobile: boolean, 
    integrated: boolean
  ): 'low' | 'medium' | 'high' | 'unknown' {
    if (mobile) return 'low';
    if (integrated) return 'medium';
    
    const rendererLower = renderer.renderer.toLowerCase();
    
    // High-end GPUs
    if (rendererLower.includes('rtx') || 
        rendererLower.includes('gtx 1080') || 
        rendererLower.includes('gtx 1070') ||
        rendererLower.includes('rx 580') ||
        rendererLower.includes('rx 6') ||
        rendererLower.includes('rx 7')) {
      return 'high';
    }
    
    // Mid-range GPUs
    if (rendererLower.includes('gtx') || 
        rendererLower.includes('rx ') ||
        rendererLower.includes('radeon')) {
      return 'medium';
    }
    
    // Check texture size as fallback
    if (parameters.maxTextureSize >= 8192) return 'high';
    if (parameters.maxTextureSize >= 4096) return 'medium';
    
    return 'low';
  }

  cleanup(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
    this.capabilities = null;
    this.detectionPromise = null;
  }
}

// Provider component
interface WebGLCapabilityProviderProps {
  children: ReactNode;
  onCapabilitiesDetected?: (capabilities: WebGLCapabilities) => void;
  onDetectionError?: (error: Error) => void;
}

export const WebGLCapabilityProvider: React.FC<WebGLCapabilityProviderProps> = ({
  children,
  onCapabilitiesDetected,
  onDetectionError,
}) => {
  const [capabilities, setCapabilities] = useState<WebGLCapabilities | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        const detector = WebGLCapabilityDetector.getInstance();
        const caps = await detector.detect();
        setCapabilities(caps);
        onCapabilitiesDetected?.(caps);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown detection error');
        onDetectionError?.(err);
        // Set minimal capabilities for fallback
        setCapabilities({
          supported: false,
          version: 'none',
          context: null,
          extensions: [],
          parameters: {
            maxTextureSize: 0,
            maxCubeMapTextureSize: 0,
            maxRenderBufferSize: 0,
            maxTextureImageUnits: 0,
            maxVertexTextureImageUnits: 0,
            maxCombinedTextureImageUnits: 0,
            maxVertexUniforms: 0,
            maxFragmentUniforms: 0,
            maxVaryingVectors: 0,
            aliasedLineWidthRange: [0, 0],
            aliasedPointSizeRange: [0, 0],
          },
          features: {
            floatTextures: false,
            halfFloatTextures: false,
            vertexArrayObjects: false,
            instancedArrays: false,
            drawBuffers: false,
            depthTexture: false,
            standardDerivatives: false,
            shaderTextureLod: false,
          },
          renderer: {
            vendor: 'unknown',
            renderer: 'unknown',
            version: 'unknown',
            shadingLanguageVersion: 'unknown',
          },
          performance: {
            tier: 'unknown',
            mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            integrated: false,
          },
          errors: [err.message],
        });
      } finally {
        setIsDetecting(false);
      }
    };

    if (typeof window !== 'undefined') {
      detectCapabilities();
    }

    return () => {
      // Cleanup on unmount
      WebGLCapabilityDetector.getInstance().cleanup();
    };
  }, [onCapabilitiesDetected, onDetectionError]);

  if (isDetecting || !capabilities) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Detecting 3D capabilities...</span>
      </div>
    );
  }

  return (
    <WebGLCapabilityContext.Provider value={capabilities}>
      {children}
    </WebGLCapabilityContext.Provider>
  );
};

// Hook to use WebGL capabilities
export const useWebGLCapabilities = (): WebGLCapabilities => {
  const capabilities = useContext(WebGLCapabilityContext);
  if (!capabilities) {
    throw new Error('useWebGLCapabilities must be used within WebGLCapabilityProvider');
  }
  return capabilities;
};

// Utility hooks
export const useWebGLSupported = (): boolean => {
  const capabilities = useWebGLCapabilities();
  return capabilities.supported;
};

export const useWebGL2Supported = (): boolean => {
  const capabilities = useWebGLCapabilities();
  return capabilities.supported && capabilities.version === 'webgl2';
};

export const useGPUTier = (): 'low' | 'medium' | 'high' | 'unknown' => {
  const capabilities = useWebGLCapabilities();
  return capabilities.performance.tier;
};

export const useIsMobile = (): boolean => {
  const capabilities = useWebGLCapabilities();
  return capabilities.performance.mobile;
};

export default WebGLCapabilityDetector;