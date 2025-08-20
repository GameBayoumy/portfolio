// GitHub API Configuration

export const GITHUB_CONFIG = {
  API_BASE_URL: 'https://api.github.com',
  USERNAME: 'GameBayoumy',
  
  // Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_HOUR: 5000,
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10
  },
  
  // Cache TTL Settings (in milliseconds)
  CACHE_TTL: {
    PROFILE: 15 * 60 * 1000,      // 15 minutes
    REPOSITORIES: 30 * 60 * 1000,  // 30 minutes
    EVENTS: 5 * 60 * 1000,         // 5 minutes
    LANGUAGES: 60 * 60 * 1000,     // 1 hour
    TRAFFIC: 10 * 60 * 1000        // 10 minutes (shorter due to auth requirement)
  },
  
  // Request Configuration
  REQUEST: {
    TIMEOUT: 10000,               // 10 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,            // 1 second
    RETRY_BACKOFF: 2              // Exponential backoff multiplier
  },
  
  // API Endpoints
  ENDPOINTS: {
    USER: (username: string) => `/users/${username}`,
    USER_REPOS: (username: string) => `/users/${username}/repos`,
    USER_EVENTS: (username: string) => `/users/${username}/events`,
    REPO_LANGUAGES: (owner: string, repo: string) => `/repos/${owner}/${repo}/languages`,
    REPO_TRAFFIC_VIEWS: (owner: string, repo: string) => `/repos/${owner}/${repo}/traffic/views`,
    REPO_TRAFFIC_CLONES: (owner: string, repo: string) => `/repos/${owner}/${repo}/traffic/clones`,
    REPO_TRAFFIC_REFERRERS: (owner: string, repo: string) => `/repos/${owner}/${repo}/traffic/popular/referrers`,
    REPO_TRAFFIC_PATHS: (owner: string, repo: string) => `/repos/${owner}/${repo}/traffic/popular/paths`,
    RATE_LIMIT: '/rate_limit'
  },
  
  // Request Headers
  HEADERS: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GameBayoumy-Portfolio/1.0',
    'X-GitHub-Api-Version': '2022-11-28'
  },
  
  // Pagination
  PAGINATION: {
    PER_PAGE: 100,
    MAX_PAGES: 10
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    CACHE_PREFIX: 'github_api_cache_',
    RATE_LIMIT: 'github_rate_limit',
    AUTH_TOKEN: 'github_auth_token'
  },
  
  // Error Retry Codes
  RETRYABLE_STATUS_CODES: [
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504  // Gateway Timeout
  ]
} as const;

export type GitHubConfig = typeof GITHUB_CONFIG;