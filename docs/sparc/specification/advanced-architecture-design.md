# Advanced GitHub Visualizers - Architecture Design

## SPARC Phase 3: Architecture Specification

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Visualizers Architecture             │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ 3D Network      │ │ Heatmap Calendar│ │ Activity Timeline││
│  │ Component       │ │ Component       │ │ Component        ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           React Query + Zustand Store                   ││
│  │  • Caching Strategy    • Loading States                 ││
│  │  • Error Handling      • Real-time Updates              ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ GitHub API      │ │ Contribution    │ │ Events API       ││
│  │ Service         │ │ Service         │ │ Service          ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Repository Data │ │ Contribution    │ │ Activity Events  ││
│  │ & Relationships │ │ Calendar Data   │ │ & Timeline Data  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. 3D Repository Network Component

```typescript
// Component Structure
src/components/github-visualizers/network/
├── RepositoryNetwork.tsx          // Main container
├── NetworkScene.tsx               // Three.js scene setup
├── NetworkControls.tsx            // Camera controls and interactions  
├── NetworkNodes.tsx               // Repository node rendering
├── NetworkConnections.tsx         // Fork/dependency connections
├── NetworkTooltip.tsx            // Hover information display
├── NetworkModal.tsx              // Detailed repository information
├── hooks/
│   ├── useNetworkData.ts         // Data processing and graph generation
│   ├── useNetworkLayout.ts       // Force-directed layout algorithm
│   ├── useNetworkInteractions.ts // Mouse/touch interactions
│   └── useNetworkAnimation.ts    // Animation and transitions
└── types/
    └── network.types.ts          // Network-specific type definitions
```

#### 2. Contribution Heatmap Component

```typescript
// Component Structure  
src/components/github-visualizers/heatmap/
├── ContributionHeatmap.tsx       // Main container
├── HeatmapCalendar.tsx          // D3.js calendar grid
├── HeatmapControls.tsx          // Year navigation and filters
├── HeatmapTooltip.tsx          // Daily contribution details
├── HeatmapLegend.tsx           // Color scale and statistics
├── hooks/
│   ├── useContributionData.ts   // GitHub contributions API
│   ├── useHeatmapLayout.ts      // Calendar layout calculation
│   └── useHeatmapInteractions.ts // Hover and click handlers
└── types/
    └── heatmap.types.ts         // Heatmap-specific types
```

#### 3. Activity Timeline Component

```typescript
// Component Structure
src/components/github-visualizers/timeline/
├── ActivityTimeline.tsx         // Main container
├── TimelineHeader.tsx          // Title and refresh controls
├── TimelineItem.tsx            // Individual activity entry
├── TimelineFilters.tsx         // Event type and date filters
├── TimelineInfiniteScroll.tsx  // Virtualized scrolling
├── hooks/
│   ├── useActivityData.ts      // GitHub events API
│   ├── useTimelineFilters.ts   // Filtering and search logic
│   └── useRealTimeUpdates.ts   // Live activity updates
└── types/
    └── timeline.types.ts       // Timeline-specific types
```

### Data Flow Architecture

#### Request Flow
```
User Interaction → Component → Custom Hook → Service Layer → GitHub API
                                   ↓
                               React Query → Cache → UI Update
```

#### Real-time Update Flow
```
GitHub Events → WebSocket/Polling → Service → React Query → Component → UI
```

#### Error Handling Flow
```
API Error → Service Layer → Error Boundary → Fallback UI → User Notification
```

### Service Layer Design

#### Enhanced GitHub API Service

```typescript
interface GitHubApiServiceInterface {
  // Existing methods
  getUserProfile(): Promise<GitHubUser>
  getUserRepositories(): Promise<GitHubRepository[]>
  getAggregatedLanguageStats(): Promise<LanguageStats[]>
  
  // New methods for advanced visualizers
  getRepositoryNetwork(): Promise<RepositoryNetwork>
  getUserContributions(year: number): Promise<ContributionData[]>
  getUserActivity(page?: number): Promise<GitHubEvent[]>
  getRepositoryDependencies(repo: string): Promise<DependencyData[]>
  getRealTimeEvents(): Promise<GitHubEvent[]>
}

// Service Implementation
class EnhancedGitHubApiService implements GitHubApiServiceInterface {
  private cache = new Map<string, CacheEntry<any>>()
  private rateLimiter = new RateLimiter()
  private websocket: WebSocket | null = null

  // Repository network data with relationships
  async getRepositoryNetwork(): Promise<RepositoryNetwork> {
    const repositories = await this.getUserRepositories()
    const dependencies = await this.batchGetDependencies(repositories)
    
    return {
      nodes: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        size: this.calculateNodeSize(repo),
        color: this.getLanguageColor(repo.language),
        position: this.calculatePosition(repo),
        data: repo
      })),
      edges: this.calculateConnections(repositories, dependencies)
    }
  }

  // GitHub contributions data
  async getUserContributions(year: number): Promise<ContributionData[]> {
    // Note: GitHub's contributions are only available via scraping
    // We'll use a combination of commit data and activity events
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    const commits = await this.getCommitActivity(startDate, endDate)
    const events = await this.getActivityInRange(startDate, endDate)
    
    return this.aggregateContributions(commits, events)
  }

  // Real-time activity updates
  async initializeRealTimeUpdates(): Promise<void> {
    // Implement WebSocket connection for real-time updates
    // Fallback to polling if WebSocket unavailable
    if (this.supportsWebSocket()) {
      this.websocket = new WebSocket('wss://github-activity.api')
      this.websocket.onmessage = this.handleRealTimeEvent.bind(this)
    } else {
      this.startPolling()
    }
  }
}
```

### State Management Architecture

#### Zustand Store Design

```typescript
interface GitHubVisualizersStore {
  // Data state
  networkData: RepositoryNetwork | null
  contributionData: ContributionData[]
  activityData: GitHubEvent[]
  
  // UI state  
  activeVisualization: 'network' | 'heatmap' | 'timeline' | null
  selectedRepository: GitHubRepository | null
  selectedDate: Date | null
  filters: VisualizationFilters
  
  // Loading and error states
  loading: {
    network: boolean
    heatmap: boolean
    timeline: boolean
  }
  
  errors: {
    network: string | null
    heatmap: string | null
    timeline: string | null
  }
  
  // Actions
  setNetworkData: (data: RepositoryNetwork) => void
  setContributionData: (data: ContributionData[]) => void
  setActivityData: (data: GitHubEvent[]) => void
  selectRepository: (repo: GitHubRepository) => void
  selectDate: (date: Date) => void
  updateFilters: (filters: Partial<VisualizationFilters>) => void
  setLoading: (visualization: string, loading: boolean) => void
  setError: (visualization: string, error: string | null) => void
  clearData: () => void
}
```

#### React Query Integration

```typescript
// Custom hooks for data fetching
export function useRepositoryNetwork() {
  return useQuery({
    queryKey: ['github', 'repository-network'],
    queryFn: () => gitHubApi.getRepositoryNetwork(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: exponentialBackoff
  })
}

export function useContributionHeatmap(year: number) {
  return useQuery({
    queryKey: ['github', 'contributions', year],
    queryFn: () => gitHubApi.getUserContributions(year),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: Boolean(year)
  })
}

export function useActivityTimeline() {
  return useInfiniteQuery({
    queryKey: ['github', 'activity-timeline'],
    queryFn: ({ pageParam = 1 }) => gitHubApi.getUserActivity(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 30 ? pages.length + 1 : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Auto-refresh every 5 minutes
  })
}
```

### Performance Optimization Architecture

#### 1. Code Splitting Strategy

```typescript
// Lazy load visualizations
const RepositoryNetwork = lazy(() => import('./network/RepositoryNetwork'))
const ContributionHeatmap = lazy(() => import('./heatmap/ContributionHeatmap'))  
const ActivityTimeline = lazy(() => import('./timeline/ActivityTimeline'))

// Preload strategy
const preloadVisualization = (component: string) => {
  switch (component) {
    case 'network':
      import('./network/RepositoryNetwork')
      break
    case 'heatmap':
      import('./heatmap/ContributionHeatmap')
      break
    case 'timeline':
      import('./timeline/ActivityTimeline')
      break
  }
}
```

#### 2. Memory Management

```typescript
interface MemoryManager {
  trackVisualization(id: string, component: any): void
  unloadVisualization(id: string): void
  getMemoryUsage(): number
  cleanup(): void
}

class VisualizationMemoryManager implements MemoryManager {
  private visualizations = new Map<string, WeakRef<any>>()
  private memoryUsage = 0
  private readonly MEMORY_LIMIT = 100 * 1024 * 1024 // 100MB

  trackVisualization(id: string, component: any): void {
    this.visualizations.set(id, new WeakRef(component))
    this.memoryUsage += this.estimateComponentSize(component)
    
    if (this.memoryUsage > this.MEMORY_LIMIT) {
      this.performCleanup()
    }
  }

  performCleanup(): void {
    // Unload least recently used visualizations
    const sortedVisualizations = this.getSortedByUsage()
    
    for (const [id, ref] of sortedVisualizations) {
      const component = ref.deref()
      if (component && this.canUnload(component)) {
        this.unloadVisualization(id)
        if (this.memoryUsage <= this.MEMORY_LIMIT * 0.8) {
          break
        }
      }
    }
  }
}
```

#### 3. Intersection Observer Integration

```typescript
// Lazy loading with Intersection Observer
export function useVisualizationLazyLoading() {
  const [visibleVisualizations, setVisibleVisualizations] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-visualization-id')
          if (id) {
            if (entry.isIntersecting) {
              setVisibleVisualizations(prev => new Set(prev).add(id))
            } else {
              setVisibleVisualizations(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
              })
            }
          }
        })
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    return () => observer.disconnect()
  }, [])

  return {
    visibleVisualizations,
    observeVisualization: (element: Element, id: string) => {
      element.setAttribute('data-visualization-id', id)
      observer.observe(element)
    }
  }
}
```

### Integration Patterns

#### 1. Parent Component Integration

```typescript
// Updated GitHubVisualizersSection.tsx structure
export default function GitHubVisualizersSection() {
  const { visibleVisualizations, observeVisualization } = useVisualizationLazyLoading()
  const store = useGitHubVisualizersStore()

  return (
    <section className="github-visualizers">
      {/* Existing components remain unchanged */}
      <GitHubStatsGrid />
      <LanguageDistribution />
      
      {/* New advanced visualizations */}
      <Suspense fallback={<VisualizationSkeleton />}>
        {visibleVisualizations.has('network') && (
          <RepositoryNetwork />
        )}
      </Suspense>
      
      <Suspense fallback={<VisualizationSkeleton />}>
        {visibleVisualizations.has('heatmap') && (
          <ContributionHeatmap />
        )}
      </Suspense>
      
      <Suspense fallback={<VisualizationSkeleton />}>
        {visibleVisualizations.has('timeline') && (
          <ActivityTimeline />
        )}
      </Suspense>
    </section>
  )
}
```

#### 2. Error Boundary Strategy

```typescript
class VisualizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to monitoring service
    console.error('Visualization error:', error, errorInfo)
    
    // Report to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <VisualizationErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}
```

### Deployment Architecture

#### Bundle Optimization
- **Code Splitting**: Each visualization as separate chunk
- **Tree Shaking**: Remove unused D3 and Three.js modules  
- **Asset Optimization**: Compressed geometries and textures
- **Service Worker**: Cache visualization assets and API responses

#### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Metrics**: Visualization load times, memory usage
- **Error Tracking**: Real-time error monitoring and alerting
- **User Analytics**: Interaction patterns and usage statistics

This architecture ensures scalable, performant, and maintainable advanced GitHub visualizations while maintaining compatibility with the existing portfolio structure.