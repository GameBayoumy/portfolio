# Component Specifications

## Core Component Architecture

### 1. Layout Components

#### RootLayout
```typescript
interface RootLayoutProps {
  children: React.ReactNode
}

// Responsibilities:
// - Global providers setup (theme, store)
// - SEO metadata management
// - Font and asset preloading
// - Error boundary wrapper
```

#### Header
```typescript
interface HeaderProps {
  variant?: 'default' | 'transparent'
  showLogo?: boolean
  showNavigation?: boolean
}

// Features:
// - Responsive navigation menu
// - Theme toggle
// - Smooth scroll navigation
// - Mobile hamburger menu
// - Magic UI border animations
```

#### Footer
```typescript
interface FooterProps {
  showSocialLinks?: boolean
  showContactInfo?: boolean
}

// Features:
// - Social media links
// - Contact information
// - Copyright notice
// - Back to top button
```

### 2. 3D Scene Components

#### Scene3D
```typescript
interface Scene3DProps {
  cameraPosition?: [number, number, number]
  enableControls?: boolean
  quality?: 'low' | 'medium' | 'high'
  onLoad?: () => void
}

// Responsibilities:
// - Main 3D scene container
// - Performance monitoring
// - Quality adjustment
// - Loading state management
```

#### VRHeadset
```typescript
interface VRHeadsetProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  interactive?: boolean
  animationSpeed?: number
}

// Features:
// - Interactive hover effects
// - Rotation animations
// - Material switching
// - Shader effects
// - Click interactions
```

#### Environment3D
```typescript
interface Environment3DProps {
  preset?: 'city' | 'studio' | 'sunset' | 'night'
  intensity?: number
  blur?: number
}

// Features:
// - HDR environment maps
// - Dynamic lighting
// - Background blur
// - Time-based transitions
```

#### MathematicalParticles
```typescript
interface MathematicalParticlesProps {
  count?: number
  size?: number
  speed?: number
  formula?: 'wave' | 'spiral' | 'fractal'
  color?: string
}

// Features:
// - GPU-based particle system
// - Mathematical motion patterns
// - Interactive mouse influence
// - Performance optimization
```

### 3. UI Components (Magic UI Integration)

#### AnimatedButton
```typescript
interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  animation?: 'pulse' | 'glow' | 'ripple'
  loading?: boolean
}

// Features:
// - Magic UI animations
// - Loading states
// - Accessibility support
// - Custom variants
```

#### ProjectCard
```typescript
interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    image: string
    tags: string[]
    demoUrl?: string
    githubUrl?: string
    featured?: boolean
  }
  variant?: 'grid' | 'list' | 'featured'
  showPreview?: boolean
}

// Features:
// - 3D preview integration
// - Magic UI border effects
// - Hover animations
// - Tag filtering
// - CTA buttons
```

#### SkillBadge
```typescript
interface SkillBadgeProps {
  skill: {
    name: string
    level: number
    category: string
    icon?: string
  }
  variant?: 'compact' | 'detailed'
  animated?: boolean
}

// Features:
// - Proficiency level indicator
// - Category color coding
// - Hover animations
// - Icon support
```

### 4. Section Components

#### HeroSection
```typescript
interface HeroSectionProps {
  title: string
  subtitle: string
  showCTA?: boolean
  show3DScene?: boolean
  backgroundVariant?: 'particles' | 'gradient' | '3d'
}

// Features:
// - 3D scene background
// - Animated text reveals
// - CTA button with Magic UI effects
// - Scroll indicator
// - Responsive layout
```

#### AboutSection
```typescript
interface AboutSectionProps {
  content: {
    title: string
    description: string
    image: string
    skills: Skill[]
    experience: Experience[]
  }
  layout?: 'default' | 'timeline' | 'grid'
}

// Features:
// - Interactive timeline
// - Skill proficiency chart
// - Image with effects
// - Animated counters
```

#### ProjectsSection
```typescript
interface ProjectsSectionProps {
  projects: Project[]
  layout?: 'grid' | 'masonry' | 'carousel'
  showFilters?: boolean
  showLoadMore?: boolean
}

// Features:
// - Project filtering
// - Grid layouts
// - 3D project previews
// - Load more functionality
// - Search capability
```

#### ContactSection
```typescript
interface ContactSectionProps {
  showForm?: boolean
  showSocialLinks?: boolean
  showMap?: boolean
  contactInfo: ContactInfo
}

// Features:
// - Contact form with validation
// - Social media integration
// - Interactive map
// - Success animations
```

### 5. Interactive Components

#### ScrollProgress
```typescript
interface ScrollProgressProps {
  variant?: 'linear' | 'circular'
  position?: 'top' | 'bottom' | 'side'
  color?: string
}

// Features:
// - Scroll position tracking
// - Smooth animations
// - Multiple display variants
// - Section highlighting
```

#### ThemeToggle
```typescript
interface ThemeToggleProps {
  variant?: 'switch' | 'button' | 'icon'
  showLabel?: boolean
  position?: 'header' | 'floating' | 'footer'
}

// Features:
// - Theme state management
// - Smooth transitions
// - System preference detection
// - Persistence
```

#### LoadingSpinner
```typescript
interface LoadingSpinnerProps {
  variant?: 'dots' | 'spinner' | 'pulse' | 'wave'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

// Features:
// - Multiple loading animations
// - Customizable appearance
// - Accessibility support
// - Text labels
```

## Component Composition Patterns

### 1. Higher-Order Components

#### withPerformanceMonitoring
```typescript
function withPerformanceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function PerformanceMonitoredComponent(props: T) {
    const { fps, memoryUsage } = usePerformanceMonitor()
    
    return (
      <PerformanceContext.Provider value={{ fps, memoryUsage }}>
        <WrappedComponent {...props} />
      </PerformanceContext.Provider>
    )
  }
}
```

#### withErrorBoundary
```typescript
function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<{ error: Error }>
) {
  return function ErrorBoundaryWrapper(props: T) {
    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
```

### 2. Compound Components

#### Navigation
```typescript
const Navigation = {
  Root: NavigationRoot,
  Item: NavigationItem,
  Dropdown: NavigationDropdown,
  MobileMenu: NavigationMobileMenu,
}

// Usage:
<Navigation.Root>
  <Navigation.Item href="/">Home</Navigation.Item>
  <Navigation.Item href="/about">About</Navigation.Item>
  <Navigation.Dropdown title="Projects">
    <Navigation.Item href="/projects/web">Web</Navigation.Item>
    <Navigation.Item href="/projects/xr">XR</Navigation.Item>
  </Navigation.Dropdown>
  <Navigation.MobileMenu />
</Navigation.Root>
```

### 3. Render Props Pattern

#### IntersectionObserver
```typescript
interface IntersectionObserverProps {
  children: (isVisible: boolean) => React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

function IntersectionObserver({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = false,
}: IntersectionObserverProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) observer.disconnect()
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])
  
  return <div ref={elementRef}>{children(isVisible)}</div>
}

// Usage:
<IntersectionObserver triggerOnce>
  {(isVisible) => (
    <div className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      Content appears when scrolled into view
    </div>
  )}
</IntersectionObserver>
```

## Component State Management

### 1. Local State Patterns

#### useState for Simple State
```typescript
function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component content */}
    </div>
  )
}
```

#### useReducer for Complex State
```typescript
interface ContactFormState {
  values: Record<string, string>
  errors: Record<string, string>
  isSubmitting: boolean
  isSuccess: boolean
}

type ContactFormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR' }

function ContactForm() {
  const [state, dispatch] = useReducer(contactFormReducer, initialState)
  
  // Form logic
}
```

### 2. Global State Integration

#### Zustand Store Usage
```typescript
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

#### React Context for Component Trees
```typescript
const SceneContext = createContext<{
  quality: 'low' | 'medium' | 'high'
  isLoading: boolean
  setQuality: (quality: 'low' | 'medium' | 'high') => void
}>()

function useSceneContext() {
  const context = useContext(SceneContext)
  if (!context) {
    throw new Error('useSceneContext must be used within SceneProvider')
  }
  return context
}
```

## Performance Optimization Strategies

### 1. Memoization
```typescript
// Component memoization
const ProjectCard = React.memo(({ project }: ProjectCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.project.id === nextProps.project.id
})

// Hook memoization
function useProjectFiltering(projects: Project[], filters: string[]) {
  return useMemo(() => {
    return projects.filter(project => 
      filters.some(filter => project.tags.includes(filter))
    )
  }, [projects, filters])
}
```

### 2. Lazy Loading
```typescript
// Component lazy loading
const Scene3D = lazy(() => import('@/components/3d/Scene3D'))
const ProjectsSection = lazy(() => import('@/components/sections/ProjectsSection'))

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Scene3D />
</Suspense>
```

### 3. Virtual Scrolling
```typescript
function VirtualizedProjectList({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  
  const visibleProjects = useMemo(() => {
    return projects.slice(visibleRange.start, visibleRange.end)
  }, [projects, visibleRange])
  
  // Virtual scrolling logic
  
  return (
    <div ref={containerRef}>
      {visibleProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

This component specification provides a comprehensive blueprint for building the XR developer portfolio with proper separation of concerns, reusability, and performance optimization.