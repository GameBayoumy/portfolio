# GitHub Visualizers - Component Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    XR Portfolio App                         │
├─────────────────────────────────────────────────────────────┤
│  Hero Section │ About │ Projects │ GitHub Visualizers │ Contact │
└─────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │       GitHub Visualizers Section      │
                ├───────────────────────────────────────┤
                │  ┌─────────────────────────────────┐  │
                │  │     GitHub Stats Dashboard      │  │
                │  └─────────────────────────────────┘  │
                │  ┌─────────────────────────────────┐  │
                │  │   Repository Activity Timeline  │  │
                │  └─────────────────────────────────┘  │
                │  ┌─────────────────────────────────┐  │
                │  │  Language Distribution Chart    │  │
                │  └─────────────────────────────────┘  │
                │  ┌─────────────────────────────────┐  │
                │  │    3D Repository Network        │  │
                │  └─────────────────────────────────┘  │
                │  ┌─────────────────────────────────┐  │
                │  │   Contribution Heatmap Calendar │  │
                │  └─────────────────────────────────┘  │
                └───────────────────────────────────────┘
```

## Component Hierarchy

### 1. Container Components (Smart Components)

#### GitHubVisualizersSection
```typescript
interface GitHubVisualizersSectionProps {
  username: string;
  className?: string;
}

// Responsibilities:
// - Coordinate all GitHub visualizations
// - Manage shared state and error boundaries
// - Handle responsive layout
// - Provide loading states for entire section
```

#### GitHubStatsContainer
```typescript
interface GitHubStatsContainerProps {
  username: string;
  refreshInterval?: number;
}

// Responsibilities:
// - Fetch and manage user profile data
// - Fetch and manage repository statistics
// - Calculate derived metrics (total stars, forks, etc.)
// - Provide real-time updates
```

### 2. Presentation Components (Dumb Components)

#### StatsCard Components
```typescript
interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

// Atomic stat display components:
// - FollowerCountCard
// - RepositoryCountCard
// - StarCountCard
// - StreakCountCard
```

#### Timeline Components
```typescript
interface TimelineProps {
  events: GitHubEvent[];
  maxItems?: number;
  loading?: boolean;
}

interface TimelineItemProps {
  event: GitHubEvent;
  onClick?: (event: GitHubEvent) => void;
}

// Timeline visualization components:
// - ActivityTimeline (container)
// - TimelineItem (individual event)
// - TimelineEventModal (detail view)
```

#### Chart Components
```typescript
interface LanguageChartProps {
  languages: LanguageStats[];
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

interface HeatmapProps {
  contributions: ContributionDay[];
  year?: number;
  onDayClick?: (day: ContributionDay) => void;
}

// Visualization components:
// - LanguageDistributionChart (D3.js pie chart)
// - ContributionHeatmap (calendar grid)
// - NetworkGraph3D (Three.js network)
```

### 3. Service Layer Architecture

#### GitHub API Service
```typescript
class GitHubAPIService {
  private rateLimiter: RateLimiter;
  private cache: Cache;
  
  // Core data fetching methods
  async fetchUserProfile(username: string): Promise<GitHubUser>;
  async fetchRepositories(username: string): Promise<Repository[]>;
  async fetchUserEvents(username: string): Promise<GitHubEvent[]>;
  async fetchContributions(username: string, year: number): Promise<ContributionData>;
  
  // Utility methods
  async checkRateLimit(): Promise<RateLimitStatus>;
  clearCache(pattern?: string): void;
}
```

#### Data Processing Service
```typescript
class DataProcessingService {
  // Statistical calculations
  static calculateLanguageDistribution(repos: Repository[]): LanguageStats[];
  static calculateActivityMetrics(events: GitHubEvent[]): ActivityMetrics;
  static processNetworkData(repos: Repository[]): NetworkData;
  static formatTimelineEvents(events: GitHubEvent[]): TimelineEvent[];
  
  // Data validation and sanitization
  static validateUserData(user: GitHubUser): boolean;
  static sanitizeRepository(repo: Repository): Repository;
}
```

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub API    │───▶│  API Service     │───▶│  React Query    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Rate Limiter  │◀───│  Cache Layer     │◀───│  Query Cache    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Error Handler  │◀───│ Data Processing  │◀───│   Components    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## File Structure

```
src/components/github-visualizers/
├── index.ts                          # Public exports
├── GitHubVisualizersSection.tsx       # Main container
├── stats/
│   ├── GitHubStatsContainer.tsx       # Stats data container
│   ├── StatsGrid.tsx                  # Stats layout component
│   ├── StatCard.tsx                   # Individual stat display
│   └── StatCard.module.css            # Stat card styles
├── timeline/
│   ├── ActivityTimeline.tsx           # Timeline container
│   ├── TimelineItem.tsx               # Individual timeline entry
│   ├── TimelineEventModal.tsx         # Event detail modal
│   └── timeline.module.css            # Timeline styles
├── language/
│   ├── LanguageDistribution.tsx       # Language chart container
│   ├── PieChart.tsx                   # D3.js pie chart
│   ├── LanguageLegend.tsx             # Chart legend
│   └── language-chart.module.css      # Chart styles
├── network/
│   ├── RepositoryNetwork3D.tsx        # 3D network container
│   ├── NetworkScene.tsx               # Three.js scene setup
│   ├── NetworkNode.tsx                # Individual node component
│   ├── NetworkControls.tsx            # Camera/interaction controls
│   └── network.module.css             # 3D view styles
├── heatmap/
│   ├── ContributionHeatmap.tsx        # Heatmap container
│   ├── CalendarGrid.tsx               # Calendar layout
│   ├── HeatmapTooltip.tsx             # Day detail tooltip
│   └── heatmap.module.css             # Calendar styles
├── shared/
│   ├── LoadingSpinner.tsx             # Reusable loading component
│   ├── ErrorBoundary.tsx              # Error handling wrapper
│   ├── RefreshButton.tsx              # Manual refresh trigger
│   └── EmptyState.tsx                 # No data fallback
└── types/
    ├── github.types.ts                # GitHub API types
    ├── visualization.types.ts         # Chart/graph types
    └── component.types.ts             # Component prop types
```

## State Management Architecture

### React Query Configuration
```typescript
// queryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 30 * 60 * 1000,          // 30 minutes
      retry: (failureCount, error) => {
        if (error.status === 403) return false; // Don't retry rate limits
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Custom Hooks Architecture
```typescript
// Data fetching hooks
export const useGitHubUser = (username: string) => { ... };
export const useGitHubRepositories = (username: string) => { ... };
export const useGitHubEvents = (username: string) => { ... };
export const useContributionData = (username: string, year: number) => { ... };

// Derived data hooks
export const useLanguageStats = (username: string) => { ... };
export const useActivityMetrics = (username: string) => { ... };
export const useNetworkData = (username: string) => { ... };

// UI state hooks
export const useVisualizationSettings = () => { ... };
export const useAutoRefresh = (interval: number) => { ... };
```

## Performance Architecture

### Lazy Loading Strategy
```typescript
// Component-level code splitting
const GitHubStatsContainer = lazy(() => import('./stats/GitHubStatsContainer'));
const RepositoryNetwork3D = lazy(() => import('./network/RepositoryNetwork3D'));
const LanguageDistribution = lazy(() => import('./language/LanguageDistribution'));

// Progressive loading priorities
// 1. Stats Dashboard (immediate)
// 2. Timeline + Language Chart (after 500ms)
// 3. 3D Network (when in viewport)
// 4. Heatmap (when scrolled to)
```

### Memory Management
```typescript
// Three.js resource cleanup
useEffect(() => {
  return () => {
    // Dispose geometries, materials, textures
    scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    renderer.dispose();
  };
}, []);
```

## Error Handling Architecture

### Hierarchical Error Boundaries
```
GitHubVisualizersSection (Top-level error boundary)
├── GitHubStatsContainer (Stats error boundary)
├── ActivityTimeline (Timeline error boundary)
├── LanguageDistribution (Chart error boundary)
├── RepositoryNetwork3D (3D visualization error boundary)
└── ContributionHeatmap (Heatmap error boundary)
```

### Error Recovery Strategies
- **Network Errors**: Automatic retry with exponential backoff
- **Rate Limit Errors**: Wait until reset time, show countdown
- **Data Validation Errors**: Show partial data with warning
- **Render Errors**: Graceful fallback to simplified view

This architecture provides scalability, maintainability, and optimal performance for the GitHub Live Visualizers.