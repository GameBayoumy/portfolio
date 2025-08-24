'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

// Browser API availability interface
interface BrowserAPIAvailability {
  window: boolean;
  document: boolean;
  canvas: boolean;
  webgl: boolean;
  webgl2: boolean;
  requestAnimationFrame: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  performanceAPI: boolean;
  memoryAPI: boolean;
  gamepadAPI: boolean;
  fullscreenAPI: boolean;
  pointerLock: boolean;
  webXR: boolean;
  webGPU: boolean;
  serviceWorker: boolean;
  webAssembly: boolean;
  audioContext: boolean;
  devicePixelRatio: boolean;
  touchSupport: boolean;
  orientationAPI: boolean;
  networkInformation: boolean;
  userAgent: string;
  isSSR: boolean;
  isBrowser: boolean;
  isHydrating: boolean;
}

// Context for browser API availability
const BrowserAPIContext = createContext<BrowserAPIAvailability | null>(null);

// Browser API detector class
class BrowserAPIDetector {
  private static instance: BrowserAPIDetector;
  private availability: BrowserAPIAvailability | null = null;

  static getInstance(): BrowserAPIDetector {
    if (!BrowserAPIDetector.instance) {
      BrowserAPIDetector.instance = new BrowserAPIDetector();
    }
    return BrowserAPIDetector.instance;
  }

  detect(): BrowserAPIAvailability {
    if (this.availability) {
      return this.availability;
    }

    const isSSR = typeof window === 'undefined';
    const isBrowser = !isSSR;
    
    this.availability = {
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      canvas: this.checkCanvasSupport(),
      webgl: this.checkWebGLSupport(),
      webgl2: this.checkWebGL2Support(),
      requestAnimationFrame: this.checkRequestAnimationFrame(),
      intersectionObserver: this.checkIntersectionObserver(),
      resizeObserver: this.checkResizeObserver(),
      performanceAPI: this.checkPerformanceAPI(),
      memoryAPI: this.checkMemoryAPI(),
      gamepadAPI: this.checkGamepadAPI(),
      fullscreenAPI: this.checkFullscreenAPI(),
      pointerLock: this.checkPointerLockAPI(),
      webXR: this.checkWebXR(),
      webGPU: this.checkWebGPU(),
      serviceWorker: this.checkServiceWorker(),
      webAssembly: this.checkWebAssembly(),
      audioContext: this.checkAudioContext(),
      devicePixelRatio: this.checkDevicePixelRatio(),
      touchSupport: this.checkTouchSupport(),
      orientationAPI: this.checkOrientationAPI(),
      networkInformation: this.checkNetworkInformation(),
      userAgent: this.getUserAgent(),
      isSSR,
      isBrowser,
      isHydrating: isBrowser && !document.body,
    };

    return this.availability;
  }

  private checkCanvasSupport(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  }

  private checkWebGLSupport(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private checkWebGL2Support(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch {
      return false;
    }
  }

  private checkRequestAnimationFrame(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof window.requestAnimationFrame === 'function';
  }

  private checkIntersectionObserver(): boolean {
    if (typeof window === 'undefined') return false;
    return 'IntersectionObserver' in window;
  }

  private checkResizeObserver(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ResizeObserver' in window;
  }

  private checkPerformanceAPI(): boolean {
    if (typeof window === 'undefined') return false;
    return 'performance' in window && 'now' in performance;
  }

  private checkMemoryAPI(): boolean {
    if (typeof window === 'undefined') return false;
    return 'performance' in window && 'memory' in performance;
  }

  private checkGamepadAPI(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'getGamepads' in navigator;
  }

  private checkFullscreenAPI(): boolean {
    if (typeof document === 'undefined') return false;
    return !!(
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen
    );
  }

  private checkPointerLockAPI(): boolean {
    if (typeof document === 'undefined') return false;
    return !!(
      document.exitPointerLock ||
      (document as any).webkitExitPointerLock ||
      (document as any).mozExitPointerLock
    );
  }

  private checkWebXR(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'xr' in navigator;
  }

  private checkWebGPU(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'gpu' in navigator;
  }

  private checkServiceWorker(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'serviceWorker' in navigator;
  }

  private checkWebAssembly(): boolean {
    if (typeof window === 'undefined') return false;
    return 'WebAssembly' in window;
  }

  private checkAudioContext(): boolean {
    if (typeof window === 'undefined') return false;
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }

  private checkDevicePixelRatio(): boolean {
    if (typeof window === 'undefined') return false;
    return 'devicePixelRatio' in window;
  }

  private checkTouchSupport(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints > 0) ||
      ((navigator as any).msMaxTouchPoints > 0)
    );
  }

  private checkOrientationAPI(): boolean {
    if (typeof window === 'undefined') return false;
    return 'orientation' in window || 'DeviceOrientationEvent' in window;
  }

  private checkNetworkInformation(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'connection' in navigator;
  }

  private getUserAgent(): string {
    if (typeof navigator === 'undefined') return 'server';
    return navigator.userAgent;
  }
}

// Safe browser API functions with fallbacks
export const safeBrowserAPI = {
  // Window operations
  getWindowSize: (): { width: number; height: number } => {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 }; // Default SSR values
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  // Device pixel ratio with fallback
  getDevicePixelRatio: (): number => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  },

  // Request animation frame with fallback
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 16) as unknown as number;
  },

  cancelAnimationFrame: (id: number): void => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },

  // Performance API with fallback
  now: (): number => {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  },

  // Memory API with fallback
  getMemoryUsage: () => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return { used: 0, total: 0, limit: 0 };
  },

  // Event listener management
  addEventListener: <K extends keyof WindowEventMap>(
    target: Window | Document | Element | null,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void => {
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(type as string, listener as EventListener, options);
    }
  },

  removeEventListener: <K extends keyof WindowEventMap>(
    target: Window | Document | Element | null,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void => {
    if (target && typeof target.removeEventListener === 'function') {
      target.removeEventListener(type as string, listener as EventListener, options);
    }
  },

  // Local storage with error handling
  localStorage: {
    getItem: (key: string): string | null => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (error) {
        console.warn('localStorage.getItem failed:', error);
      }
      return null;
    },

    setItem: (key: string, value: string): boolean => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return true;
        }
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
      }
      return false;
    },

    removeItem: (key: string): boolean => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return true;
        }
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
      }
      return false;
    },
  },

  // User agent detection
  getUserAgent: (): string => {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'server';
  },

  // Network information
  getNetworkInfo: () => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        saveData: connection.saveData,
      };
    }
    return {
      effectiveType: '4g',
      downlink: 10,
      saveData: false,
    };
  },
};

// Provider component
interface BrowserAPIGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  onAPIDetected?: (availability: BrowserAPIAvailability) => void;
}

export const BrowserAPIGuard: React.FC<BrowserAPIGuardProps> = ({
  children,
  fallback = null,
  onAPIDetected,
}) => {
  const [availability, setAvailability] = useState<BrowserAPIAvailability | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const detector = BrowserAPIDetector.getInstance();
    const detected = detector.detect();
    setAvailability(detected);
    setIsHydrated(true);
    onAPIDetected?.(detected);
  }, [onAPIDetected]);

  // During SSR or before hydration
  if (!isHydrated || !availability) {
    return <>{fallback}</>;
  }

  // If we're in a browser environment that doesn't meet minimum requirements
  if (availability.isBrowser && !availability.canvas) {
    return <>{fallback}</>;
  }

  return (
    <BrowserAPIContext.Provider value={availability}>
      {children}
    </BrowserAPIContext.Provider>
  );
};

// Hook to use browser API availability
export const useBrowserAPIAvailability = (): BrowserAPIAvailability => {
  const availability = useContext(BrowserAPIContext);
  if (!availability) {
    throw new Error('useBrowserAPIAvailability must be used within BrowserAPIGuard');
  }
  return availability;
};

// Utility hooks
export const useIsSSR = (): boolean => {
  const [isSSR, setIsSSR] = useState(true);
  useEffect(() => {
    setIsSSR(false);
  }, []);
  return isSSR;
};

export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
};

export const useSafeBrowserAPI = () => safeBrowserAPI;

export default BrowserAPIDetector;