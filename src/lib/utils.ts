import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Performance utilities for 3D rendering
export const performanceUtils = {
  // Get device performance tier
  getPerformanceTier: (): 'low' | 'medium' | 'high' => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      
      if (!gl) return 'low';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      // Check for discrete GPU indicators
      const highPerformanceIndicators = ['nvidia', 'amd', 'radeon', 'geforce', 'quadro'];
      const lowPerformanceIndicators = ['intel', 'integrated', 'software'];
      
      const rendererLower = (renderer as string).toLowerCase();
      
      if (highPerformanceIndicators.some(indicator => rendererLower.includes(indicator))) {
        return 'high';
      }
      
      if (lowPerformanceIndicators.some(indicator => rendererLower.includes(indicator))) {
        return 'low';
      }
      
      return 'medium';
    } catch (e) {
      return 'medium';
    }
  },

  // Get optimal quality settings based on device
  getQualitySettings: (performanceTier: 'low' | 'medium' | 'high') => {
    const settings = {
      low: {
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        antialias: false,
        shadows: false,
        postprocessing: false,
        particleCount: 50,
        maxLights: 2,
      },
      medium: {
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        antialias: false,
        shadows: true,
        postprocessing: true,
        particleCount: 150,
        maxLights: 4,
      },
      high: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        shadows: true,
        postprocessing: true,
        particleCount: 300,
        maxLights: 8,
      },
    };
    
    return settings[performanceTier];
  },
};

// Animation utilities
export const animationUtils = {
  // Easing functions
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Linear interpolation
  lerp: (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  },

  // Clamp function
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },
};

// Math utilities for 3D calculations
export const mathUtils = {
  // Convert degrees to radians
  degToRad: (degrees: number): number => degrees * (Math.PI / 180),
  
  // Convert radians to degrees
  radToDeg: (radians: number): number => radians * (180 / Math.PI),
  
  // Generate random number between min and max
  random: (min: number, max: number): number => Math.random() * (max - min) + min,
  
  // Map value from one range to another
  map: (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  },
  
  // Distance between two 3D points
  distance3D: (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
  },
};

// Device detection utilities
export const deviceUtils = {
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  isTablet: (): boolean => {
    return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  },
  
  hasWebGL: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  },
  
  hasWebGL2: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  },
  
  supportsXR: async (): Promise<boolean> => {
    if ('navigator' in window && 'xr' in navigator) {
      try {
        const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
        return isSupported;
      } catch (e) {
        return false;
      }
    }
    return false;
  },
};

// Format utilities
export const formatUtils = {
  // Format email for display
  formatEmail: (email: string): string => {
    return email.replace('@', ' [at] ').replace('.', ' [dot] ');
  },
  
  // Format URL for display
  formatUrl: (url: string): string => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  },
  
  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
};