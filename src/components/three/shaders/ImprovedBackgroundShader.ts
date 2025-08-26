/**
 * Improved 3D Animated Background Shader System
 * 
 * Features:
 * - Subtle, elegant algorithms optimized for professional backgrounds
 * - Smooth, eased transitions with proper timing controls
 * - Responsive system that adapts to device capabilities
 * - Optimized for 60fps performance across devices
 * - Professional color palettes and parameter ranges
 * - Multiple blend modes and composition techniques
 * 
 * Research-based improvements:
 * - Noise functions with optimized octaves and persistence
 * - Smooth interpolation using cubic hermite splines
 * - Performance-aware LOD system for different devices
 * - Color theory-based palettes for professional aesthetics
 * - Temporal coherence for smooth animations
 */

// Advanced noise functions for improved visual quality
export const NoiseLibrary = `
  // Improved Simplex-style noise with better distribution
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Improved Perlin noise with temporal coherence
  float improvedNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // Smooth interpolation (cubic hermite)
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
  }

  // Optimized fractal Brownian motion with LOD support
  float optimizedFBM(vec3 p, int octaves, float persistence, float lacunarity) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      
      value += amplitude * improvedNoise(p * frequency);
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    
    return value;
  }

  // Curl noise for fluid-like motion
  vec3 curlNoise(vec3 p, float time, float scale) {
    float eps = 0.1;
    float n1 = optimizedFBM(p + vec3(eps, 0, 0) + time * 0.1, 4, 0.5, 2.0);
    float n2 = optimizedFBM(p + vec3(-eps, 0, 0) + time * 0.1, 4, 0.5, 2.0);
    float n3 = optimizedFBM(p + vec3(0, eps, 0) + time * 0.1, 4, 0.5, 2.0);
    float n4 = optimizedFBM(p + vec3(0, -eps, 0) + time * 0.1, 4, 0.5, 2.0);
    float n5 = optimizedFBM(p + vec3(0, 0, eps) + time * 0.1, 4, 0.5, 2.0);
    float n6 = optimizedFBM(p + vec3(0, 0, -eps) + time * 0.1, 4, 0.5, 2.0);
    
    float curlX = (n4 - n3) - (n6 - n5);
    float curlY = (n6 - n5) - (n2 - n1);
    float curlZ = (n2 - n1) - (n4 - n3);
    
    return vec3(curlX, curlY, curlZ) * scale;
  }

  // Smooth easing functions
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  float easeInOutQuart(float t) {
    return t < 0.5 ? 8.0 * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 4.0) / 2.0;
  }

  float easeInOutSine(float t) {
    return -(cos(3.14159 * t) - 1.0) / 2.0;
  }

  // Smooth step variations for better interpolation
  float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  }
`;

// Advanced color theory and professional palettes
export const ColorTheory = `
  // Professional color palettes based on color theory
  vec3 getProfessionalPalette(int paletteIndex, float t) {
    t = clamp(t, 0.0, 1.0);
    
    if (paletteIndex == 0) {
      // Monochromatic blue - subtle and professional
      vec3 base = vec3(0.1, 0.2, 0.4);
      vec3 accent = vec3(0.2, 0.4, 0.7);
      return mix(base, accent, smootherstep(0.0, 1.0, t));
    }
    
    if (paletteIndex == 1) {
      // Analogous blue-green - calming and harmonious
      vec3 base = vec3(0.05, 0.15, 0.25);
      vec3 mid = vec3(0.1, 0.3, 0.4);
      vec3 accent = vec3(0.2, 0.5, 0.6);
      
      if (t < 0.5) {
        return mix(base, mid, t * 2.0);
      } else {
        return mix(mid, accent, (t - 0.5) * 2.0);
      }
    }
    
    if (paletteIndex == 2) {
      // Triadic - professional with subtle contrast
      vec3 primary = vec3(0.1, 0.2, 0.35);
      vec3 secondary = vec3(0.25, 0.15, 0.3);
      vec3 tertiary = vec3(0.2, 0.25, 0.15);
      
      float segment = t * 3.0;
      if (segment < 1.0) {
        return mix(primary, secondary, segment);
      } else if (segment < 2.0) {
        return mix(secondary, tertiary, segment - 1.0);
      } else {
        return mix(tertiary, primary, segment - 2.0);
      }
    }
    
    if (paletteIndex == 3) {
      // Warm professional - subtle warmth
      vec3 base = vec3(0.2, 0.15, 0.1);
      vec3 mid = vec3(0.3, 0.25, 0.15);
      vec3 accent = vec3(0.4, 0.3, 0.2);
      
      if (t < 0.5) {
        return mix(base, mid, easeInOutSine(t * 2.0));
      } else {
        return mix(mid, accent, easeInOutSine((t - 0.5) * 2.0));
      }
    }
    
    // Default: Cool professional
    return mix(vec3(0.08, 0.12, 0.2), vec3(0.15, 0.25, 0.4), t);
  }

  // Advanced color grading for professional look
  vec3 colorGrade(vec3 color, float contrast, float brightness, float saturation) {
    // Adjust brightness
    color += brightness;
    
    // Adjust contrast
    color = (color - 0.5) * contrast + 0.5;
    
    // Adjust saturation
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, saturation);
    
    return clamp(color, 0.0, 1.0);
  }

  // Film-style tone mapping for cinematic look
  vec3 filmicToneMapping(vec3 color) {
    vec3 x = max(vec3(0.0), color - 0.004);
    return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
  }
`;

// Main vertex shader - optimized and responsive
export const ImprovedBackgroundVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vDepth;
  
  uniform float uTime;
  uniform float uAnimationIntensity;
  uniform vec2 uViewportSize;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Calculate world position for depth effects
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Subtle vertex displacement for organic feel
    vec3 pos = position;
    if (uAnimationIntensity > 0.0) {
      float displacement = sin(pos.x * 2.0 + uTime * 0.5) * 
                          cos(pos.y * 1.5 + uTime * 0.3) * 
                          uAnimationIntensity * 0.02;
      pos.z += displacement;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPosition.z;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Main fragment shader with professional algorithms
export const ImprovedBackgroundFragmentShader = `
  ${NoiseLibrary}
  ${ColorTheory}
  
  uniform float uTime;
  uniform vec2 uViewportSize;
  uniform float uPixelRatio;
  
  // Animation parameters
  uniform float uAnimationSpeed;
  uniform float uAnimationIntensity;
  uniform float uFlowSpeed;
  
  // Visual parameters
  uniform int uPaletteIndex;
  uniform float uContrast;
  uniform float uBrightness;
  uniform float uSaturation;
  uniform float uOpacity;
  
  // Performance parameters
  uniform int uQualityLevel; // 0: low, 1: medium, 2: high, 3: ultra
  uniform bool uEnableComplexEffects;
  uniform float uLodBias;
  
  // Responsive parameters
  uniform vec2 uScreenSize;
  uniform float uDevicePixelRatio;
  uniform bool uIsMobile;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vDepth;
  
  // Main background pattern generation
  vec3 generateBackgroundPattern(vec2 uv, float time) {
    // Adjust complexity based on quality level
    int octaves = uQualityLevel + 2; // 2-5 octaves
    float persistence = 0.4 + float(uQualityLevel) * 0.1;
    float lacunarity = 1.8 + float(uQualityLevel) * 0.1;
    
    // Base coordinates with subtle animation
    vec2 coords = uv + time * uFlowSpeed * 0.02;
    vec3 pos3D = vec3(coords * 2.0, time * uAnimationSpeed * 0.1);
    
    // Primary flow pattern
    float flow1 = optimizedFBM(pos3D * 0.8, octaves, persistence, lacunarity);
    
    // Secondary detail layer (only for medium+ quality)
    float flow2 = 0.0;
    if (uQualityLevel >= 1) {
      flow2 = optimizedFBM(pos3D * 1.5 + vec3(100.0), octaves - 1, persistence * 0.8, lacunarity);
    }
    
    // Tertiary detail layer (only for high+ quality)
    float flow3 = 0.0;
    if (uQualityLevel >= 2) {
      flow3 = optimizedFBM(pos3D * 2.3 + vec3(200.0), octaves - 2, persistence * 0.6, lacunarity);
    }
    
    // Complex curl noise (only for ultra quality)
    vec3 curlFlow = vec3(0.0);
    if (uQualityLevel >= 3 && uEnableComplexEffects) {
      curlFlow = curlNoise(pos3D * 0.5, time * uAnimationSpeed, 0.3);
    }
    
    // Combine patterns with smooth blending
    float pattern = flow1 * 0.6 + flow2 * 0.3 + flow3 * 0.1;
    pattern += length(curlFlow) * 0.2;
    
    // Temporal smoothing for consistency
    pattern = easeInOutSine(clamp(pattern + 0.5, 0.0, 1.0));
    
    return getProfessionalPalette(uPaletteIndex, pattern);
  }
  
  // Depth-based effects
  vec3 applyDepthEffects(vec3 color, float depth, vec2 screenPos) {
    // Depth-based fading for atmospheric perspective
    float depthFactor = 1.0 - clamp(depth * 0.05, 0.0, 0.8);
    
    // Vignette effect (subtle)
    vec2 vignetteUV = screenPos - 0.5;
    float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3;
    
    return color * depthFactor * vignette;
  }
  
  // Mobile-optimized rendering path
  vec3 mobileOptimizedRender(vec2 uv, float time) {
    // Simplified pattern for mobile devices
    vec2 coords = uv + time * uFlowSpeed * 0.01;
    float pattern = improvedNoise(vec3(coords * 1.5, time * 0.05));
    pattern = smootherstep(0.0, 1.0, pattern + 0.5);
    
    return getProfessionalPalette(uPaletteIndex, pattern);
  }
  
  void main() {
    vec2 screenUV = gl_FragCoord.xy / uScreenSize;
    
    vec3 finalColor;
    
    // Use optimized path for mobile devices
    if (uIsMobile || uQualityLevel == 0) {
      finalColor = mobileOptimizedRender(vUv, uTime);
    } else {
      finalColor = generateBackgroundPattern(vUv, uTime);
      finalColor = applyDepthEffects(finalColor, vDepth, screenUV);
    }
    
    // Apply professional color grading
    finalColor = colorGrade(finalColor, uContrast, uBrightness, uSaturation);
    
    // Apply cinematic tone mapping for professional look
    finalColor = filmicToneMapping(finalColor);
    
    // Ensure subtle appearance - never too bright or saturated
    finalColor *= 0.7; // Keep background subtle
    finalColor = clamp(finalColor, 0.0, 0.9); // Prevent overly bright areas
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

// Default uniforms with professional parameter ranges
export const ImprovedBackgroundUniforms = {
  // Time and animation
  uTime: { value: 0 },
  uAnimationSpeed: { value: 0.3 }, // Reduced from 1.0 for subtlety
  uAnimationIntensity: { value: 0.4 }, // Reduced from 1.0
  uFlowSpeed: { value: 0.2 }, // Reduced from 1.0
  
  // Visual parameters with professional ranges
  uPaletteIndex: { value: 0 }, // 0-3 for different palettes
  uContrast: { value: 1.1 }, // Slightly enhanced contrast
  uBrightness: { value: 0.0 }, // Neutral brightness
  uSaturation: { value: 0.8 }, // Reduced saturation for professionalism
  uOpacity: { value: 0.6 }, // Reduced from 0.9 for subtlety
  
  // Performance parameters
  uQualityLevel: { value: 2 }, // Auto-detected based on device
  uEnableComplexEffects: { value: true },
  uLodBias: { value: 0.0 },
  
  // Responsive parameters
  uViewportSize: { 
    value: typeof window !== 'undefined' 
      ? [window.innerWidth, window.innerHeight] 
      : [1920, 1080] 
  },
  uScreenSize: { 
    value: typeof window !== 'undefined' 
      ? [window.innerWidth, window.innerHeight] 
      : [1920, 1080] 
  },
  uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1 },
  uDevicePixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1 },
  uIsMobile: { value: typeof window !== 'undefined' ? window.innerWidth < 768 : false },
};

// Professional preset configurations
export const ProfessionalPresets = {
  subtle: {
    uAnimationSpeed: 0.2,
    uAnimationIntensity: 0.3,
    uFlowSpeed: 0.1,
    uContrast: 1.05,
    uBrightness: -0.1,
    uSaturation: 0.7,
    uOpacity: 0.5,
    uPaletteIndex: 0
  },
  
  elegant: {
    uAnimationSpeed: 0.3,
    uAnimationIntensity: 0.4,
    uFlowSpeed: 0.15,
    uContrast: 1.1,
    uBrightness: 0.0,
    uSaturation: 0.8,
    uOpacity: 0.6,
    uPaletteIndex: 1
  },
  
  modern: {
    uAnimationSpeed: 0.4,
    uAnimationIntensity: 0.5,
    uFlowSpeed: 0.2,
    uContrast: 1.15,
    uBrightness: 0.05,
    uSaturation: 0.85,
    uOpacity: 0.7,
    uPaletteIndex: 2
  },
  
  warm: {
    uAnimationSpeed: 0.25,
    uAnimationIntensity: 0.35,
    uFlowSpeed: 0.12,
    uContrast: 1.08,
    uBrightness: 0.02,
    uSaturation: 0.9,
    uOpacity: 0.65,
    uPaletteIndex: 3
  }
} as const;

// Quality level configurations for different devices
export const QualityConfigs = {
  low: {
    uQualityLevel: 0,
    uEnableComplexEffects: false,
    uLodBias: 1.0,
  },
  
  medium: {
    uQualityLevel: 1,
    uEnableComplexEffects: false,
    uLodBias: 0.5,
  },
  
  high: {
    uQualityLevel: 2,
    uEnableComplexEffects: true,
    uLodBias: 0.0,
  },
  
  ultra: {
    uQualityLevel: 3,
    uEnableComplexEffects: true,
    uLodBias: -0.5,
  }
} as const;