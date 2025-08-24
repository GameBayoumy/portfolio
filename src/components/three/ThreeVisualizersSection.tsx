'use client';

import React, { Suspense, useState, useEffect, useRef, memo, ErrorBoundary } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats, Preload } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { performanceUtils, deviceUtils } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { Scene3DProps } from '@/types';

// Import visualizer components
import { ParticleField } from './particle-field';
import { MathematicalShapes } from './mathematical-shapes';
import { VRHeadsetModel } from './vr-headset-model';
import ThreeDBackground from './three-d-background';

// Types and interfaces
interface VisualizerConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  category: 'particles' | 'geometry' | 'models' | 'effects';
  complexity: 'low' | 'medium' | 'high';
  requiredFeatures: string[];
  thumbnail: string;
  demoProps: Record<string, any>;
}

interface ThreeVisualizersSectionProps {
  className?: string;
  showStats?: boolean;
  enableNavigation?: boolean;
  autoRotateCamera?: boolean;
  maxConcurrentVisualizers?: number;
  performanceMode?: 'low' | 'medium' | 'high' | 'auto';
}

interface VisualizerCardProps {
  config: VisualizerConfig;
  isActive: boolean;
  onActivate: (id: string) => void;
  performance: PerformanceMetrics;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  triangles: number;
  drawCalls: number;
}

// Error boundary component for individual visualizers
class VisualizerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Visualizer error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700">
            <div className="text-red-400 text-2xl mb-2">⚠️</div>
            <div className="text-gray-300 text-lg font-medium">Visualizer Error</div>
            <div className="text-gray-500 text-sm mt-1">Failed to load 3D component</div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const VisualizerLoader = memo(({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin-slow"></div>
    </div>
    <div className="mt-4 text-gray-300 font-medium">Loading {name}</div>
    <div className="text-gray-500 text-sm mt-1">Initializing 3D environment...</div>
  </div>
));

// Performance monitor component
const PerformanceMonitor = memo(({ onMetricsUpdate }: { onMetricsUpdate: (metrics: PerformanceMetrics) => void }) => {
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    triangles: 0,
    drawCalls: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Mock performance metrics - in real app, these would come from Three.js renderer
      const metrics = {
        fps: Math.round(60 + (Math.random() - 0.5) * 10),
        memoryUsage: Math.round(50 + Math.random() * 30),
        renderTime: Math.round(16 + (Math.random() - 0.5) * 4),
        triangles: Math.round(5000 + Math.random() * 2000),
        drawCalls: Math.round(10 + Math.random() * 5),
      };
      
      metricsRef.current = metrics;
      onMetricsUpdate(metrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [onMetricsUpdate]);

  return null;
});

// Visualizer card component
const VisualizerCard = memo(({ config, isActive, onActivate, performance }: VisualizerCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleActivate = () => {
    setIsLoading(true);
    onActivate(config.id);
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 1000);
  };

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <motion.div
      className={`relative group cursor-pointer rounded-lg border transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleActivate}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{config.name}</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            config.complexity === 'high' ? 'bg-red-500/20 text-red-400' :
            config.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {config.complexity}
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-3">{config.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{config.category}</span>
          {isActive && (
            <div className="flex gap-2">
              <span>{performance.fps}fps</span>
              <span>{performance.memoryUsage}mb</span>
            </div>
          )}
        </div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-700"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">Triangles: <span className="text-white">{performance.triangles}</span></div>
              <div className="text-gray-400">Draw Calls: <span className="text-white">{performance.drawCalls}</span></div>
              <div className="text-gray-400">Render Time: <span className="text-white">{performance.renderTime}ms</span></div>
              <div className="text-gray-400">Memory: <span className="text-white">{performance.memoryUsage}mb</span></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2 mx-auto"></div>
              <div className="text-sm text-gray-300">Loading...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Main component
const ThreeVisualizersSection = memo(function ThreeVisualizersSection({
  className,
  showStats = false,
  enableNavigation = true,
  autoRotateCamera = true,
  maxConcurrentVisualizers = 1,
  performanceMode = 'auto',
}: ThreeVisualizersSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [activeVisualizers, setActiveVisualizers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    triangles: 0,
    drawCalls: 0,
  });
  const [qualitySettings, setQualitySettings] = useState({
    pixelRatio: 1,
    antialias: false,
    shadows: false,
    postprocessing: false,
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  // Visualizer configurations
  const visualizerConfigs: VisualizerConfig[] = [
    {
      id: 'particle-field',
      name: 'Particle Field',
      description: 'Dynamic particle system with fluid animations',
      component: ParticleField,
      category: 'particles',
      complexity: 'medium',
      requiredFeatures: ['webgl'],
      thumbnail: '/thumbnails/particles.jpg',
      demoProps: { count: 200, speed: 0.02, color: '#00f0ff' },
    },
    {
      id: 'mathematical-shapes',
      name: 'Mathematical Shapes',
      description: 'Geometric forms with mathematical precision',
      component: MathematicalShapes,
      category: 'geometry',
      complexity: 'high',
      requiredFeatures: ['webgl', 'float-textures'],
      thumbnail: '/thumbnails/geometry.jpg',
      demoProps: { complexity: 'medium', animationSpeed: 1 },
    },
    {
      id: 'vr-headset',
      name: 'VR Headset Model',
      description: 'Interactive 3D model with animations',
      component: VRHeadsetModel,
      category: 'models',
      complexity: 'medium',
      requiredFeatures: ['webgl'],
      thumbnail: '/thumbnails/vr-headset.jpg',
      demoProps: { interactive: true, animationSpeed: 1 },
    },
    {
      id: 'background-scene',
      name: '3D Background',
      description: 'Immersive background environment',
      component: ThreeDBackground,
      category: 'effects',
      complexity: 'low',
      requiredFeatures: ['webgl'],
      thumbnail: '/thumbnails/background.jpg',
      demoProps: { enablePostProcessing: false },
    },
  ];

  const categories = ['all', 'particles', 'geometry', 'models', 'effects'];

  // Filter visualizers by category
  const filteredVisualizers = visualizerConfigs.filter(
    config => selectedCategory === 'all' || config.category === selectedCategory
  );

  // Initialize component
  useEffect(() => {
    setMounted(true);
    
    // Detect performance and adjust settings
    const tier = performanceMode === 'auto' ? performanceUtils.getPerformanceTier() : performanceMode;
    const validTier = tier === 'ultra' ? 'high' : tier;
    const settings = performanceUtils.getQualitySettings(validTier as 'low' | 'medium' | 'high');
    
    setQualitySettings(settings);

    // Auto-activate first visualizer if none are active
    if (activeVisualizers.length === 0) {
      setActiveVisualizers([visualizerConfigs[0].id]);
    }
  }, [performanceMode]);

  // Handle visualizer activation
  const handleVisualizerActivate = (id: string) => {
    setActiveVisualizers(prev => {
      if (prev.includes(id)) return prev;
      
      if (prev.length >= maxConcurrentVisualizers) {
        return [id]; // Replace with new one
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle performance metrics update
  const handleMetricsUpdate = (metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);
  };

  if (!mounted || !deviceUtils.hasWebGL()) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-4xl text-gray-400 mb-4">🚫</div>
            <div className="text-xl text-gray-300 mb-2">WebGL Not Supported</div>
            <div className="text-gray-500">Your browser doesn't support 3D graphics</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className={`w-full py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            3D Visualizers Showcase
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore interactive 3D visualizations powered by Three.js and React Three Fiber
          </motion.p>
        </div>

        {/* Category Filter */}
        {enableNavigation && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {/* Performance Stats */}
        {showStats && (
          <motion.div
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{performanceMetrics.fps}</div>
                <div className="text-sm text-gray-400">FPS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{performanceMetrics.memoryUsage}mb</div>
                <div className="text-sm text-gray-400">Memory</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{performanceMetrics.renderTime}ms</div>
                <div className="text-sm text-gray-400">Render Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{performanceMetrics.triangles}</div>
                <div className="text-sm text-gray-400">Triangles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{performanceMetrics.drawCalls}</div>
                <div className="text-sm text-gray-400">Draw Calls</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visualizers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, x: isIntersecting ? 0 : -20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">Available Visualizers</h3>
            {filteredVisualizers.map((config) => (
              <VisualizerCard
                key={config.id}
                config={config}
                isActive={activeVisualizers.includes(config.id)}
                onActivate={handleVisualizerActivate}
                performance={performanceMetrics}
              />
            ))}
          </motion.div>

          {/* 3D Canvas */}
          <motion.div
            className="relative h-[600px] rounded-lg border border-gray-700 overflow-hidden bg-black"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, x: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <VisualizerErrorBoundary>
              <Suspense fallback={<VisualizerLoader name="3D Scene" />}>
                <Canvas
                  camera={{ position: [0, 0, 10], fov: 45 }}
                  gl={{
                    antialias: qualitySettings.antialias,
                    powerPreference: 'high-performance',
                    alpha: false,
                  }}
                  dpr={qualitySettings.pixelRatio}
                  onCreated={({ gl }) => {
                    gl.setClearColor('#000000');
                  }}
                >
                  <Preload all />
                  <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                  
                  {/* Lighting */}
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <pointLight position={[-10, -10, -5]} color="#ff006e" intensity={0.3} />
                  
                  {/* Controls */}
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={autoRotateCamera}
                    autoRotateSpeed={0.5}
                    minDistance={5}
                    maxDistance={50}
                  />
                  
                  {/* Active Visualizers */}
                  {activeVisualizers.map((id) => {
                    const config = visualizerConfigs.find(c => c.id === id);
                    if (!config) return null;
                    
                    const Component = config.component;
                    return (
                      <Suspense key={id} fallback={null}>
                        <Component {...config.demoProps} />
                      </Suspense>
                    );
                  })}
                  
                  {/* Stats */}
                  {showStats && <Stats />}
                </Canvas>
              </Suspense>
            </VisualizerErrorBoundary>

            {/* Performance Monitor */}
            <PerformanceMonitor onMetricsUpdate={handleMetricsUpdate} />

            {/* Canvas Overlay Info */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded px-3 py-1 text-sm text-white">
                Active: {activeVisualizers.length} | Category: {selectedCategory}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-12 text-center text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p>Click on visualizers to activate them • Use mouse to navigate the 3D scene</p>
          <p className="text-sm mt-2">Performance automatically adjusts based on your device capabilities</p>
        </motion.div>
      </div>
    </section>
  );
});

export default ThreeVisualizersSection;