# GitHub API Endpoints & Data Structures

## REST API Endpoints

### User Profile Data
```
GET /users/GameBayoumy
- Basic profile information
- Public repositories count
- Followers/following counts
- Account creation date
```

### Repository Data
```
GET /users/GameBayoumy/repos?sort=updated&per_page=100
- Repository list with metadata
- Language information
- Stars, forks, watchers
- Last update timestamps
```

### Repository Languages
```
GET /repos/GameBayoumy/{repo}/languages
- Programming language breakdown
- Byte counts per language
- Called for each repository
```

### User Events
```
GET /users/GameBayoumy/events/public?per_page=100
- Recent public activity
- Push events, repository creation
- Fork and star activity
```

## GraphQL Queries

### Contribution Calendar
```graphql
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
```

### Repository Network
```graphql
query($username: String!) {
  user(login: $username) {
    repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        name
        description
        stargazerCount
        forkCount
        primaryLanguage { name color }
        parent { name owner { login } }
        repositoryTopics(first: 10) { nodes { topic { name } } }
      }
    }
  }
}
```

## Data Types

### GitHubUser
```typescript
interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  company?: string;
  location?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}
```

### Repository
```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language?: string;
  languages?: Record<string, number>;
  topics: string[];
}
```

### ContributionDay
```typescript
interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}
```

### UserEvent
```typescript
interface UserEvent {
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
  };
}
```

## Rate Limiting Strategy

### Request Quotas
- **Authenticated**: 5000 requests/hour
- **GraphQL**: 5000 points/hour (complex queries cost more)
- **Search**: 30 requests/minute

### Caching Strategy
- **User Data**: Cache for 10 minutes
- **Repository Data**: Cache for 5 minutes
- **Contribution Data**: Cache for 1 hour
- **Language Data**: Cache for 30 minutes

### Error Handling
```typescript
interface APIError {
  status: number;
  message: string;
  remainingRequests?: number;
  resetTime?: Date;
}
```