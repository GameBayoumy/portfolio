import axios, { AxiosResponse } from 'axios';

// Types for GitHub API responses
export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics: string[];
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubStats {
  user: GitHubUser;
  repositories: GitHubRepository[];
  totalStars: number;
  totalForks: number;
  languageStats: Array<{
    language: string;
    bytes: number;
    percentage: number;
  }>;
}

class GitHubApiService {
  private readonly baseURL = 'https://api.github.com';
  private readonly username = 'GameBayoumy';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private async makeRequest<T>(endpoint: string, ttl = 300000): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
            'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
          })
        },
        timeout: 10000,
      });

      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        ttl
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`GitHub API Error (${endpoint}):`, error.response?.status, error.response?.data);
        
        // Return cached data if available, even if expired
        if (cached) {
          console.warn('Using expired cache due to API error');
          return cached.data;
        }
      }
      throw error;
    }
  }

  async getUserProfile(): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>(`/users/${this.username}`, 900000); // 15 min cache
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    return this.makeRequest<GitHubRepository[]>(
      `/users/${this.username}/repos?sort=updated&per_page=100`,
      1800000 // 30 min cache
    );
  }

  async getRepositoryLanguages(repoName: string): Promise<GitHubLanguages> {
    return this.makeRequest<GitHubLanguages>(
      `/repos/${this.username}/${repoName}/languages`,
      3600000 // 1 hour cache
    );
  }

  async getAggregatedLanguageStats(): Promise<Array<{ language: string; bytes: number; percentage: number }>> {
    const repositories = await this.getUserRepositories();
    const languageMap = new Map<string, number>();
    
    // Get languages for each repository
    const languagePromises = repositories
      .filter(repo => !repo.fork && repo.language) // Exclude forks and repos without language
      .map(async (repo) => {
        try {
          const languages = await this.getRepositoryLanguages(repo.name);
          return languages;
        } catch (error) {
          console.warn(`Failed to get languages for ${repo.name}`);
          return {};
        }
      });

    const languageResults = await Promise.allSettled(languagePromises);
    
    // Aggregate language statistics
    languageResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        Object.entries(result.value).forEach(([language, bytes]) => {
          languageMap.set(language, (languageMap.get(language) || 0) + bytes);
        });
      }
    });

    // Convert to array and calculate percentages
    const totalBytes = Array.from(languageMap.values()).reduce((sum, bytes) => sum + bytes, 0);
    
    return Array.from(languageMap.entries())
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  async getGitHubStats(): Promise<GitHubStats> {
    const [user, repositories] = await Promise.all([
      this.getUserProfile(),
      this.getUserRepositories()
    ]);

    const languageStats = await this.getAggregatedLanguageStats();

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

    return {
      user,
      repositories,
      totalStars,
      totalForks,
      languageStats
    };
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const gitHubApi = new GitHubApiService();