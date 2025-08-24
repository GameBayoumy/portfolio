# 3D Visualizer Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the 3D visualizer architecture in your portfolio project.

## Prerequisites

### Dependencies
Ensure you have the required dependencies installed:

```json
{
  "@react-three/fiber": "^9.3.0",
  "@react-three/drei": "^10.7.4",
  "@react-three/postprocessing": "^3.0.4",
  "@react-spring/three": "^10.0.1",
  "three": "^0.179.1",
  "leva": "^0.9.36"
}
```

### TypeScript Configuration
Update your `tsconfig.json` to include the new type definitions:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "es6"],
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "src/components/three/types/**/*"
  ]
}
```

## Step 1: Set Up the Foundation

### 1.1 Create Directory Structure

```bash
mkdir -p src/components/three/{visualizers,providers,hooks,utils,types,config}
mkdir -p src/components/three/visualizers/{core,geometric,data,interactive,environmental}
```

### 1.2 Install Core Provider

First, wrap your app with the ThreeProvider:

```typescript
// app/layout.tsx or pages/_app.tsx
import { ThreeProvider } from '@/components/three/providers/ThreeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThreeProvider
          initialPerformanceMode="auto"
          adaptiveQuality={true}
          memoryManagement={true}
          errorReporting={true}
        >
          {children}
        </ThreeProvider>
      </body>
    </html>
  );
}
```

### 1.3 Fix TypeScript Issues

Update your existing Three.js components to use the new type definitions:

```typescript
// src/components/three/three-d-background.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ThreeErrorBoundary } from './providers/ErrorBoundary';
import { useThreeCapabilities, usePerformanceSettings } from './providers/ThreeProvider';

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = (props) => {
  const { webglSupported, loading } = useThreeCapabilities();
  const { settings } = usePerformanceSettings();

  if (loading || !webglSupported) {
    return <ThreeDBackgroundFallback />;
  }

  return (
    <ThreeErrorBoundary>
      <Canvas
        dpr={settings.pixelRatio}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: settings.antialias,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          {/* Your existing Three.js content */}
        </Suspense>
      </Canvas>
    </ThreeErrorBoundary>
  );
};
```

## Step 2: Implement Core Components

### 2.1 Create BaseVisualizer Component

```typescript
// src/components/three/visualizers/core/BaseVisualizer.tsx
'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { BaseVisualizerProps, InteractionEvent } from '@/types/visualizer';
import { useThreeContext } from '../../providers/ThreeProvider';

export const BaseVisualizer: React.FC<BaseVisualizerProps & { children: React.ReactNode }> = ({
  id,
  children,
  visible = true,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animationSpeed = 1,
  interactionEnabled = true,
  onLoad,
  onError,
  onInteraction,
  ...props
}) => {
  const groupRef = useRef<Group>(null);
  const { reportError } = useThreeContext();
  const { size, raycaster, camera } = useThree();

  // Handle loading completion
  useEffect(() => {
    if (onLoad) {
      const timer = setTimeout(onLoad, 100);
      return () => clearTimeout(timer);
    }
  }, [onLoad]);

  // Handle interactions
  const handlePointerEvent = useCallback((event: any, type: InteractionEvent['type']) => {
    if (!interactionEnabled || !onInteraction) return;

    try {
      const interactionEvent: InteractionEvent = {
        type,
        target: event.object,
        point: event.point,
        distance: event.distance,
        face: event.face,
        uv: event.uv,
        object: event.object,
        intersections: event.intersections,
        originalEvent: event.nativeEvent,
      };

      onInteraction(interactionEvent);
    } catch (error) {
      reportError({
        name: 'InteractionError',
        message: `Failed to handle ${type} interaction`,
        code: 'INTERACTION_ERROR',
        severity: 'low',
        recoverable: true,
        fallbackAvailable: false,
        context: error,
      });
    }
  }, [interactionEnabled, onInteraction, reportError]);

  // Animation frame handler
  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;

    try {
      // Apply automatic animation speed scaling
      const scaledDelta = delta * animationSpeed;
      
      // Custom animation logic can be added here
      // This is overridden by child components
    } catch (error) {
      if (onError) {
        onError({
          name: 'AnimationError',
          message: 'Animation frame error',
          code: 'ANIMATION_ERROR',
          severity: 'low',
          recoverable: true,
          fallbackAvailable: false,
          context: error,
        });
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
      onPointerOver={(e) => handlePointerEvent(e, 'hover')}
      onPointerOut={(e) => handlePointerEvent(e, 'hover')}
      onClick={(e) => handlePointerEvent(e, 'click')}
      onPointerMove={(e) => handlePointerEvent(e, 'drag')}
      {...props}
    >
      {children}
    </group>
  );
};
```

### 2.2 Migrate Existing Components

Update your existing mathematical-shapes.tsx:

```typescript
// src/components/three/visualizers/geometric/MathematicalShapes/MathematicalShapesVisualizer.tsx
'use client';

import React, { useMemo } from 'react';
import { BaseVisualizer } from '../../core/BaseVisualizer';
import { MathematicalShapeProps } from '@/types/visualizer';
import { useResponsiveThree } from '../../../hooks/useResponsiveThree';
import { COMPONENT_RESPONSIVE_CONFIGS } from '../../../config/responsive';
import { ShapeInstance } from './ShapeInstance';

export const MathematicalShapesVisualizer: React.FC<MathematicalShapeProps> = ({
  shapeType = 'torusKnot',
  complexity = 'medium',
  ...baseProps
}) => {
  const config = useResponsiveThree(COMPONENT_RESPONSIVE_CONFIGS.mathematicalShapes);

  const shapes = useMemo(() => {
    return Array.from({ length: config.count }, (_, index) => ({
      id: `shape-${index}`,
      type: shapeType,
      complexity,
      index,
    }));
  }, [shapeType, complexity, config.count]);

  return (
    <BaseVisualizer {...baseProps}>
      <group>
        {shapes.map((shape) => (
          <ShapeInstance
            key={shape.id}
            {...shape}
            orbitalRadius={config.orbitalRadius}
            animationSpeed={config.animationSpeed}
          />
        ))}
      </group>
    </BaseVisualizer>
  );
};
```

## Step 3: Implement Performance Optimization

### 3.1 Add Performance Monitoring

```typescript
// src/components/three/hooks/useThreePerformance.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerformanceMetrics, PerformanceSettings } from '@/types/visualizer';

export const useThreePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const { gl, scene, camera } = useThree();

  const updateMetrics = useCallback(() => {
    if (!gl || !scene || !camera) return;

    const info = gl.info;
    const memoryInfo = (performance as any).memory;

    const newMetrics: PerformanceMetrics = {
      fps: 0, // Will be calculated by useFrame
      frameTime: 0,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length || 0,
      memory: {
        used: memoryInfo?.usedJSHeapSize || 0,
        total: memoryInfo?.totalJSHeapSize || 0,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length || 0,
        rendertargets: 0,
      },
      gpu: {
        memory: undefined,
      },
      timing: {
        render: 0,
        compute: 0,
        update: 0,
      },
    };

    setMetrics(newMetrics);
  }, [gl, scene, camera]);

  // Calculate FPS using useFrame
  useFrame((state, delta) => {
    const fps = Math.round(1 / delta);
    setMetrics(current => current ? { ...current, fps, frameTime: delta * 1000 } : null);
  });

  useEffect(() => {
    const interval = setInterval(updateMetrics, 1000); // Update every second
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return { metrics };
};
```

### 3.2 Add Responsive Hooks

```typescript
// src/components/three/hooks/useResponsiveThree.ts
'use client';

import { useState, useEffect } from 'react';
import { ResponsiveConfig } from '@/types/visualizer';
import { ResponsiveConfigUtils } from '../config/responsive';

export const useResponsiveThree = <T>(config: ResponsiveConfig<T>): T => {
  const [currentConfig, setCurrentConfig] = useState<T>(() => 
    ResponsiveConfigUtils.getResponsiveValue(config)
  );

  useEffect(() => {
    const updateConfig = () => {
      const newConfig = ResponsiveConfigUtils.getResponsiveValue(config);
      setCurrentConfig(newConfig);
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    return () => window.removeEventListener('resize', updateConfig);
  }, [config]);

  return currentConfig;
};
```

## Step 4: Add Error Handling

### 4.1 Wrap Components with Error Boundaries

```typescript
// Update your main Three.js components
import { ThreeErrorBoundary } from '@/components/three/providers/ErrorBoundary';

const MyThreeComponent = () => {
  return (
    <ThreeErrorBoundary
      enableRetry={true}
      maxRetries={3}
      reportErrors={true}
      onError={(error, errorInfo) => {
        console.log('Three.js Error:', error);
      }}
    >
      <Canvas>
        {/* Your Three.js content */}
      </Canvas>
    </ThreeErrorBoundary>
  );
};
```

## Step 5: Test the Implementation

### 5.1 Basic Functionality Test

Create a test component to verify everything works:

```typescript
// src/components/three/test/TestVisualizer.tsx
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ThreeErrorBoundary } from '../providers/ErrorBoundary';
import { MathematicalShapesVisualizer } from '../visualizers/geometric/MathematicalShapes';
import { OrbitControls, Environment } from '@react-three/drei';

export const TestVisualizer: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ThreeErrorBoundary>
        <Canvas>
          <Environment preset="studio" />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          
          <MathematicalShapesVisualizer
            id="test-shapes"
            shapeType="torusKnot"
            complexity="medium"
            animationSpeed={1}
            onLoad={() => console.log('Visualizer loaded!')}
          />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};
```

### 5.2 Performance Test

```typescript
// Test performance monitoring
const PerformanceTest = () => {
  const { metrics } = useThreePerformance();

  return (
    <div>
      <h3>Performance Metrics</h3>
      <p>FPS: {metrics?.fps}</p>
      <p>Draw Calls: {metrics?.drawCalls}</p>
      <p>Triangles: {metrics?.triangles}</p>
      <TestVisualizer />
    </div>
  );
};
```

## Step 6: Production Optimization

### 6.1 Bundle Optimization

Update your `next.config.js`:

```javascript
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize Three.js imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Handle Three.js examples imports
    config.module.rules.push({
      test: /\.glsl$/,
      use: 'raw-loader',
    });

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
};
```

### 6.2 Performance Monitoring

Add performance monitoring to your analytics:

```typescript
// Track Three.js performance
const trackPerformance = (metrics: PerformanceMetrics) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'three_js_performance', {
      fps: metrics.fps,
      draw_calls: metrics.drawCalls,
      triangles: metrics.triangles,
      memory_mb: Math.round(metrics.memory.used / (1024 * 1024)),
    });
  }
};
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all type definitions are properly imported
2. **WebGL Context Lost**: The error boundary will handle this automatically
3. **Performance Issues**: Check the adaptive quality system is working
4. **Memory Leaks**: Verify components are properly disposing of resources

### Debug Mode

Enable debug logging:

```typescript
// Add to your ThreeProvider
<ThreeProvider
  initialPerformanceMode="auto"
  adaptiveQuality={true}
  memoryManagement={true}
  errorReporting={process.env.NODE_ENV === 'development'}
>
```

## Next Steps

1. **Implement Custom Visualizers**: Use the BaseVisualizer pattern
2. **Add More Interactive Elements**: Extend the interaction system
3. **Optimize for Mobile**: Test and adjust responsive configurations
4. **Add More Fallback Options**: Enhance the error boundary system
5. **Performance Monitoring**: Set up production monitoring

This implementation provides a solid foundation for your 3D visualizer architecture. The system is designed to be extensible, performant, and robust across all device types and capabilities.