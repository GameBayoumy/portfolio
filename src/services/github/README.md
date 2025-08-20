# GitHub API Service for GameBayoumy Portfolio

## Overview

Comprehensive GitHub API service designed for live portfolio visualizations with advanced caching, error handling, and request optimization.

## Features

- **Complete TypeScript Support**: Full type definitions for all GitHub API responses
- **Smart Caching**: TTL-based caching with automatic cleanup (15min profile, 30min repos, 5min events, 1hr languages)
- **Request Deduplication**: Prevents duplicate API calls for the same endpoint
- **Rate Limit Handling**: Automatic rate limit detection and waiting
- **Error Recovery**: Exponential backoff retry logic with custom error types
- **React Hooks**: Ready-to-use hooks for React components
- **Authentication Support**: Optional token-based authentication for private data
- **Traffic Analytics**: Repository traffic data (views, clones, referrers)

## Quick Start

### Basic Usage

```typescript
import { gitHubApi } from './services/github';

// Get user profile
const profile = await gitHubApi.getUserProfile();
console.log(profile.data.name); // GameBayoumy's name

// Get all repositories
const repos = await gitHubApi.getUserRepositories();
console.log(repos.data.length); // Number of repositories

// Get repository statistics
const stats = await gitHubApi.getRepositoryStats();
console.log(stats.totalStars); // Total stars across all repos
```

### React Hooks Usage

```typescript
import { useGitHubProfile, useRepositoryStats } from './services/github';

function ProfileComponent() {
  const { data: profile, loading, error } = useGitHubProfile();
  const { data: stats } = useRepositoryStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>Total Stars: {stats?.totalStars}</p>
    </div>
  );
}
```

### Dashboard Data

```typescript
// Get complete portfolio data in one call
const dashboard = await gitHubApi.getPortfolioDashboardData();

const portfolioData = {
  profile: dashboard.profile.data,
  totalRepos: dashboard.repositories.data.length,
  totalStars: dashboard.repositoryStats.totalStars,
  topLanguages: dashboard.repositoryStats.languages.slice(0, 5),
  recentActivity: dashboard.activityStats.recentActivity
};
```

## API Endpoints

### Primary Endpoints

| Endpoint | Method | Description | Cache TTL |
|----------|--------|-------------|-----------|
| `/users/GameBayoumy` | GET | User profile data | 15 minutes |
| `/users/GameBayoumy/repos` | GET | All repositories | 30 minutes |
| `/users/GameBayoumy/events` | GET | Recent activity | 5 minutes |
| `/repos/GameBayoumy/{repo}/languages` | GET | Repository languages | 1 hour |

### Traffic Endpoints (Requires Auth)

| Endpoint | Description |
|----------|-------------|
| `/repos/{owner}/{repo}/traffic/views` | Repository views |
| `/repos/{owner}/{repo}/traffic/clones` | Repository clones |
| `/repos/{owner}/{repo}/traffic/popular/referrers` | Top referrers |
| `/repos/{owner}/{repo}/traffic/popular/paths` | Popular paths |

## Authentication

```typescript
// Set authentication token for private data access
gitHubApi.setAuthToken('your_github_token');

// Now you can access traffic data
const trafficData = await gitHubApi.getRepositoryTrafficData('repo-name');
```

## Error Handling

```typescript
import { GitHubApiError } from './services/github';

try {
  await gitHubApi.getUserProfile();
} catch (error) {
  if (error instanceof GitHubApiError) {
    if (error.isRateLimited()) {
      console.log('Rate limited - waiting...');
    } else if (error.isNotFound()) {
      console.log('User not found');
    } else if (error.isUnauthorized()) {
      console.log('Authentication required');
    }
  }
}
```

## Cache Management

```typescript
// Get cache statistics
const stats = gitHubApi.getCacheStats();
console.log(`Cache entries: ${stats.totalEntries}`);

// Clear cache
gitHubApi.clearCache();

// Refresh all data
await gitHubApi.refreshAllData();
```

## Configuration

### Cache TTL Settings
- **Profile Data**: 15 minutes
- **Repository Data**: 30 minutes  
- **Activity Events**: 5 minutes
- **Language Stats**: 1 hour
- **Traffic Data**: 10 minutes

### Rate Limiting
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5000 requests/hour
- **Auto-retry**: Exponential backoff with jitter

### Request Optimization
- **Deduplication**: Identical requests share promises
- **Timeout**: 10 seconds default
- **Retry Logic**: 3 attempts with exponential backoff

## Available Hooks

| Hook | Description |
|------|-------------|
| `useGitHubProfile()` | User profile data |
| `useGitHubRepositories()` | All repositories |
| `useGitHubEvents()` | Recent activity |
| `useRepositoryStats()` | Aggregated repository statistics |
| `useActivityStats()` | Activity analysis |
| `useGitHubDashboard()` | Complete dashboard data |
| `useRepositoryLanguages(repo)` | Languages for specific repo |
| `useRepositoryTraffic(repo)` | Traffic data (auth required) |
| `useRepositorySearch(query, filters)` | Search repositories |
| `useGitHubAuth()` | Authentication state |
| `useGitHubCache()` | Cache management |

## File Structure

```
src/services/github/
├── index.ts              # Main exports
├── github-api.ts         # Core API service
├── base-client.ts        # Base HTTP client
├── hooks.ts              # React hooks
├── README.md             # This file
src/types/
└── github.ts             # TypeScript interfaces
src/utils/
├── cache.ts              # Caching service
├── request-deduplication.ts  # Request optimization
└── error-handling.ts     # Error handling utilities
src/config/
└── github.ts             # Configuration constants
```

## Performance Features

- **Parallel Requests**: Dashboard data fetched concurrently
- **Request Deduplication**: Eliminates duplicate API calls
- **Smart Caching**: Different TTL per endpoint type
- **Background Cleanup**: Automatic cache maintenance
- **Retry Logic**: Intelligent error recovery
- **Rate Limit Awareness**: Automatic throttling

## Examples

See the `GitHubApiExamples` object in the main export for comprehensive usage examples including:
- Basic API usage
- Dashboard data aggregation
- Repository searching with filters
- Authentication workflows
- Cache management
- Error handling patterns