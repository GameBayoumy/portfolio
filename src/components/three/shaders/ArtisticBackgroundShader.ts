/**
 * Artistic 3D Background Shader
 * Features: Aurora effects, fractal noise, fluid dynamics
 * Optimized for portfolio backgrounds
 */

export const ArtisticBackgroundVertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vTex;
  varying vec2 vUv; // vertex also outputs, keep names aligned
  varying vec2 vUv; // keep for compatibility with older fragment code

  void main() {
    vTex = uv;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ArtisticBackgroundFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uSpeed;
  uniform float uIntensity;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;

  uniform vec3 uLightDirection;
  uniform vec3 uLightColor;
  uniform float uAmbientStrength;
  uniform float uSpecularStrength;
  uniform float uShininess;
  uniform float uGlowIntensity;
  uniform float uContrastBoost;
  uniform float uSaturationBoost;
  uniform float uBrightnessBoost;

  varying vec2 vTex;

  // Helpers
  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  // Smooth, cheap silky wave height
  float waveHeight(vec2 p, float t) {
    // mild domain warp
    p += 0.05 * vec2(sin(p.y*1.2 + t*0.25), cos(p.x*1.1 - t*0.2));

    float h = 0.0;
    // three rotated bands with different frequencies/angles
    vec2 p0 = rot(0.35) * p;
    h += sin(p0.x * 1.2 + t * 0.40) * 0.35;

    vec2 p1 = rot(-0.55) * (p + vec2(0.0, 0.1*sin(t*0.15)));
    h += sin(p1.x * 1.8 + t * 0.55) * 0.28;

    vec2 p2 = rot(0.10) * (p + vec2(0.0, 0.08*cos(t*0.22)));
    h += sin(p2.x * 2.4 + t * 0.35) * 0.18;

    return h;
  }

  vec2 gradHeight(vec2 p, float t){
    // central differences
    const float e = 0.0015;
    float hx = waveHeight(p + vec2(e,0.0), t) - waveHeight(p - vec2(e,0.0), t);
    float hy = waveHeight(p + vec2(0.0,e), t) - waveHeight(p - vec2(0.0,e), t);
    return vec2(hx, hy) / (2.0*e);
  }

  void main() {
    // Normalized, aspect-corrected coordinates centered at 0
    vec2 uv = vTex; // same as vUv
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    p.x *= aspect;

    float t = uTime * (0.35 + uSpeed * 0.65);

    // Height field and shading
    float h = waveHeight(p, t);
    vec2 g = gradHeight(p, t);
    vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 L = normalize(uLightDirection);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    float diff = clamp(dot(N, L), 0.0, 1.0);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), max(uShininess, 1.0)) * uSpecularStrength;
    float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.0) * 0.5 * uGlowIntensity;

    // Neon gradient driven by height + gentle cross fade
    float k1 = smoothstep(-0.6, 0.9, h);
    float k2 = 0.5 + 0.5 * sin((p.y - p.x*0.25) * 0.9 - t * 0.12);
    vec3 grad1 = mix(uColorA, uColorB, k1);
    vec3 grad2 = mix(uColorC, uColorD, k2);
    vec3 base = mix(grad1, grad2, 0.45);

    // Lighting
    vec3 color = base * (uAmbientStrength + diff) + uLightColor * spec;
    color += base * rim * 0.6;

    // Gentle glow on crests
    float slope = length(g);
    float crest = smoothstep(0.25, 0.05, slope);
    color += mix(uColorB, uColorC, 0.5) * crest * uGlowIntensity * 0.35;

    // Post: contrast/saturation/brightness
    color = clamp(color, 0.0, 2.0);
    // simple contrast curve
    color = pow(color, vec3(1.0 / max(uContrastBoost, 0.001)));
    // saturation
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(lum), color, uSaturationBoost);
    // brightness
    color *= uBrightnessBoost * uIntensity;

    // Tone map + vignetting
    color = color / (color + 1.0);
    vec2 v = p;
    float vig = smoothstep(1.4, 0.2, dot(v,v));
    color *= mix(0.9, 1.1, vig);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 0.96);
  }
`;

export const ArtisticBackgroundUniforms = {
  uTime: { value: 0 },
  uResolution: { 
    value: typeof window !== 'undefined' 
      ? [window.innerWidth, window.innerHeight] 
      : [1920, 1080] 
  },
  uIntensity: { value: 1.0 },
  // Portfolio neon palette (teal, purple, pink, cyan)
  uColorA: { value: [0.00, 0.94, 1.00] },
  uColorB: { value: [0.50, 0.00, 1.00] },
  uColorC: { value: [1.00, 0.00, 0.50] },
  uColorD: { value: [0.00, 0.80, 0.90] },
  uSpeed: { value: 0.35 },
  // Unused by the simplified shader but kept for API compatibility
  uComplexity: { value: 1.0 },
  uWaveAmplitude: { value: 0.0 },
  uDistortionStrength: { value: 0.0 },
  uElevation: { value: 0.0 },
  uGlowIntensity: { value: 0.9 },
  uContrastBoost: { value: 1.1 },
  uSaturationBoost: { value: 1.15 },
  uBrightnessBoost: { value: 1.05 },
  uLightDirection: { value: [-0.3, 0.5, 0.8] },
  uLightColor: { value: [1.0, 0.98, 0.95] },
  uAmbientStrength: { value: 0.22 },
  uSpecularStrength: { value: 0.9 },
  uShininess: { value: 64.0 },
  uFresnelStrength: { value: 1.2 },
  uDepthFade: { value: 0.0 },
  uEdgeGlow: { value: 1.0 },
  uHolographicEffect: { value: 0.0 }
};
