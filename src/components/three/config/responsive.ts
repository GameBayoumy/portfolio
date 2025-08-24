import { ResponsiveConfig, BreakpointConfig, ViewportConfig } from '@/types/visualizer';

// Default breakpoint configuration
export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  ultrawide: 1920,
};

// Responsive configuration presets
export const RESPONSIVE_PRESETS = {
  // Performance settings by screen size
  performance: {
    mobile: {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      antialias: false,
      shadows: false,
      postprocessing: false,
      maxLights: 2,
      lodEnabled: true,
      cullingDistance: 50,
      instancedRendering: true,
      batchedRendering: true,
    },
    tablet: {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      antialias: true,
      shadows: true,
      shadowMapSize: 512,
      postprocessing: true,
      maxLights: 4,
      lodEnabled: true,
      cullingDistance: 100,
      instancedRendering: true,
      batchedRendering: true,
    },
    desktop: {
      pixelRatio: window.devicePixelRatio || 1,
      antialias: true,
      shadows: true,
      shadowMapSize: 1024,
      postprocessing: true,
      maxLights: 8,
      lodEnabled: false,
      cullingDistance: 200,
      instancedRendering: true,
      batchedRendering: false,
    },
    ultrawide: {
      pixelRatio: window.devicePixelRatio || 1,
      antialias: true,
      shadows: true,
      shadowMapSize: 2048,
      postprocessing: true,
      maxLights: 12,
      lodEnabled: false,
      cullingDistance: 300,
      instancedRendering: true,
      batchedRendering: false,
    },
  },

  // Particle system configurations
  particles: {
    mobile: {
      count: 50,
      complexity: 'low' as const,
      physics: false,
      trails: false,
      collisions: false,
    },
    tablet: {
      count: 150,
      complexity: 'medium' as const,
      physics: true,
      trails: false,
      collisions: false,
    },
    desktop: {
      count: 500,
      complexity: 'high' as const,
      physics: true,
      trails: true,
      collisions: true,
    },
    ultrawide: {
      count: 1000,
      complexity: 'high' as const,
      physics: true,
      trails: true,
      collisions: true,
    },
  },

  // Geometry detail levels
  geometry: {
    mobile: {
      segments: 8,
      detail: 1,
      subdivision: 0,
      morphTargets: false,
    },
    tablet: {
      segments: 16,
      detail: 2,
      subdivision: 1,
      morphTargets: false,
    },
    desktop: {
      segments: 32,
      detail: 3,
      subdivision: 2,
      morphTargets: true,
    },
    ultrawide: {
      segments: 64,
      detail: 4,
      subdivision: 3,
      morphTargets: true,
    },
  },

  // Material quality settings
  materials: {
    mobile: {
      roughness: 0.7,
      metalness: 0.3,
      envMapIntensity: 0.5,
      normalMapType: 'basic',
      reflectivity: 0.3,
      clearcoat: 0,
    },
    tablet: {
      roughness: 0.5,
      metalness: 0.5,
      envMapIntensity: 0.7,
      normalMapType: 'standard',
      reflectivity: 0.5,
      clearcoat: 0.3,
    },
    desktop: {
      roughness: 0.3,
      metalness: 0.7,
      envMapIntensity: 1.0,
      normalMapType: 'standard',
      reflectivity: 0.7,
      clearcoat: 0.7,
    },
    ultrawide: {
      roughness: 0.2,
      metalness: 0.8,
      envMapIntensity: 1.2,
      normalMapType: 'tangent-space',
      reflectivity: 0.9,
      clearcoat: 1.0,
    },
  },

  // Animation settings
  animations: {
    mobile: {
      enabled: true,
      quality: 'low',
      frameSkip: 2,
      easing: 'linear',
      morphTargets: false,
    },
    tablet: {
      enabled: true,
      quality: 'medium',
      frameSkip: 1,
      easing: 'easeOut',
      morphTargets: false,
    },
    desktop: {
      enabled: true,
      quality: 'high',
      frameSkip: 0,
      easing: 'easeInOut',
      morphTargets: true,
    },
    ultrawide: {
      enabled: true,
      quality: 'ultra',
      frameSkip: 0,
      easing: 'easeInOut',
      morphTargets: true,
    },
  },

  // Camera settings
  camera: {
    mobile: {
      fov: 75,
      near: 0.1,
      far: 100,
      position: [0, 0, 5],
      maxDistance: 20,
      minDistance: 2,
    },
    tablet: {
      fov: 70,
      near: 0.1,
      far: 200,
      position: [0, 0, 8],
      maxDistance: 50,
      minDistance: 2,
    },
    desktop: {
      fov: 65,
      near: 0.1,
      far: 500,
      position: [0, 0, 10],
      maxDistance: 100,
      minDistance: 1,
    },
    ultrawide: {
      fov: 60,
      near: 0.1,
      far: 1000,
      position: [0, 0, 15],
      maxDistance: 200,
      minDistance: 1,
    },
  },

  // Layout and spacing
  layout: {
    mobile: {
      spacing: 0.5,
      scale: 0.7,
      margin: 0.2,
      gridSize: 2,
    },
    tablet: {
      spacing: 0.7,
      scale: 0.85,
      margin: 0.3,
      gridSize: 3,
    },
    desktop: {
      spacing: 1.0,
      scale: 1.0,
      margin: 0.5,
      gridSize: 4,
    },
    ultrawide: {
      spacing: 1.2,
      scale: 1.1,
      margin: 0.8,
      gridSize: 6,
    },
  },

  // UI scaling
  ui: {
    mobile: {
      fontSize: '0.8rem',
      padding: '0.5rem',
      buttonSize: 'small',
      controlScale: 0.8,
    },
    tablet: {
      fontSize: '0.9rem',
      padding: '0.75rem',
      buttonSize: 'medium',
      controlScale: 0.9,
    },
    desktop: {
      fontSize: '1rem',
      padding: '1rem',
      buttonSize: 'medium',
      controlScale: 1.0,
    },
    ultrawide: {
      fontSize: '1.1rem',
      padding: '1.25rem',
      buttonSize: 'large',
      controlScale: 1.1,
    },
  },

  // Network visualization specific
  network: {
    mobile: {
      maxNodes: 50,
      maxEdges: 75,
      nodeSize: 0.3,
      edgeWidth: 0.1,
      labelVisible: false,
      physics: false,
    },
    tablet: {
      maxNodes: 100,
      maxEdges: 150,
      nodeSize: 0.4,
      edgeWidth: 0.15,
      labelVisible: true,
      physics: true,
    },
    desktop: {
      maxNodes: 500,
      maxEdges: 750,
      nodeSize: 0.5,
      edgeWidth: 0.2,
      labelVisible: true,
      physics: true,
    },
    ultrawide: {
      maxNodes: 1000,
      maxEdges: 1500,
      nodeSize: 0.6,
      edgeWidth: 0.25,
      labelVisible: true,
      physics: true,
    },
  },
} as const;

// Component-specific responsive configurations
export const COMPONENT_RESPONSIVE_CONFIGS = {
  mathematicalShapes: {
    mobile: {
      count: 3,
      complexity: 'low',
      animationSpeed: 0.5,
      orbitalRadius: 2,
    },
    tablet: {
      count: 5,
      complexity: 'medium',
      animationSpeed: 0.75,
      orbitalRadius: 3,
    },
    desktop: {
      count: 8,
      complexity: 'high',
      animationSpeed: 1.0,
      orbitalRadius: 4,
    },
    ultrawide: {
      count: 12,
      complexity: 'high',
      animationSpeed: 1.2,
      orbitalRadius: 5,
    },
  },

  particleField: {
    mobile: {
      count: 100,
      spread: 5,
      speed: 0.01,
      size: 0.03,
    },
    tablet: {
      count: 300,
      spread: 8,
      speed: 0.015,
      size: 0.04,
    },
    desktop: {
      count: 800,
      spread: 12,
      speed: 0.02,
      size: 0.05,
    },
    ultrawide: {
      count: 1500,
      spread: 15,
      speed: 0.025,
      size: 0.06,
    },
  },

  vrHeadsetModel: {
    mobile: {
      scale: 0.6,
      animationSpeed: 0.7,
      glowIntensity: 0.3,
      interactive: false,
    },
    tablet: {
      scale: 0.8,
      animationSpeed: 0.8,
      glowIntensity: 0.5,
      interactive: true,
    },
    desktop: {
      scale: 1.0,
      animationSpeed: 1.0,
      glowIntensity: 0.7,
      interactive: true,
    },
    ultrawide: {
      scale: 1.2,
      animationSpeed: 1.2,
      glowIntensity: 1.0,
      interactive: true,
    },
  },

  networkGraph3D: {
    mobile: {
      nodeSize: 0.2,
      edgeWidth: 0.05,
      physics: false,
      labelsVisible: false,
      maxNodes: 25,
    },
    tablet: {
      nodeSize: 0.3,
      edgeWidth: 0.08,
      physics: true,
      labelsVisible: false,
      maxNodes: 50,
    },
    desktop: {
      nodeSize: 0.4,
      edgeWidth: 0.1,
      physics: true,
      labelsVisible: true,
      maxNodes: 200,
    },
    ultrawide: {
      nodeSize: 0.5,
      edgeWidth: 0.15,
      physics: true,
      labelsVisible: true,
      maxNodes: 500,
    },
  },
} as const;

// Utility functions for responsive configuration
export class ResponsiveConfigUtils {
  static getCurrentBreakpoint(breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS): keyof BreakpointConfig {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    if (width >= breakpoints.ultrawide) return 'ultrawide';
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'mobile';
  }

  static getResponsiveValue<T>(
    config: ResponsiveConfig<T>,
    breakpoint?: keyof ResponsiveConfig
  ): T {
    const currentBreakpoint = breakpoint || this.getCurrentBreakpoint();
    
    // Try to get value for current breakpoint, fallback to smaller sizes
    switch (currentBreakpoint) {
      case 'ultrawide':
        return config.ultrawide || config.desktop;
      case 'desktop':
        return config.desktop;
      case 'tablet':
        return config.tablet;
      case 'mobile':
      default:
        return config.mobile;
    }
  }

  static mergeResponsiveConfigs<T>(
    base: ResponsiveConfig<T>,
    override: ResponsiveConfig<Partial<T>>
  ): ResponsiveConfig<T> {
    return {
      mobile: { ...base.mobile, ...override.mobile },
      tablet: { ...base.tablet, ...override.tablet },
      desktop: { ...base.desktop, ...override.desktop },
      ultrawide: base.ultrawide || override.ultrawide 
        ? { ...base.ultrawide, ...override.ultrawide }
        : undefined,
    };
  }

  static interpolateResponsiveValues(
    mobileValue: number,
    desktopValue: number,
    currentWidth: number,
    breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS
  ): number {
    const { mobile, desktop } = breakpoints;
    
    if (currentWidth <= mobile) return mobileValue;
    if (currentWidth >= desktop) return desktopValue;
    
    // Linear interpolation between mobile and desktop
    const progress = (currentWidth - mobile) / (desktop - mobile);
    return mobileValue + (desktopValue - mobileValue) * progress;
  }

  static getViewportConfig(): ViewportConfig {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        aspect: 1024 / 768,
        factor: 1,
        distance: 10,
        dpr: 1,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    return {
      width,
      height,
      aspect: width / height,
      factor: Math.min(width / 1920, height / 1080),
      distance: 10,
      dpr,
    };
  }

  static isPortrait(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  }

  static isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < DEFAULT_BREAKPOINTS.mobile;
  }

  static isTablet(): boolean {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= DEFAULT_BREAKPOINTS.mobile && width < DEFAULT_BREAKPOINTS.desktop;
  }

  static isDesktop(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= DEFAULT_BREAKPOINTS.desktop;
  }

  static isUltrawide(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= DEFAULT_BREAKPOINTS.ultrawide;
  }

  static getOptimalParticleCount(baseCount: number): number {
    const viewport = this.getViewportConfig();
    const performanceFactor = Math.min(viewport.factor, 1);
    
    // Reduce particle count on smaller screens and lower performance devices
    return Math.floor(baseCount * performanceFactor);
  }

  static getOptimalGeometryDetail(baseDetail: number): number {
    const breakpoint = this.getCurrentBreakpoint();
    
    switch (breakpoint) {
      case 'mobile': return Math.max(1, Math.floor(baseDetail * 0.3));
      case 'tablet': return Math.max(1, Math.floor(baseDetail * 0.6));
      case 'desktop': return baseDetail;
      case 'ultrawide': return Math.floor(baseDetail * 1.5);
      default: return baseDetail;
    }
  }

  static shouldUseFeature(feature: string): boolean {
    const breakpoint = this.getCurrentBreakpoint();
    
    const featureSupport = {
      shadows: ['desktop', 'ultrawide'],
      postprocessing: ['tablet', 'desktop', 'ultrawide'],
      physics: ['tablet', 'desktop', 'ultrawide'],
      morphTargets: ['desktop', 'ultrawide'],
      reflections: ['desktop', 'ultrawide'],
      volumetricLighting: ['ultrawide'],
    } as const;

    const supportedBreakpoints = featureSupport[feature as keyof typeof featureSupport];
    return supportedBreakpoints?.includes(breakpoint as any) ?? false;
  }
}

export default RESPONSIVE_PRESETS;