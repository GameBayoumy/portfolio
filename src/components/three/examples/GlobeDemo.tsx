'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { InteractiveGlobe } from '../visualizers/InteractiveGlobe';
import * as THREE from 'three';

export const GlobeDemo: React.FC = () => {
  const [clickedPoint, setClickedPoint] = useState<THREE.Vector3 | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<THREE.Vector3 | null>(null);
  
  const handleGlobeClick = (point: THREE.Vector3) => {
    setClickedPoint(point);
    console.log('Globe clicked at:', point);
  };
  
  const handleGlobeHover = (point: THREE.Vector3 | null) => {
    setHoveredPoint(point);
  };
  
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <InteractiveGlobe
            radius={1.2}
            autoRotate={true}
            rotationSpeed={0.005}
            enableControls={true}
            textureType="both"
            enableGlow={true}
            enableParticles={true}
            enableAtmosphere={true}
            performanceMode="high"
            onGlobeClick={handleGlobeClick}
            onGlobeHover={handleGlobeHover}
          />
        </Suspense>
      </Canvas>
      
      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold mb-2">Interactive Globe Demo</h3>
        <div className="text-sm space-y-1">
          <div>• Mouse to rotate and zoom</div>
          <div>• Click on globe surface</div>
          <div>• Watch the Earth rotate</div>
          {hoveredPoint && (
            <div className="text-cyan-400">
              Hovering: ({hoveredPoint.x.toFixed(2)}, {hoveredPoint.y.toFixed(2)}, {hoveredPoint.z.toFixed(2)})
            </div>
          )}
          {clickedPoint && (
            <div className="text-red-400">
              Clicked: ({clickedPoint.x.toFixed(2)}, {clickedPoint.y.toFixed(2)}, {clickedPoint.z.toFixed(2)})
            </div>
          )}
        </div>
      </div>
      
      {/* Controls panel */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-sm font-bold mb-2">Features</h3>
        <div className="text-xs space-y-1">
          <div>✅ Earth texture mapping</div>
          <div>✅ Wireframe overlay</div>
          <div>✅ Atmosphere glow</div>
          <div>✅ Space particles</div>
          <div>✅ Interactive controls</div>
          <div>✅ Click detection</div>
          <div>✅ Hover effects</div>
          <div>✅ Performance optimized</div>
        </div>
      </div>
    </div>
  );
};