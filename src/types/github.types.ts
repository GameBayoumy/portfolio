// Core GitHub API types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  languages?: Record<string, number>;
  topics: string[];
  parent?: {
    name: string;
    owner: {
      login: string;
    };
  };
}

export interface GitHubEvent {
  id: string;
  type: EventType;
  created_at: string;
  repo?: {
    name: string;
    url: string;
  };
  payload: {
    commits?: Commit[];
    action?: string;
    ref?: string;
    forkee?: Repository;
  };
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
}

export type EventType = 
  | 'PushEvent'
  | 'CreateEvent'
  | 'ForkEvent'
  | 'WatchEvent'
  | 'IssuesEvent'
  | 'PullRequestEvent'
  | 'ReleaseEvent'
  | 'PublicEvent'
  | 'FollowEvent';

// Processed data types
export interface GitHubStats {
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  lastUpdate: string;
  followersTrend?: TrendDirection;
  starsTrend?: TrendDirection;
  forksTrend?: TrendDirection;
}

export interface LanguageStats {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;
  title: string;
  description: string;
  repository?: string;
  repositoryUrl?: string;
  commitCount?: number;
  icon: string;
}

// Network visualization types
export interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  type: 'repository' | 'fork';
  stars: number;
  forks: number;
  language?: string;
  description?: string;
  url: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: 'fork' | 'dependency';
  strength: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// API response types
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: Date;
  used: number;
}

export interface APIResponse<T> {
  data: T;
  rateLimit: RateLimitInfo;
  etag?: string;
  lastModified?: string;
}

// Configuration types
export interface GitHubAPIConfig {
  baseURL: string;
  token?: string;
  timeout: number;
  userAgent: string;
}

export interface CacheConfig {
  namespace: string;
  defaultTTL: number;
  maxEntries: number;
}

export interface RateLimiterConfig {
  requestsPerHour: number;
  burstLimit: number;
  minInterval: number;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(
    message: string,
    public resetTime: Date
  ) {
    super(message, 403, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Utility types
export type TrendDirection = 'up' | 'down' | 'neutral';

export type ChartSize = 'small' | 'medium' | 'large';

export type AnimationPhase = 'loading' | 'stable' | 'interacting';

export interface NodeInteractionHandlers {
  onHover: (nodeId: string) => void;
  onClick: (nodeId: string) => void;
}

// Component prop types
export interface BaseVisualizationProps {
  username: string;
  className?: string;
  loading?: boolean;
  error?: Error | null;
}

export interface InteractiveVisualizationProps extends BaseVisualizationProps {
  interactive?: boolean;
  onDataSelect?: (data: any) => void;
}

// Hook return types
export interface GitHubDataHookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated?: string;
}

// Fetch options
export interface RepoFetchOptions {
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  type?: 'all' | 'owner' | 'member';
  per_page?: number;
  page?: number;
}

export interface EventFetchOptions {
  limit?: number;
  page?: number;
  types?: EventType[];
}

// Cache entry structure
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

export interface CacheOptions {
  ttl: number;
  etag?: string;
}