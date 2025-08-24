'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { ArtisticBackground, InteractiveArtisticBackground } from '../ArtisticBackground'

export function BackgroundDemo() {
  const [mode, setMode] = React.useState<'static' | 'interactive'>('interactive')
  const [colorScheme, setColorScheme] = React.useState<'aurora' | 'ocean' | 'nebula' | 'sunset'>('aurora')

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={2}
      >
        {mode === 'interactive' ? (
          <InteractiveArtisticBackground />
        ) : (
          <ArtisticBackground
            colorScheme={colorScheme}
            intensity={1.2}
            speed={1.5}
            complexity={2.5}
          />
        )}
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={1}
        />
        
        <Stats />
      </Canvas>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
          <h3 className="font-bold mb-2">3D Background Demo</h3>
          
          <div className="space-y-2">
            <label className="block">
              Mode:
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'static' | 'interactive')}
                className="ml-2 bg-white/20 rounded px-2 py-1"
              >
                <option value="static">Static</option>
                <option value="interactive">Interactive</option>
              </select>
            </label>

            {mode === 'static' && (
              <label className="block">
                Color Scheme:
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as any)}
                  className="ml-2 bg-white/20 rounded px-2 py-1"
                >
                  <option value="aurora">Aurora</option>
                  <option value="ocean">Ocean</option>
                  <option value="nebula">Nebula</option>
                  <option value="sunset">Sunset</option>
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white text-sm">
          <h4 className="font-bold mb-2">Features:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Aurora effects with fractal noise</li>
            <li>• Fluid dynamics simulation</li>
            <li>• Geometric pattern overlays</li>
            <li>• Interactive mouse response</li>
            <li>• Auto color scheme cycling</li>
            <li>• Multi-layer depth effects</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BackgroundDemo