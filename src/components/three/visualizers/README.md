# Three.js Visualizers

Advanced visualization components built with React Three Fiber.

## ParticleField

A high-performance particle system with interactive mouse effects and customizable animations.

### Features
- 🚀 **Performance Optimized**: Uses instanced rendering for thousands of particles
- 🎨 **Dynamic Colors**: Color gradients and transitions
- 🖱️ **Interactive**: Mouse influence and real-time controls
- ⚡ **Smooth Animations**: Physics-based movement with turbulence
- 🎛️ **Customizable**: Extensive configuration options
- 📱 **Responsive**: Adapts to viewport changes

### Usage

```tsx
import ParticleField from '@/components/three/visualizers/ParticleField';

// Basic usage
<ParticleField />

// With custom configuration
<ParticleField
  config={{
    count: 7000,
    speed: 1.2,
    mouseInfluence: 3.0,
    colorRange: ['#ff006e', '#8338ec']
  }}
  showControls={true}
/>

// With preset
import { ParticlePresets } from '@/components/three/visualizers';
<ParticleField config={ParticlePresets.energetic} />
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `count` | number | 5000 | Number of particles |
| `size` | number | 0.02 | Base particle size |
| `speed` | number | 0.5 | Movement speed |
| `mouseInfluence` | number | 2.0 | Mouse interaction strength |
| `colorRange` | [string, string] | ['#0ea5e9', '#8b5cf6'] | Color gradient |
| `opacity` | number | 0.8 | Particle opacity |
| `turbulence` | number | 0.3 | Random movement amount |

### Presets

- `gentle`: Calm, slow-moving particles
- `energetic`: Fast, highly interactive particles
- `cosmic`: Space-themed colors and movement
- `ocean`: Blue/cyan underwater effect

### Controls

When `showControls={true}`:
- Press 'C' to toggle control panel
- Adjust parameters in real-time
- Interactive mouse influence
- Dynamic color changes

### Performance Notes

- Optimized for 1000-10000 particles
- Uses instanced mesh rendering
- Automatic LOD based on distance
- Efficient boundary wrapping
- WebGL-accelerated animations