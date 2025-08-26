/**
 * Artistic 3D Background Shader
 * Features: Aurora effects, fractal noise, fluid dynamics
 * Optimized for portfolio backgrounds
 */

export const ArtisticBackgroundVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveAmplitude;
  uniform float uComplexity;
  uniform vec2 uResolution;
  uniform float uDistortionStrength;
  uniform float uElevation;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vElevation;
  varying float vDistortion;
  varying vec3 vViewDirection;
  varying float vDepth;
  
  // Enhanced 3D Perlin noise for vertex displacement
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
  
  // Multi-octave fractal noise for complex vertex displacement
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }    
    return value;
  }
  
  // Smooth wave function for organic movement
  float smoothWave(float x, float speed, float amplitude) {
    return amplitude * sin(x * 3.14159 * speed) * cos(x * 1.618 * speed * 0.7);
  }
  
  void main() {
    vUv = uv;
    
    // Calculate time-based animation variables
    float time = uTime * uSpeed;
    vec3 pos = position;
    
    // Create complex wave patterns for vertex displacement
    float wave1 = smoothWave(pos.x + time * 0.3, 2.0, uWaveAmplitude);
    float wave2 = smoothWave(pos.y + time * 0.5, 1.5, uWaveAmplitude * 0.8);
    float wave3 = smoothWave(pos.z + time * 0.2, 3.0, uWaveAmplitude * 0.6);
    
    // Apply multi-octave noise for organic distortion
    vec3 noisePos = pos * uComplexity + time * 0.1;
    float distortion1 = fbm(noisePos, 4);
    float distortion2 = fbm(noisePos * 1.5 + vec3(100.0), 3);
    float distortion3 = fbm(noisePos * 0.8 + vec3(200.0), 5);
    
    // Combine wave and noise effects
    float elevation = (wave1 + wave2 + wave3) * 0.3;
    float distortion = (distortion1 + distortion2 * 0.5 + distortion3 * 0.3) * uDistortionStrength;
    
    // Apply elevation and distortion to vertex position
    vec3 displaced = pos;
    displaced += normal * (elevation + distortion * 0.2);
    
    // Add subtle radial expansion based on distance from center
    float centerDistance = length(pos.xy);
    float radialWave = sin(centerDistance * 4.0 - time * 2.0) * 0.05 * uWaveAmplitude;
    displaced += normalize(vec3(pos.x, pos.y, 0.0)) * radialWave;
    
    // Calculate world position for fragment shader
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Calculate view direction for lighting
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    
    // Pass varying values to fragment shader
    vPosition = displaced;
    vNormal = normalize(normalMatrix * normal);
    vElevation = elevation;
    vDistortion = distortion;
    
    // Calculate depth for fog effects
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vDepth = -mvPosition.z;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const ArtisticBackgroundFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  uniform float uSpeed;
  uniform float uComplexity;
  uniform float uWaveAmplitude;
  uniform float uGlowIntensity;
  uniform float uContrastBoost;
  uniform float uSaturationBoost;
  uniform float uBrightnessBoost;
  uniform vec3 uLightDirection;
  uniform vec3 uLightColor;
  uniform float uAmbientStrength;
  uniform float uSpecularStrength;
  uniform float uShininess;
  uniform float uFresnelStrength;
  uniform float uDepthFade;
  uniform float uEdgeGlow;
  uniform float uHolographicEffect;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vElevation;
  varying float vDistortion;
  varying vec3 vViewDirection;
  varying float vDepth;
  
  // Advanced Perlin noise implementation for fragment effects
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
  
  // Enhanced Fractal Brownian Motion with octave control
  float fbm(vec3 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= gain;
      frequency *= lacunarity;
    }
    
    return value;
  }
  
  // Domain warping for organic patterns
  vec3 domainWarp(vec3 p, float time) {
    vec3 q = vec3(
      fbm(p + vec3(0.0, 0.0, 0.0), 4, 2.0, 0.5),
      fbm(p + vec3(5.2, 1.3, 0.0), 4, 2.0, 0.5),
      fbm(p + vec3(0.0, 0.0, 8.4), 4, 2.0, 0.5)
    );
    
    vec3 r = vec3(
      fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.0) + time * 0.15, 3, 2.0, 0.5),
      fbm(p + 4.0 * q + vec3(8.3, 2.8, 0.0) + time * 0.12, 3, 2.0, 0.5),
      fbm(p + 4.0 * q + vec3(0.0, 0.0, 7.8) + time * 0.1, 3, 2.0, 0.5)
    );
    
    return r;
  }
  
  // Enhanced Aurora effect with domain warping
  vec3 enhancedAurora(vec2 uv, float time) {
    vec3 pos = vec3(uv * 2.0 - 1.0, time * uSpeed * 0.08);
    
    // Apply domain warping for organic patterns
    vec3 warped = domainWarp(pos * uComplexity * 0.5, time);
    
    // Multiple layers with different frequencies
    float noise1 = fbm(pos * uComplexity + warped, 6, 2.0, 0.5);
    float noise2 = fbm(pos * uComplexity * 1.3 + warped * 0.7 + vec3(1000.0), 4, 2.2, 0.6);
    float noise3 = fbm(pos * uComplexity * 0.8 + warped * 1.2 + vec3(2000.0), 5, 1.8, 0.4);
    float noise4 = fbm(pos * uComplexity * 2.1 + warped * 0.3 + vec3(3000.0), 3, 2.5, 0.7);
    
    // Create aurora bands with smooth transitions
    float aurora1 = smoothstep(-0.2, 0.8, noise1 + vElevation * 0.5);
    float aurora2 = smoothstep(-0.1, 0.9, noise2 + vDistortion * 0.3);
    float aurora3 = smoothstep(0.0, 1.0, noise3 + sin(time * 0.5) * 0.1);
    float aurora4 = smoothstep(-0.3, 0.7, noise4 + vElevation * vDistortion);
    
    // Advanced color mixing with gradient overlays
    vec3 color1 = mix(uColorA, uColorB, aurora1 * 0.7 + 0.3) * aurora1;
    vec3 color2 = mix(uColorB, uColorC, aurora2 * 0.8 + 0.2) * aurora2;
    vec3 color3 = mix(uColorC, uColorD, aurora3 * 0.6 + 0.4) * aurora3;
    vec3 color4 = mix(uColorA, uColorD, aurora4 * 0.9 + 0.1) * aurora4 * 0.5;
    
    return (color1 + color2 + color3 + color4) * uIntensity;
  }
  
  // Enhanced fluid dynamics with turbulence
  vec3 fluidTurbulence(vec2 uv, float time) {
    vec2 p = uv * 2.5;
    
    // Create fluid distortion vectors
    vec2 q = vec2(
      fbm(vec3(p + vec3(0.0, 0.0, time * uSpeed * 0.04), 5, 2.1, 0.5),
      fbm(vec3(p + vec2(1.7, 4.6) + time * uSpeed * 0.03, 4, 2.3, 0.6)
    );
    
    vec2 r = vec2(
      fbm(vec3(p + 4.0 * q + vec2(0.7, 2.3), time * uSpeed * 0.02), 6, 1.9, 0.4),
      fbm(vec3(p + 4.0 * q + vec2(8.3, 2.8), time * uSpeed * 0.025), 3, 2.4, 0.7)
    );
    
    // Multi-scale turbulence
    float turbulence = fbm(vec3(p + 6.0 * r, time * uSpeed * 0.015), 7, 2.0, 0.5);
    float microTurbulence = fbm(vec3(p * 3.0 + 2.0 * q + r, time * uSpeed * 0.08), 4, 2.5, 0.6);
    
    // Advanced color mixing with turbulence influence
    vec3 baseColor = mix(uColorA, uColorB, clamp((turbulence + 1.0) * 0.5, 0.0, 1.0));
    vec3 accentColor = mix(uColorC, uColorD, clamp(length(q) * 0.8, 0.0, 1.0));
    vec3 detailColor = mix(baseColor, accentColor, clamp(length(r) * 1.2, 0.0, 1.0));
    
    // Apply micro-turbulence for fine detail
    detailColor = mix(detailColor, accentColor * 1.3, clamp(microTurbulence * 0.3, 0.0, 1.0));
    
    return detailColor * uIntensity;
  }
  
  // Advanced holographic patterns
  vec3 holographicPattern(vec2 uv, float time) {
    vec2 p = uv * 6.0;
    p += vec2(sin(time * uSpeed * 0.7), cos(time * uSpeed * 0.5)) * 0.3;
    
    // Create interference patterns
    float interference1 = sin(p.x * 3.14159) * cos(p.y * 3.14159);
    float interference2 = sin(p.x * 6.28318 + time * uSpeed * 2.0) * 0.5;
    float interference3 = cos(p.y * 4.71238 + time * uSpeed * 1.5) * 0.3;
    
    // Moire patterns
    float moire = sin(length(p) * 12.0 - time * uSpeed * 3.0) * cos(atan(p.y, p.x) * 8.0);
    
    // Combine patterns
    float pattern = interference1 + interference2 + interference3 + moire * 0.2;
    pattern = pattern * uHolographicEffect;
    
    return vec3(pattern) * uColorD * 0.3;
  }
  
  // Fresnel effect for edge enhancement
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }
  
  // Advanced lighting model
  vec3 calculateLighting(vec3 normal, vec3 viewDir, vec3 lightDir, vec3 lightColor, vec3 baseColor) {
    // Normalize vectors
    vec3 N = normalize(normal);
    vec3 L = normalize(lightDir);
    vec3 V = normalize(viewDir);
    vec3 H = normalize(L + V);
    
    // Ambient component
    vec3 ambient = uAmbientStrength * baseColor;
    
    // Diffuse component with wrap-around lighting
    float NdotL = dot(N, L);
    float wrapLighting = (NdotL + 1.0) * 0.5;  // Wrap-around lighting
    vec3 diffuse = lightColor * baseColor * wrapLighting;
    
    // Specular component (Blinn-Phong)
    float NdotH = max(dot(N, H), 0.0);
    float specular = pow(NdotH, uShininess) * uSpecularStrength;
    vec3 specularColor = lightColor * specular;
    
    // Fresnel effect for rim lighting
    float fresnelTerm = fresnel(V, N, uFresnelStrength);
    vec3 rimLight = lightColor * fresnelTerm * uEdgeGlow * 0.5;
    
    return ambient + diffuse + specularColor + rimLight;
  }
  
  void main() {
    vec2 uv = vUv;
    float time = uTime;
    
    // Create sophisticated layered effects
    vec3 auroraColor = enhancedAurora(uv, time);
    vec3 fluidColor = fluidTurbulence(uv, time);
    vec3 holographicColor = holographicPattern(uv, time);
    
    // Blend effects with dynamic weighting
    float auroraWeight = 0.5 + sin(time * 0.3) * 0.2;
    float fluidWeight = 0.4 + cos(time * 0.25) * 0.15;
    float holoWeight = 0.2 + sin(time * 0.5) * 0.1;
    
    vec3 combinedColor = auroraColor * auroraWeight + 
                        fluidColor * fluidWeight + 
                        holographicColor * holoWeight;
    
    // Apply advanced lighting
    vec3 lightedColor = calculateLighting(
      vNormal, 
      vViewDirection, 
      uLightDirection, 
      uLightColor, 
      combinedColor
    );
    
    // Depth-based atmospheric effects
    float depth = vDepth * uDepthFade;
    float atmosphericDensity = 1.0 - exp(-depth);
    vec3 atmosphericColor = mix(uColorA * 0.3, uColorB * 0.2, atmosphericDensity);
    
    // Apply atmospheric scattering
    lightedColor = mix(lightedColor, atmosphericColor, atmosphericDensity * 0.4);
    
    // Distance-based glow effects
    float centerDistance = length(vPosition.xy);
    float glowFactor = exp(-centerDistance * 0.5) * uGlowIntensity;
    vec3 glowColor = mix(uColorC, uColorD, glowFactor) * glowFactor * 0.3;
    lightedColor += glowColor;
    
    // Vertex displacement contribution to color
    float elevationInfluence = vElevation * 0.5 + 0.5;
    float distortionInfluence = vDistortion * 0.3 + 0.7;
    lightedColor = mix(lightedColor, lightedColor * 1.2, elevationInfluence * 0.2);
    lightedColor = mix(lightedColor, uColorD * 0.4, distortionInfluence * 0.15);
    
    // Advanced post-processing
    
    // 1. Contrast and saturation enhancement
    lightedColor = pow(lightedColor, vec3(1.0 / 0.85)) * uContrastBoost;
    
    // 2. Saturation boost
    float luminance = dot(lightedColor, vec3(0.299, 0.587, 0.114));
    lightedColor = mix(vec3(luminance), lightedColor, uSaturationBoost);
    
    // 3. Brightness adjustment
    lightedColor *= uBrightnessBoost;
    
    // 4. Color temperature shift based on depth
    vec3 warmColor = lightedColor * vec3(1.1, 1.0, 0.9);
    vec3 coolColor = lightedColor * vec3(0.9, 1.0, 1.1);
    lightedColor = mix(warmColor, coolColor, atmosphericDensity * 0.3);
    
    // 5. Tone mapping (Reinhard)
    lightedColor = lightedColor / (lightedColor + vec3(1.0));
    
    // 6. Gamma correction
    lightedColor = pow(lightedColor, vec3(1.0 / 2.2));
    
    // 7. Subtle vignetting for depth
    vec2 vignetteUV = uv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3;
    vignette = pow(vignette, 0.5);
    lightedColor *= vignette;
    
    // 8. Add subtle film grain for texture
    float grain = fract(sin(dot(uv + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453) * 0.03;
    lightedColor += vec3(grain);
    
    // 9. Edge enhancement based on normal variation
    float edgeDetection = length(fwidth(vNormal)) * uEdgeGlow;
    lightedColor += vec3(edgeDetection) * uColorD * 0.2;
    
    // 10. Dynamic alpha based on intensity and depth
    float alpha = clamp(0.7 + length(lightedColor) * 0.2 - atmosphericDensity * 0.1, 0.4, 0.95);
    
    // Final color clamping
    lightedColor = clamp(lightedColor, 0.0, 1.0);
    
    gl_FragColor = vec4(lightedColor, alpha);
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
  uColorA: { value: [0.2, 0.4, 0.8] },  // Deep blue
  uColorB: { value: [0.8, 0.2, 0.6] },  // Purple
  uColorC: { value: [0.1, 0.8, 0.4] },  // Green
  uColorD: { value: [0.9, 0.5, 0.1] },  // Orange accent
  uSpeed: { value: 1.0 },
  uComplexity: { value: 2.0 },
  uWaveAmplitude: { value: 0.1 },
  uDistortionStrength: { value: 0.15 },
  uElevation: { value: 0.2 },
  uGlowIntensity: { value: 0.7 },
  uContrastBoost: { value: 1.2 },
  uSaturationBoost: { value: 1.1 },
  uBrightnessBoost: { value: 1.05 },
  uLightDirection: { value: [0.5, 0.8, 0.3] },
  uLightColor: { value: [1.0, 0.98, 0.95] },
  uAmbientStrength: { value: 0.3 },
  uSpecularStrength: { value: 0.5 },
  uShininess: { value: 32.0 },
  uFresnelStrength: { value: 1.5 },
  uDepthFade: { value: 0.02 },
  uEdgeGlow: { value: 2.0 },
  uHolographicEffect: { value: 0.3 }
};