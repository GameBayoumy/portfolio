'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { Stars, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { VRHeadsetModel } from './vr-headset-model';
import { ParticleField } from './particle-field';
import { MathematicalShapes } from './mathematical-shapes';
import { performanceUtils, deviceUtils } from '@/lib/utils';
import type { Scene3DProps } from '@/types';

interface ThreeDBackgroundProps extends Scene3DProps {
  className?: string;
}

export default function ThreeDBackground({
  performanceMode,
  enablePostProcessing = true,
  enableShadows = true,
  backgroundColor = '#0a0a0a',
  ambientLightIntensity = 0.2,
  directionalLightIntensity = 0.8,
  className,
}: ThreeDBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [qualitySettings, setQualitySettings] = useState({
    pixelRatio: 1,
    antialias: false,
    shadows: false,
    postprocessing: false,
    particleCount: 50,
    maxLights: 2,
  });

  useEffect(() => {
    setMounted(true);
    
    // Detect performance and adjust settings
    const tier = performanceMode || performanceUtils.getPerformanceTier();
    const settings = performanceUtils.getQualitySettings(tier);
    
    setQualitySettings({
      ...settings,
      shadows: enableShadows && settings.shadows,
      postprocessing: enablePostProcessing && settings.postprocessing,
    });
  }, [performanceMode, enableShadows, enablePostProcessing]);

  if (!mounted || !deviceUtils.hasWebGL()) {
    return (
      <div 
        className={`three-canvas no-webgl ${className}`}
        style={{ backgroundColor }}
      />
    );
  }

  return (
    <div className={`three-canvas ${className}`}>
      <Canvas
        gl={{
          powerPreference: 'high-performance',
          alpha: true,
          antialias: qualitySettings.antialias,
          stencil: false,
          depth: true,
        }}
        dpr={qualitySettings.pixelRatio}
        shadows={qualitySettings.shadows}
        camera={{ position: [0, 0, 8], fov: 60 }}
        onCreated={({ gl, scene, camera }) => {
          // Optimize renderer settings
          gl.setClearColor(backgroundColor, 0.8);
          gl.physicallyCorrectLights = true;
          gl.outputEncoding = 3001; // sRGBEncoding
          gl.toneMapping = 0; // NoToneMapping for better performance
          
          // Set initial camera position
          camera.position.set(0, 2, 8);
          camera.lookAt(0, 0, 0);
        }}
      >
        <Suspense fallback={null}>
          {/* Camera Controls */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 8]}
            fov={60}
            near={0.1}
            far={1000}
          />
          
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={deviceUtils.isMobile() ? false : true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            target={[0, 0, 0]}
          />

          {/* Lighting */}
          <ambientLight intensity={ambientLightIntensity} color="#4a90e2" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={directionalLightIntensity}
            color="#ffffff"
            castShadow={qualitySettings.shadows}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.3}
            color="#ff6b9d"
          />

          {/* Background Elements */}
          <Stars
            radius={300}
            depth={50}
            count={2000}
            factor={4}
            saturation={0}
            fade={true}
            speed={0.5}
          />

          {/* Main 3D Elements */}
          <VRHeadsetModel
            position={[0, 0, 0]}
            interactive={true}
            animationSpeed={1}
            glowIntensity={0.5}
          />

          <ParticleField
            count={qualitySettings.particleCount}
            spread={15}
            speed={0.02}
            size={0.05}
            color="#00f0ff"
            opacity={0.6}
          />

          <MathematicalShapes
            complexity={qualitySettings.shadows ? 'high' : 'low'}
            animationSpeed={0.8}
            glowEffect={qualitySettings.postprocessing}
          />

          {/* Performance-based conditional elements */}
          {qualitySettings.maxLights > 4 && (
            <>
              <spotLight
                position={[0, 10, 0]}
                angle={0.3}
                penumbra={1}
                intensity={0.2}
                color="#c77dff"
                castShadow={qualitySettings.shadows}
              />
              <spotLight
                position={[5, 5, 5]}
                angle={0.2}
                penumbra={0.8}
                intensity={0.15}
                color="#7209b7"
              />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}