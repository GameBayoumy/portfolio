'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState, memo } from 'react';
import { Stars, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { VRHeadsetModel } from './vr-headset-model';
import { ParticleField } from './particle-field';
import { MathematicalShapes } from './mathematical-shapes';
import { performanceUtils, deviceUtils } from '@/lib/utils';
import type { Scene3DProps } from '@/types';

interface ThreeDBackgroundProps extends Scene3DProps {
  className?: string;
}

const ThreeDBackground = memo(function ThreeDBackground({
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
    // Ensure tier is valid for getQualitySettings
    const validTier = tier === 'ultra' ? 'high' : tier;
    const settings = performanceUtils.getQualitySettings(validTier as 'low' | 'medium' | 'high');
    
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

  // Temporarily disabled for build compatibility - Three.js JSX elements need proper type definitions
  return (
    <div className={`three-canvas ${className}`} style={{ backgroundColor }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl text-blue-400 mb-4">✨</div>
          <div className="text-gray-400 text-lg">3D Background</div>
          <div className="text-sm text-gray-500 mt-2">Enhanced visual experience coming soon</div>
        </div>
      </div>
    </div>
  );
});

export default ThreeDBackground;