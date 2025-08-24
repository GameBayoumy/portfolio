/**
 * Artistic 3D Background Shader
 * Features: Aurora effects, fractal noise, fluid dynamics
 * Optimized for portfolio backgrounds
 */

export const ArtisticBackgroundVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ArtisticBackgroundFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uSpeed;
  uniform float uComplexity;
  uniform float uWaveAmplitude;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Perlin noise implementation
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  // Fractal Brownian Motion
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  // Aurora effect
  vec3 aurora(vec2 uv, float time) {
    vec3 pos = vec3(uv * 2.0 - 1.0, time * uSpeed * 0.1);
    
    // Multiple layers of noise for complexity
    float noise1 = fbm(pos * uComplexity);
    float noise2 = fbm(pos * uComplexity * 1.5 + vec3(1000.0));
    float noise3 = fbm(pos * uComplexity * 0.5 + vec3(2000.0));
    
    // Combine noises for aurora bands
    float aurora1 = smoothstep(0.0, 1.0, noise1 + 0.5);
    float aurora2 = smoothstep(0.2, 0.8, noise2 + 0.3);
    float aurora3 = smoothstep(0.1, 0.9, noise3 + 0.4);
    
    // Color mixing for aurora effect
    vec3 color1 = uColorA * aurora1;
    vec3 color2 = uColorB * aurora2;
    vec3 color3 = uColorC * aurora3;
    
    return (color1 + color2 + color3) * uIntensity;
  }
  
  // Fluid wave effect
  vec3 fluidWaves(vec2 uv, float time) {
    vec2 p = uv * 3.0;
    vec2 q = vec2(
      fbm(vec3(p, time * uSpeed * 0.05)),
      fbm(vec3(p + vec2(1.7, 4.6), time * uSpeed * 0.05))
    );
    
    vec2 r = vec2(
      fbm(vec3(p + 4.0 * q + vec2(0.7, 2.3), time * uSpeed * 0.03)),
      fbm(vec3(p + 4.0 * q + vec2(8.3, 2.8), time * uSpeed * 0.03))
    );
    
    float f = fbm(vec3(p + 4.0 * r, time * uSpeed * 0.02));
    
    vec3 color = mix(
      uColorA,
      uColorB,
      clamp((f * f) * 4.0, 0.0, 1.0)
    );
    
    color = mix(
      color,
      uColorC,
      clamp(length(q), 0.0, 1.0)
    );
    
    color = mix(
      color,
      vec3(0.2, 0.5, 0.8),
      clamp(length(r.x), 0.0, 1.0)
    );
    
    return color * uIntensity;
  }
  
  // Geometric patterns
  float geometric(vec2 uv, float time) {
    vec2 p = uv * 8.0;
    p += vec2(sin(time * uSpeed), cos(time * uSpeed * 0.7)) * 0.5;
    
    float pattern = 0.0;
    pattern += sin(p.x) * cos(p.y);
    pattern += sin(p.x * 2.0 + time * uSpeed) * 0.5;
    pattern += cos(p.y * 3.0 + time * uSpeed * 1.5) * 0.3;
    
    return pattern * 0.1;
  }
  
  void main() {
    vec2 uv = vUv;
    float time = uTime;
    
    // Create multiple layers of effects
    vec3 auroraColor = aurora(uv, time);
    vec3 fluidColor = fluidWaves(uv, time);
    float geometricPattern = geometric(uv, time);
    
    // Combine effects with different weights
    vec3 finalColor = auroraColor * 0.6 + fluidColor * 0.4;
    finalColor += geometricPattern;
    
    // Add subtle wave distortion based on position
    float wave = sin(vPosition.x * 2.0 + time * uSpeed) * 
                 cos(vPosition.y * 3.0 + time * uSpeed * 0.7) * 
                 uWaveAmplitude;
    
    finalColor += wave * 0.1;
    
    // Depth-based fog effect
    float depth = length(vPosition);
    float fog = 1.0 - exp(-depth * 0.1);
    finalColor = mix(finalColor, vec3(0.05, 0.1, 0.2), fog * 0.3);
    
    // Enhance contrast and saturation
    finalColor = pow(finalColor, vec3(0.8));
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 0.9);
  }
`;

export const ArtisticBackgroundUniforms = {
  uTime: { value: 0 },
  uResolution: { value: [window.innerWidth, window.innerHeight] },
  uIntensity: { value: 1.0 },
  uColorA: { value: [0.2, 0.4, 0.8] },  // Deep blue
  uColorB: { value: [0.8, 0.2, 0.6] },  // Purple
  uColorC: { value: [0.1, 0.8, 0.4] },  // Green
  uSpeed: { value: 1.0 },
  uComplexity: { value: 2.0 },
  uWaveAmplitude: { value: 0.1 }
};