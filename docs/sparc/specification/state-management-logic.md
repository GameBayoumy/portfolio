# State Management & Update Logic

## React Query Integration Strategy

### Query Key Patterns
```pseudocode
// Hierarchical query keys for optimal caching
USER_PROFILE: ["github", "user", username]
USER_REPOSITORIES: ["github", "repositories", username]
USER_EVENTS: ["github", "events", username, page]
CONTRIBUTION_CALENDAR: ["github", "contributions", username, year]
LANGUAGE_STATS: ["github", "languages", username]
```

### Query Configuration Strategy
```pseudocode
CONST queryConfig = {
    userProfile: {
        staleTime: 10 * MINUTES,
        gcTime: 30 * MINUTES,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    repositories: {
        staleTime: 5 * MINUTES,
        gcTime: 15 * MINUTES,
        retry: 2,
        refetchOnWindowFocus: false
    },
    contributions: {
        staleTime: 1 * HOUR,
        gcTime: 2 * HOURS,
        retry: 1
    }
}
```

## Component State Management

### Stats Dashboard State Logic
```pseudocode
FUNCTION useGitHubStats(username: string):
    // Primary data queries
    userQuery = useQuery({
        queryKey: ["github", "user", username],
        queryFn: () => githubService.fetchUser(username),
        ...queryConfig.userProfile
    })
    
    reposQuery = useQuery({
        queryKey: ["github", "repositories", username],
        queryFn: () => githubService.fetchRepositories(username),
        ...queryConfig.repositories
    })
    
    // Derived state calculations
    stats = useMemo(() => {
        IF !userQuery.data OR !reposQuery.data:
            RETURN null
        
        totalStars = reposQuery.data.reduce((sum, repo) => sum + repo.stargazers_count, 0)
        totalForks = reposQuery.data.reduce((sum, repo) => sum + repo.forks_count, 0)
        
        RETURN {
            followers: userQuery.data.followers,
            following: userQuery.data.following,
            publicRepos: userQuery.data.public_repos,
            totalStars,
            totalForks,
            lastUpdate: new Date().toISOString()
        }
    }, [userQuery.data, reposQuery.data])
    
    // Auto-refresh logic
    useEffect(() => {
        interval = setInterval(() => {
            queryClient.invalidateQueries(["github", "user", username])
            queryClient.invalidateQueries(["github", "repositories", username])
        }, 5 * MINUTES)
        
        RETURN () => clearInterval(interval)
    }, [username])
    
    RETURN {
        stats,
        isLoading: userQuery.isLoading OR reposQuery.isLoading,
        error: userQuery.error OR reposQuery.error,
        refetch: () => {
            userQuery.refetch()
            reposQuery.refetch()
        }
    }
```

### Language Distribution State
```pseudocode
FUNCTION useLanguageDistribution(username: string):
    reposQuery = useQuery({
        queryKey: ["github", "repositories", username],
        queryFn: () => githubService.fetchRepositories(username),
        ...queryConfig.repositories
    })
    
    // Process language data
    languageStats = useMemo(() => {
        IF !reposQuery.data: RETURN []
        
        languageMap = new Map()
        totalBytes = 0
        
        FOR EACH repo IN reposQuery.data:
            IF repo.languages:
                FOR EACH [language, bytes] IN Object.entries(repo.languages):
                    currentBytes = languageMap.get(language) || 0
                    languageMap.set(language, currentBytes + bytes)
                    totalBytes += bytes
        
        languageArray = Array.from(languageMap.entries()).map(([name, bytes]) => ({
            name,
            bytes,
            percentage: (bytes / totalBytes) * 100,
            color: getLanguageColor(name)
        }))
        
        RETURN languageArray.sort((a, b) => b.percentage - a.percentage)
    }, [reposQuery.data])
    
    RETURN {
        languages: languageStats,
        isLoading: reposQuery.isLoading,
        error: reposQuery.error
    }
```

## Real-time Update Logic

### Background Sync Manager
```pseudocode
CLASS BackgroundSyncManager:
    PRIVATE syncIntervals: Map<string, number>
    PRIVATE activeTimers: Map<string, Timer>
    PRIVATE queryClient: QueryClient
    
    METHOD startSync():
        syncIntervals.set("userProfile", 10 * MINUTES)
        syncIntervals.set("repositories", 5 * MINUTES)
        syncIntervals.set("events", 2 * MINUTES)
        syncIntervals.set("contributions", 1 * HOUR)
        
        FOR EACH [dataType, interval] IN syncIntervals:
            timer = setInterval(() => {
                AWAIT syncData(dataType)
            }, interval)
            activeTimers.set(dataType, timer)
    
    METHOD syncData(dataType: string):
        TRY:
            SWITCH dataType:
                CASE "userProfile":
                    queryClient.invalidateQueries(["github", "user"])
                CASE "repositories":
                    queryClient.invalidateQueries(["github", "repositories"])
                CASE "events":
                    queryClient.invalidateQueries(["github", "events"])
                CASE "contributions":
                    queryClient.invalidateQueries(["github", "contributions"])
        CATCH error:
            handleSyncError(dataType, error)
    
    METHOD stopSync():
        FOR EACH timer IN activeTimers.values():
            clearInterval(timer)
        activeTimers.clear()
```

### Optimistic Updates Logic
```pseudocode
FUNCTION useOptimisticGitHubData():
    queryClient = useQueryClient()
    
    METHOD updateStarCount(repoId: string, newCount: number):
        // Optimistically update UI
        queryClient.setQueryData(["github", "repositories", username], (oldData) => {
            RETURN oldData.map(repo => 
                repo.id === repoId 
                    ? {...repo, stargazers_count: newCount}
                    : repo
            )
        })
        
        // Background verification
        setTimeout(() => {
            queryClient.invalidateQueries(["github", "repositories", username])
        }, 5000)
    
    RETURN { updateStarCount }
```

## Error State Management

### Error Boundary Logic
```pseudocode
CLASS GitHubVisualizersErrorBoundary EXTENDS React.Component:
    constructor(props):
        state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        }
    
    STATIC getDerivedStateFromError(error):
        RETURN {
            hasError: true,
            error: error
        }
    
    METHOD componentDidCatch(error, errorInfo):
        setState({
            error: error,
            errorInfo: errorInfo
        })
        
        // Log error to monitoring service
        logError(error, errorInfo)
    
    METHOD handleRetry():
        IF state.retryCount < 3:
            setState({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: state.retryCount + 1
            })
        ELSE:
            showFallbackUI()
    
    METHOD render():
        IF state.hasError:
            RETURN <ErrorFallback 
                error={state.error}
                onRetry={handleRetry}
                canRetry={state.retryCount < 3}
            />
        
        RETURN props.children
```

### Loading State Coordination
```pseudocode
FUNCTION useLoadingCoordination(queries: Query[]):
    loadingStates = useMemo(() => {
        initialLoading = queries.some(query => query.isInitialLoading)
        backgroundFetching = queries.some(query => query.isFetching && !query.isInitialLoading)
        error = queries.find(query => query.error)?.error
        
        RETURN {
            isInitialLoading: initialLoading,
            isBackgroundFetching: backgroundFetching,
            error: error,
            progress: calculateLoadingProgress(queries)
        }
    }, [queries])
    
    FUNCTION calculateLoadingProgress(queries: Query[]): number:
        completed = queries.filter(query => query.data).length
        total = queries.length
        RETURN (completed / total) * 100
    
    RETURN loadingStates
```

## Performance State Management

### Virtual Scrolling State
```pseudocode
FUNCTION useVirtualScrolling(items: any[], itemHeight: number, containerHeight: number):
    scrollTop = useState(0)
    
    visibleRange = useMemo(() => {
        startIndex = Math.floor(scrollTop / itemHeight)
        endIndex = Math.min(
            items.length - 1,
            Math.floor((scrollTop + containerHeight) / itemHeight)
        )
        
        RETURN {start: startIndex, end: endIndex}
    }, [scrollTop, items.length, itemHeight, containerHeight])
    
    visibleItems = useMemo(() => {
        RETURN items.slice(visibleRange.start, visibleRange.end + 1)
    }, [items, visibleRange])
    
    RETURN {
        visibleItems,
        visibleRange,
        totalHeight: items.length * itemHeight,
        setScrollTop: (top) => scrollTop = top
    }
```

### Memory Management
```pseudocode
FUNCTION useMemoryOptimization():
    useEffect(() => {
        // Clean up unused query cache every 5 minutes
        interval = setInterval(() => {
            queryClient.getQueryCache().clear({
                predicate: (query) => {
                    timeSinceLastAccess = Date.now() - query.state.dataUpdatedAt
                    RETURN timeSinceLastAccess > 30 * MINUTES
                }
            })
        }, 5 * MINUTES)
        
        RETURN () => clearInterval(interval)
    }, [])
    
    // Prevent memory leaks in Three.js components
    useEffect(() => {
        RETURN () => {
            // Dispose of Three.js objects
            scene.traverse((child) => {
                IF child.geometry: child.geometry.dispose()
                IF child.material: child.material.dispose()
            })
        }
    }, [])
```

This state management logic provides efficient data flow, real-time updates, error resilience, and performance optimization for the GitHub Live Visualizers.