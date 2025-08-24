# Three.js Visualizers Showcase

A comprehensive collection of interactive 3D visualizers built with React Three Fiber, featuring performance monitoring, responsive design, and error boundaries.

## Components

### ThreeVisualizersSection
Main showcase component that integrates all 3D visualizers with:
- **Grid Layout**: Responsive card-based interface
- **Performance Monitoring**: Real-time FPS, memory usage, and render metrics
- **Error Boundaries**: Graceful error handling with recovery options
- **Category Filtering**: Filter visualizers by type (particles, geometry, models, effects)
- **Lazy Loading**: Suspense-based loading with fallbacks
- **Responsive Design**: Works across all screen sizes

### VisualizerCard
Interactive card component for each visualizer featuring:
- **Live Metrics**: Real-time performance data display
- **Loading States**: Smooth loading animations
- **Complexity Indicators**: Visual complexity badges
- **Category Icons**: Visual categorization
- **Hover Effects**: Subtle interaction feedback

### PerformanceMonitor
Real-time performance tracking system:
- **FPS Monitoring**: Frame rate tracking with smoothing
- **Memory Usage**: JavaScript heap size monitoring
- **Render Time**: Frame render duration tracking
- **Scene Metrics**: Triangle count and draw call monitoring
- **Context Loss Detection**: WebGL context monitoring

### VisualizerLoader
Loading component with:
- **Animated Spinners**: Multi-layer loading animation
- **Progress Indicators**: Optional progress bars
- **Loading Steps**: Step-by-step loading feedback
- **Technical Status**: WebGL and hardware acceleration status

## Usage

```tsx
import { ThreeVisualizersSection } from '@/components/three';

function App() {
  return (
    <ThreeVisualizersSection
      showStats={true}
      enableNavigation={true}
      autoRotateCamera={true}
      maxConcurrentVisualizers={2}
      performanceMode="auto"
    />
  );
}
```

## Props

### ThreeVisualizersSection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `showStats` | `boolean` | `false` | Show performance statistics |
| `enableNavigation` | `boolean` | `true` | Enable category filtering |
| `autoRotateCamera` | `boolean` | `true` | Enable camera auto-rotation |
| `maxConcurrentVisualizers` | `number` | `1` | Max active visualizers |
| `performanceMode` | `'low' \| 'medium' \| 'high' \| 'auto'` | `'auto'` | Performance tier |

## Available Visualizers

### 1. Particle Field
- **Category**: Particles
- **Complexity**: Medium
- **Features**: Dynamic particle system with fluid animations
- **Props**: `count`, `speed`, `color`, `opacity`

### 2. Mathematical Shapes
- **Category**: Geometry
- **Complexity**: High
- **Features**: Geometric forms with mathematical precision
- **Props**: `complexity`, `animationSpeed`, `glowEffect`

### 3. VR Headset Model
- **Category**: Models
- **Complexity**: Medium
- **Features**: Interactive 3D model with animations
- **Props**: `interactive`, `animationSpeed`, `glowIntensity`

### 4. 3D Background
- **Category**: Effects
- **Complexity**: Low
- **Features**: Immersive background environment
- **Props**: `enablePostProcessing`, `backgroundColor`

## Performance Features

### Automatic Quality Adjustment
The system automatically detects device capabilities and adjusts:
- **Pixel Ratio**: Based on display density
- **Anti-aliasing**: Enabled on capable devices
- **Shadow Quality**: Adjusted for performance
- **Post-processing**: Enabled selectively

### Memory Management
- **Geometry Disposal**: Automatic cleanup of unused geometries
- **Texture Management**: Smart texture loading and disposal
- **Context Monitoring**: WebGL context loss detection and recovery

### Error Handling
- **Component-level Boundaries**: Each visualizer has error isolation
- **Graceful Degradation**: Fallback UI for WebGL unavailability
- **Recovery Mechanisms**: Retry buttons and automatic recovery

## Responsive Design

The showcase adapts to different screen sizes:
- **Desktop**: Full grid layout with detailed metrics
- **Tablet**: Compact grid with essential information
- **Mobile**: Single column with touch-optimized controls

## Browser Support

- **WebGL 1.0**: Minimum requirement
- **WebGL 2.0**: Enhanced features when available
- **Hardware Acceleration**: Required for optimal performance
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## Performance Guidelines

### Recommended Settings by Device
| Device Type | Performance Mode | Max Concurrent | Features |
|-------------|------------------|----------------|----------|
| **High-end Desktop** | `high` | 3 | All enabled |
| **Mid-range Desktop** | `medium` | 2 | Selective post-processing |
| **Laptop/Tablet** | `medium` | 1 | Reduced shadows |
| **Mobile** | `low` | 1 | Essential features only |

## Integration Examples

### Basic Integration
```tsx
// Basic showcase
<ThreeVisualizersSection />
```

### Advanced Configuration
```tsx
// With custom settings
<ThreeVisualizersSection
  showStats={true}
  enableNavigation={true}
  autoRotateCamera={false}
  maxConcurrentVisualizers={2}
  performanceMode="medium"
  className="my-custom-styles"
/>
```

### Performance Monitoring
```tsx
// With performance callbacks
<ThreeVisualizersSection
  showStats={true}
  onPerformanceUpdate={(metrics) => {
    console.log('Performance:', metrics);
    // Handle performance data
  }}
/>
```

## Technical Notes

### Memory Considerations
- Each visualizer uses approximately 20-50MB of GPU memory
- Particle systems scale with device capabilities
- Automatic cleanup on component unmount

### Threading
- Main thread: UI and state management
- GPU thread: 3D rendering and animations
- Worker threads: Complex calculations (when supported)

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion respect
- Focus management

## Troubleshooting

### Common Issues

**Low FPS Performance**
- Reduce `maxConcurrentVisualizers` to 1
- Set `performanceMode` to `'low'`
- Disable `showStats` if not needed

**Memory Issues**
- Check browser memory limitations
- Reduce particle counts in visualizers
- Enable automatic quality adjustment

**WebGL Context Loss**
- Automatic recovery implemented
- Monitor browser console for context events
- Ensure hardware acceleration is enabled

### Performance Optimization Tips

1. **Limit Concurrent Visualizers**: Start with 1, increase based on performance
2. **Use Performance Mode**: Let the system auto-detect or set manually
3. **Monitor Metrics**: Watch FPS and memory usage in real-time
4. **Test Across Devices**: Verify performance on target devices

## Future Enhancements

- **VR/AR Support**: WebXR integration for immersive experiences
- **Advanced Shaders**: Custom shader material system
- **Physics Integration**: Cannon.js or similar physics engine
- **Audio Visualization**: Audio-reactive visualizers
- **Real-time Collaboration**: Multi-user 3D environments