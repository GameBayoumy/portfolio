// GitHub API Response Types for GameBayoumy Portfolio

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url: string | null;
  hooks_url: string;
  svn_url: string;
  homepage: string | null;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  } | null;
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: Record<string, any>;
  public: boolean;
  created_at: string;
  org?: {
    id: number;
    login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
}

export interface GitHubTrafficViews {
  count: number;
  uniques: number;
  views: Array<{
    timestamp: string;
    count: number;
    uniques: number;
  }>;
}

export interface GitHubTrafficClones {
  count: number;
  uniques: number;
  clones: Array<{
    timestamp: string;
    count: number;
    uniques: number;
  }>;
}

export interface GitHubTrafficReferrers {
  referrer: string;
  count: number;
  uniques: number;
}

export interface GitHubTrafficPaths {
  path: string;
  title: string;
  count: number;
  uniques: number;
}

// Aggregated Data Types for Portfolio
export interface LanguageStats {
  language: string;
  bytes: number;
  percentage: number;
  repos: string[];
}

export interface RepositoryStats {
  total: number;
  languages: LanguageStats[];
  totalStars: number;
  totalForks: number;
  mostStarred: GitHubRepository | null;
  mostRecent: GitHubRepository | null;
}

export interface ActivityStats {
  totalEvents: number;
  eventTypes: Record<string, number>;
  recentActivity: GitHubEvent[];
  commitFrequency: Record<string, number>;
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached: boolean;
  timestamp: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// Cache Entry Type
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Request Configuration
export interface RequestConfig {
  cache?: boolean;
  cacheTTL?: number;
  retry?: boolean;
  maxRetries?: number;
  timeout?: number;
}

// Rate Limiting Info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}