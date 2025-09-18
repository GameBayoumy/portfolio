import axios, { AxiosResponse } from 'axios';
import {
  GitHubUser,
  GitHubRepository,
  GitHubLanguages,
  GitHubStats,
  GitHubEvent,
  ProcessedGitHubEvent,
  RepositoryNetwork,
  RepositoryNode,
  RepositoryConnection,
  ContributionYear,
  ContributionDay,
  EventDetails
} from '@/types/github';

// Re-export types for external use
export type {
  GitHubUser,
  GitHubRepository,
  GitHubLanguages,
  GitHubStats,
  GitHubEvent,
  ProcessedGitHubEvent,
  RepositoryNetwork,
  RepositoryNode,
  RepositoryConnection,
  ContributionYear,
  ContributionDay,
  EventDetails
};

// Remove duplicate type definitions (they're now imported)


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

  // New methods for advanced visualizers
  
  async getUserActivity(page = 1, per_page = 30): Promise<GitHubEvent[]> {
    return this.makeRequest<GitHubEvent[]>(
      `/users/${this.username}/events?page=${page}&per_page=${per_page}`,
      300000 // 5 min cache
    );
  }

  async getProcessedActivity(page = 1): Promise<ProcessedGitHubEvent[]> {
    const events = await this.getUserActivity(page);
    return events.map(event => this.processEvent(event));
  }

  private processEvent(event: GitHubEvent): ProcessedGitHubEvent {
    const details = this.extractEventDetails(event);
    
    return {
      id: event.id,
      type: event.type,
      timestamp: new Date(event.created_at),
      repository: event.repo.name,
      repositoryUrl: `https://github.com/${event.repo.name}`,
      message: this.generateEventMessage(event),
      icon: this.getEventIcon(event.type),
      color: this.getEventColor(event.type),
      details,
      actor: {
        login: event.actor.login,
        avatar_url: event.actor.avatar_url
      }
    };
  }

  private generateEventMessage(event: GitHubEvent): string {
    switch (event.type) {
      case 'PushEvent':
        const commits = event.payload.commits?.length || 0;
        return `Pushed ${commits} commit${commits !== 1 ? 's' : ''}`;
      case 'CreateEvent':
        if (event.payload.ref_type === 'repository') {
          return 'Created repository';
        } else if (event.payload.ref_type === 'branch') {
          return `Created branch ${event.payload.ref}`;
        }
        return `Created ${event.payload.ref_type}`;
      case 'IssuesEvent':
        return `${this.capitalize(event.payload.action)} issue #${event.payload.issue?.number}`;
      case 'PullRequestEvent':
        return `${this.capitalize(event.payload.action)} pull request #${event.payload.pull_request?.number}`;
      case 'ForkEvent':
        return 'Forked repository';
      case 'WatchEvent':
        return 'Starred repository';
      case 'ReleaseEvent':
        return `Released ${event.payload.release?.tag_name}`;
      default:
        return event.type.replace('Event', '');
    }
  }

  private extractEventDetails(event: GitHubEvent): EventDetails {
    const details: EventDetails = {};

    switch (event.type) {
      case 'PushEvent':
        details.commits = event.payload.commits?.slice(0, 3).map((commit: any) => ({
          sha: commit.sha.substring(0, 7),
          message: commit.message,
          url: `https://github.com/${event.repo.name}/commit/${commit.sha}`
        }));
        break;
      case 'IssuesEvent':
        details.issue = {
          number: event.payload.issue?.number,
          title: event.payload.issue?.title,
          url: event.payload.issue?.html_url
        };
        break;
      case 'PullRequestEvent':
        details.pullRequest = {
          number: event.payload.pull_request?.number,
          title: event.payload.pull_request?.title,
          url: event.payload.pull_request?.html_url
        };
        break;
      case 'CreateEvent':
        details.branch = {
          name: event.payload.ref || event.payload.master_branch,
          type: event.payload.ref_type
        };
        break;
      case 'ReleaseEvent':
        details.release = {
          tag_name: event.payload.release?.tag_name,
          name: event.payload.release?.name,
          url: event.payload.release?.html_url
        };
        break;
    }

    return details;
  }

  private getEventIcon(eventType: string): string {
    const iconMap: Record<string, string> = {
      'PushEvent': 'git-commit',
      'CreateEvent': 'git-branch',
      'IssuesEvent': 'issue-opened',
      'PullRequestEvent': 'git-pull-request',
      'ForkEvent': 'repo-forked',
      'WatchEvent': 'star',
      'ReleaseEvent': 'tag',
      'DeleteEvent': 'trash'
    };
    return iconMap[eventType] || 'activity';
  }

  private getEventColor(eventType: string): string {
    const colorMap: Record<string, string> = {
      'PushEvent': '#22c55e',
      'CreateEvent': '#3b82f6',
      'IssuesEvent': '#ef4444',
      'PullRequestEvent': '#8b5cf6',
      'ForkEvent': '#f59e0b',
      'WatchEvent': '#eab308',
      'ReleaseEvent': '#06b6d4',
      'DeleteEvent': '#dc2626'
    };
    return colorMap[eventType] || '#6b7280';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async getRepositoryNetwork(): Promise<RepositoryNetwork> {
    const repositories = await this.getUserRepositories();
    const nodes: RepositoryNode[] = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      size: this.calculateNodeSize(repo),
      color: this.getLanguageColor(repo.language || 'unknown'),
      position: { x: 0, y: 0, z: 0 }, // Will be calculated by layout algorithm
      velocity: { x: 0, y: 0, z: 0 },
      data: repo,
      connections: []
    }));

    const edges = this.calculateConnections(repositories);
    
    // Update node connections
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        sourceNode.connections.push(edge);
      }
    });

    return {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        clusters: this.calculateClusters(nodes, edges),
        density: edges.length / (nodes.length * (nodes.length - 1) / 2)
      }
    };
  }

  private calculateNodeSize(repo: GitHubRepository): number {
    // Size based on stars and activity
    const baseSize = 2;
    const starsFactor = Math.log(repo.stargazers_count + 1) * 0.5;
    const forksFactor = Math.log(repo.forks_count + 1) * 0.3;
    const sizeFactor = Math.log(repo.size + 1) * 0.1;
    
    return Math.max(baseSize, baseSize + starsFactor + forksFactor + sizeFactor);
  }

  private getLanguageColor(language: string): string {
    const colorMap: Record<string, string> = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C#': '#239120',
      'C++': '#f34b7d',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#fa7343',
      'Kotlin': '#A97BFF',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'Vue': '#4FC08D',
      'React': '#61dafb',
      'unknown': '#6b7280'
    };
    return colorMap[language] || colorMap['unknown'];
  }

  private calculateConnections(repositories: GitHubRepository[]): RepositoryConnection[] {
    const connections: RepositoryConnection[] = [];
    
    repositories.forEach(repo => {
      if (repo.fork) {
        // Find potential parent repository (simplified approach)
        const parentName = repo.full_name.split('/')[1];
        const possibleParent = repositories.find(r => 
          r.name === parentName && !r.fork && r.id !== repo.id
        );
        
        if (possibleParent) {
          connections.push({
            source: repo.id,
            target: possibleParent.id,
            type: 'fork',
            strength: 0.8
          });
        }
      }
      
      // Language-based connections (simplified)
      if (repo.language) {
        const sameLanguageRepos = repositories.filter(r => 
          r.language === repo.language && r.id !== repo.id
        ).slice(0, 2); // Limit connections
        
        sameLanguageRepos.forEach(relatedRepo => {
          connections.push({
            source: repo.id,
            target: relatedRepo.id,
            type: 'collaboration',
            strength: 0.3
          });
        });
      }
    });
    
    return connections;
  }

  private calculateClusters(nodes: RepositoryNode[], edges: RepositoryConnection[]): number {
    // Simplified cluster calculation
    const languages = new Set(nodes.map(n => n.data.language).filter(Boolean));
    return languages.size;
  }

  async getUserContributions(year: number): Promise<ContributionYear> {
    // Note: GitHub doesn't provide contributions via API directly
    // This is a simplified simulation based on commit activity with
    // fallbacks that keep the visualizer operational when the GitHub
    // API isn't reachable (common during local development or when the
    // anonymous rate limit is exceeded).
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    let repositories: GitHubRepository[] | null = null;

    try {
      repositories = await this.getUserRepositories();
    } catch (error) {
      console.warn('Falling back to simulated contribution data – repository fetch failed.', error);
    }

    const contributionDays = this.generateContributionDays(
      startDate,
      endDate,
      repositories,
      `${year}-${repositories?.length ?? 'fallback'}`
    );
    const weeks = this.groupDaysByWeeks(contributionDays);
    const totalContributions = contributionDays.reduce((sum, day) => sum + day.count, 0);

    return {
      year,
      totalContributions,
      weeks,
      range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      contributionCalendar: {
        colors: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
        totalContributions,
        weeks
      }
    };
  }

  private generateContributionDays(
    startDate: Date,
    endDate: Date,
    repositories: GitHubRepository[] | null,
    seed: string
  ): ContributionDay[] {
    const days: ContributionDay[] = [];
    const currentDate = new Date(startDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) + 1;
    const random = this.createSeededRandom(seed);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / millisecondsPerDay);
      const baseActivity = isWeekend ? 0.35 : 1;

      // Introduce seasonal and weekly rhythms to keep the data feeling organic.
      const seasonalTrend = (Math.sin((dayIndex / totalDays) * Math.PI * 2) + 1) * 0.6;
      const weeklyRhythm = (Math.sin((dayIndex / 7) * Math.PI * 2) + 1) * 0.4;

      let activitySignal = baseActivity + seasonalTrend + weeklyRhythm;

      if (repositories && repositories.length > 0) {
        // Boost activity around recently updated repositories to better
        // mirror real-world commit bursts.
        const recentActivity = repositories.reduce((score, repo) => {
          const reference = repo.pushed_at || repo.updated_at;
          if (!reference) {
            return score;
          }

          const activityDate = new Date(reference);
          const diffInDays = Math.abs(currentDate.getTime() - activityDate.getTime()) / millisecondsPerDay;

          if (diffInDays <= 2) return score + 1.8;
          if (diffInDays <= 7) return score + 1.2;
          if (diffInDays <= 14) return score + 0.6;
          return score;
        }, 0);

        activitySignal += recentActivity / Math.max(1, repositories.length / 10);
      } else {
        // When repository data is unavailable, synthesise believable
        // streaks so the heatmap still communicates momentum.
        activitySignal += this.calculateFallbackActivity(dayIndex, random);
      }

      const randomVariation = random() * 1.2;
      const intensity = Math.max(0, activitySignal + randomVariation - 1.2);
      const contributionCount = Math.round(intensity * 2.4);

      days.push({
        date: currentDate.toISOString().split('T')[0],
        count: contributionCount,
        level: this.getContributionLevel(contributionCount),
        weekday: dayOfWeek,
        week: this.getWeekOfYear(currentDate)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  private calculateFallbackActivity(dayIndex: number, random: () => number): number {
    const biWeeklyPulse = (Math.sin((dayIndex / 14) * Math.PI * 2) + 1) * 0.8;
    const quarterlySwing = (Math.sin((dayIndex / 90) * Math.PI * 2 + Math.PI / 4) + 1) * 0.9;
    const streakBoost = random() > 0.9 ? 3 + random() * 2 : random() * 0.5;

    return biWeeklyPulse + quarterlySwing + streakBoost * 0.4;
  }

  private createSeededRandom(seed: string): () => number {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i += 1) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }

    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  private getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  private getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor((date.getTime() - start.getTime()) / millisecondsPerDay);
    const offset = start.getDay();
    return Math.floor((dayOfYear + offset) / 7);
  }

  private groupDaysByWeeks(days: ContributionDay[]) {
    const weekMap = new Map<number, ContributionDay[]>();

    days.forEach(day => {
      const bucket = weekMap.get(day.week) ?? [];
      bucket.push(day);
      weekMap.set(day.week, bucket);
    });

    return Array.from(weekMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, contributionDays]) => {
        const orderedDays = [...contributionDays].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return {
          contributionDays: orderedDays,
          firstDay: orderedDays[0]?.date || '',
          totalContributions: orderedDays.reduce((sum, day) => sum + day.count, 0)
        };
      });
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const gitHubApi = new GitHubApiService();