'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as THREE from 'three';
import { useWebGLCapabilities } from './WebGLCapabilityDetector';

// WebGL context recovery interface
interface WebGLContextState {
  isContextLost: boolean;
  contextLossCount: number;
  lastContextLoss: number | null;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  isRecovering: boolean;
  renderer: THREE.WebGLRenderer | null;
  contextLossReason: string | null;
  preventDrawingBuffer: boolean;
}

interface WebGLContextRecoveryConfig {
  maxRecoveryAttempts?: number;
  recoveryDelay?: number;
  preventDrawingBufferPreservation?: boolean;
  enableAutomaticRecovery?: boolean;
  onContextLost?: (event: Event) => void;
  onContextRestored?: (renderer: THREE.WebGLRenderer) => void;
  onRecoveryFailed?: (attempts: number) => void;
}

interface WebGLContextRecoveryValue {
  contextState: WebGLContextState;
  attemptRecovery: () => Promise<boolean>;
  resetRecoveryState: () => void;
  createRenderer: (canvas: HTMLCanvasElement, options?: any) => THREE.WebGLRenderer | null;
  isContextHealthy: () => boolean;
  forceContextLoss: () => void; // For testing
}

// Context for WebGL recovery
const WebGLContextRecoveryContext = createContext<WebGLContextRecoveryValue | null>(null);

// WebGL context recovery manager
class WebGLContextRecoveryManager {
  private static instance: WebGLContextRecoveryManager;
  private renderers = new Set<THREE.WebGLRenderer>();
  private canvases = new Map<HTMLCanvasElement, THREE.WebGLRenderer>();
  private contextLossListeners = new Map<HTMLCanvasElement, EventListener>();
  private contextRestoreListeners = new Map<HTMLCanvasElement, EventListener>();
  private config: Required<WebGLContextRecoveryConfig>;
  private state: WebGLContextState;
  private callbacks: {
    onContextLost?: (event: Event) => void;
    onContextRestored?: (renderer: THREE.WebGLRenderer) => void;
    onRecoveryFailed?: (attempts: number) => void;
  };

  static getInstance(): WebGLContextRecoveryManager {
    if (!WebGLContextRecoveryManager.instance) {
      WebGLContextRecoveryManager.instance = new WebGLContextRecoveryManager();
    }
    return WebGLContextRecoveryManager.instance;
  }

  private constructor() {
    this.config = {
      maxRecoveryAttempts: 3,
      recoveryDelay: 1000,
      preventDrawingBufferPreservation: true,
      enableAutomaticRecovery: true,
  onContextLost: () => {},
  onContextRestored: () => {},
  onRecoveryFailed: () => {},
    };

    this.state = {
      isContextLost: false,
      contextLossCount: 0,
      lastContextLoss: null,
      recoveryAttempts: 0,
      maxRecoveryAttempts: this.config.maxRecoveryAttempts,
      isRecovering: false,
      renderer: null,
      contextLossReason: null,
      preventDrawingBuffer: this.config.preventDrawingBufferPreservation,
    };

  this.callbacks = {};
  }

  configure(config: WebGLContextRecoveryConfig): void {
    this.config = { ...this.config, ...config };
    this.state.maxRecoveryAttempts = this.config.maxRecoveryAttempts;
    this.callbacks = {
      onContextLost: config.onContextLost,
      onContextRestored: config.onContextRestored,
      onRecoveryFailed: config.onRecoveryFailed,
    };
  }

  createRenderer(
    canvas: HTMLCanvasElement, 
    options: any = {},
    forceRecreate = false
  ): THREE.WebGLRenderer | null {
    try {
      // Check if we already have a renderer for this canvas and it's still valid
      const existingRenderer = this.canvases.get(canvas);
      if (existingRenderer && !forceRecreate && this.isRendererValid(existingRenderer)) {
        return existingRenderer;
      }

      // Clean up existing renderer if it exists
      if (existingRenderer) {
        this.disposeRenderer(existingRenderer);
      }

      // Create WebGL context with recovery options
      const contextOptions = {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: !this.config.preventDrawingBufferPreservation,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        ...options,
      };

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: undefined, // Let Three.js create the context
        ...contextOptions,
      });

      // Configure renderer for stability
      renderer.debug.checkShaderErrors = process.env.NODE_ENV === 'development';
      renderer.capabilities.logarithmicDepthBuffer = false;
      
      // Set up context event listeners
      this.setupContextListeners(canvas, renderer);
      
      // Register renderer
      this.renderers.add(renderer);
      this.canvases.set(canvas, renderer);
      this.state.renderer = renderer;

      console.log('WebGL renderer created successfully');
      return renderer;

    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      this.state.contextLossReason = error instanceof Error ? error.message : 'Unknown error';
      return null;
    }
  }

  private setupContextListeners(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer): void {
    const handleContextLost = (event: Event) => {
      console.warn('WebGL context lost');
      event.preventDefault(); // Prevent default context loss behavior
      
      this.state.isContextLost = true;
      this.state.contextLossCount++;
      this.state.lastContextLoss = Date.now();
      this.state.contextLossReason = 'Context lost event';
      
      // Call external callback
      this.callbacks.onContextLost?.(event);
      
      // Attempt automatic recovery if enabled
      if (this.config.enableAutomaticRecovery) {
        this.scheduleRecovery(canvas);
      }
    };

    const handleContextRestored = (event: Event) => {
      console.log('WebGL context restored');
      
      this.state.isContextLost = false;
      this.state.isRecovering = false;
      this.state.recoveryAttempts = 0;
      this.state.contextLossReason = null;
      
      // Call external callback
      this.callbacks.onContextRestored?.(renderer);
    };

    // Add event listeners
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    // Store listeners for cleanup
    this.contextLossListeners.set(canvas, handleContextLost);
    this.contextRestoreListeners.set(canvas, handleContextRestored);
  }

  private scheduleRecovery(canvas: HTMLCanvasElement): void {
    if (this.state.recoveryAttempts >= this.state.maxRecoveryAttempts) {
      console.error('Max recovery attempts reached');
      this.callbacks.onRecoveryFailed?.(this.state.recoveryAttempts);
      return;
    }

    const delay = this.config.recoveryDelay * Math.pow(2, this.state.recoveryAttempts); // Exponential backoff
    
    setTimeout(() => {
      this.attemptRecovery(canvas);
    }, delay);
  }

  async attemptRecovery(canvas?: HTMLCanvasElement): Promise<boolean> {
    if (this.state.isRecovering) {
      return false;
    }

    this.state.isRecovering = true;
    this.state.recoveryAttempts++;

    console.log(`Attempting WebGL context recovery (attempt ${this.state.recoveryAttempts})`);

    try {
      // If no specific canvas provided, try to recover all canvases
      if (!canvas) {
        let anySuccess = false;
        for (const [canvasElement, renderer] of this.canvases) {
          const success = await this.recoverCanvas(canvasElement, renderer);
          if (success) anySuccess = true;
        }
        return anySuccess;
      } else {
        const renderer = this.canvases.get(canvas);
        if (!renderer) return false;
        return await this.recoverCanvas(canvas, renderer);
      }
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      this.state.isRecovering = false;
      return false;
    }
  }

  private async recoverCanvas(canvas: HTMLCanvasElement, oldRenderer: THREE.WebGLRenderer): Promise<boolean> {
    try {
      // Create new renderer with same options
      const newRenderer = this.createRenderer(canvas, {}, true);
      
      if (!newRenderer) {
        throw new Error('Failed to create new renderer');
      }

      // Test the new renderer
      if (!this.testRenderer(newRenderer)) {
        throw new Error('New renderer failed basic tests');
      }

      console.log('WebGL context recovery successful');
      return true;

    } catch (error) {
      console.error('Canvas recovery failed:', error);
      
      // Schedule another recovery attempt if we haven't exceeded the limit
      if (this.state.recoveryAttempts < this.state.maxRecoveryAttempts) {
        this.scheduleRecovery(canvas);
      } else {
        this.callbacks.onRecoveryFailed?.(this.state.recoveryAttempts);
      }
      
      return false;
    }
  }

  private testRenderer(renderer: THREE.WebGLRenderer): boolean {
    try {
      const gl = renderer.getContext();
      
      // Basic WebGL health checks
      if (!gl) return false;
      if (gl.isContextLost()) return false;
      
      // Try to get basic parameters
      const vendor = gl.getParameter(gl.VENDOR);
      const version = gl.getParameter(gl.VERSION);
      
      if (!vendor || !version) return false;

      // Try to create and compile a basic shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vertexShader) return false;
      
      const basicVertexSource = `
        attribute vec4 position;
        void main() {
          gl_Position = position;
        }
      `;
      
      gl.shaderSource(vertexShader, basicVertexSource);
      gl.compileShader(vertexShader);
      
      const success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
      gl.deleteShader(vertexShader);
      
      return !!success;
      
    } catch (error) {
      console.error('Renderer test failed:', error);
      return false;
    }
  }

  private isRendererValid(renderer: THREE.WebGLRenderer): boolean {
    try {
      const gl = renderer.getContext();
      return gl && !gl.isContextLost();
    } catch {
      return false;
    }
  }

  disposeRenderer(renderer: THREE.WebGLRenderer): void {
    try {
      // Find and remove canvas association
      for (const [canvas, canvasRenderer] of this.canvases) {
        if (canvasRenderer === renderer) {
          // Remove event listeners
          const lossListener = this.contextLossListeners.get(canvas);
          const restoreListener = this.contextRestoreListeners.get(canvas);
          
          if (lossListener) {
            canvas.removeEventListener('webglcontextlost', lossListener);
            this.contextLossListeners.delete(canvas);
          }
          
          if (restoreListener) {
            canvas.removeEventListener('webglcontextrestored', restoreListener);
            this.contextRestoreListeners.delete(canvas);
          }
          
          this.canvases.delete(canvas);
          break;
        }
      }
      
      // Remove from renderers set
      this.renderers.delete(renderer);
      
      // Dispose renderer
      renderer.dispose();
      
    } catch (error) {
      console.error('Error disposing renderer:', error);
    }
  }

  getState(): WebGLContextState {
    return { ...this.state };
  }

  resetRecoveryState(): void {
    this.state.recoveryAttempts = 0;
    this.state.isRecovering = false;
    this.state.contextLossReason = null;
  }

  isContextHealthy(): boolean {
    return !this.state.isContextLost && !this.state.isRecovering;
  }

  forceContextLoss(): void {
    // For testing purposes
    for (const renderer of this.renderers) {
      try {
        const gl = renderer.getContext();
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
          ext.loseContext();
        }
      } catch (error) {
        console.error('Failed to force context loss:', error);
      }
    }
  }

  cleanup(): void {
    // Dispose all renderers
    for (const renderer of this.renderers) {
      this.disposeRenderer(renderer);
    }
    
    // Clear all maps and sets
    this.renderers.clear();
    this.canvases.clear();
    this.contextLossListeners.clear();
    this.contextRestoreListeners.clear();
    
    // Reset state
    this.state = {
      isContextLost: false,
      contextLossCount: 0,
      lastContextLoss: null,
      recoveryAttempts: 0,
      maxRecoveryAttempts: this.config.maxRecoveryAttempts,
      isRecovering: false,
      renderer: null,
      contextLossReason: null,
      preventDrawingBuffer: this.config.preventDrawingBufferPreservation,
    };
  }
}

// Provider component
interface WebGLContextRecoveryProviderProps {
  children: ReactNode;
  config?: WebGLContextRecoveryConfig;
  onContextLost?: (event: Event) => void;
  onContextRestored?: (renderer: THREE.WebGLRenderer) => void;
  onRecoveryFailed?: (attempts: number) => void;
}

export const WebGLContextRecoveryProvider: React.FC<WebGLContextRecoveryProviderProps> = ({
  children,
  config = {},
  onContextLost,
  onContextRestored,
  onRecoveryFailed,
}) => {
  const manager = WebGLContextRecoveryManager.getInstance();
  const [contextState, setContextState] = useState<WebGLContextState>(manager.getState());
  
  useEffect(() => {
    // Configure manager with props
    manager.configure({
      ...config,
      onContextLost: (event) => {
        setContextState(manager.getState());
        onContextLost?.(event);
      },
      onContextRestored: (renderer) => {
        setContextState(manager.getState());
        onContextRestored?.(renderer);
      },
      onRecoveryFailed: (attempts) => {
        setContextState(manager.getState());
        onRecoveryFailed?.(attempts);
      },
    });
    
    // Update state periodically
    const interval = setInterval(() => {
      setContextState(manager.getState());
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [config, onContextLost, onContextRestored, onRecoveryFailed]);

  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    const success = await manager.attemptRecovery();
    setContextState(manager.getState());
    return success;
  }, []);

  const resetRecoveryState = useCallback((): void => {
    manager.resetRecoveryState();
    setContextState(manager.getState());
  }, []);

  const createRenderer = useCallback((canvas: HTMLCanvasElement, options?: any): THREE.WebGLRenderer | null => {
    const renderer = manager.createRenderer(canvas, options);
    setContextState(manager.getState());
    return renderer;
  }, []);

  const isContextHealthy = useCallback((): boolean => {
    return manager.isContextHealthy();
  }, []);

  const forceContextLoss = useCallback((): void => {
    manager.forceContextLoss();
  }, []);

  const value: WebGLContextRecoveryValue = {
    contextState,
    attemptRecovery,
    resetRecoveryState,
    createRenderer,
    isContextHealthy,
    forceContextLoss,
  };

  return (
    <WebGLContextRecoveryContext.Provider value={value}>
      {children}
    </WebGLContextRecoveryContext.Provider>
  );
};

// Hook to use WebGL context recovery
export const useWebGLContextRecovery = (): WebGLContextRecoveryValue => {
  const context = useContext(WebGLContextRecoveryContext);
  if (!context) {
    throw new Error('useWebGLContextRecovery must be used within WebGLContextRecoveryProvider');
  }
  return context;
};

// Utility hooks
export const useWebGLContextHealth = (): boolean => {
  const { isContextHealthy } = useWebGLContextRecovery();
  return isContextHealthy();
};

export const useContextLossDetection = (onContextLoss?: () => void, onContextRestore?: () => void) => {
  const { contextState } = useWebGLContextRecovery();
  const [wasLost, setWasLost] = useState(false);

  useEffect(() => {
    if (contextState.isContextLost && !wasLost) {
      setWasLost(true);
      onContextLoss?.();
    } else if (!contextState.isContextLost && wasLost) {
      setWasLost(false);
      onContextRestore?.();
    }
  }, [contextState.isContextLost, wasLost, onContextLoss, onContextRestore]);

  return {
    isContextLost: contextState.isContextLost,
    isRecovering: contextState.isRecovering,
    recoveryAttempts: contextState.recoveryAttempts,
    contextLossCount: contextState.contextLossCount,
  };
};

export default WebGLContextRecoveryManager;