import {
  LinkedInProfile,
  ProfessionalStats as LinkedInStats,
  TimelineEvent,
  LinkedInAPIResponse,
} from '../components/linkedin-visualizers/types';
import { mockLinkedInApiData } from '../data/mock-linkedin-api';

const MOCK_DELAY_MS = 1000;

class LinkedInAPIService {
  private baseUrl = process.env.NEXT_PUBLIC_LINKEDIN_API_URL || '/api/linkedin';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<LinkedInAPIResponse<T>> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      if (this.shouldUseMockData()) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

        let mockResponse: LinkedInAPIResponse<T>;

        switch (endpoint) {
          case '/profile':
            mockResponse = {
              data: mockLinkedInApiData.profile as T,
              success: true,
              lastUpdated: new Date().toISOString(),
            };
            break;
          case '/stats':
            mockResponse = {
              data: mockLinkedInApiData.stats as T,
              success: true,
              lastUpdated: new Date().toISOString(),
            };
            break;
          case '/timeline':
            mockResponse = {
              data: mockLinkedInApiData.timeline as T,
              success: true,
              lastUpdated: new Date().toISOString(),
            };
            break;
          default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }

        this.cache.set(cacheKey, { data: mockResponse, timestamp: Date.now() });
        return mockResponse;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as LinkedInAPIResponse<T>;

      if (!data.success) {
        throw new Error(data.message || 'LinkedIn API request failed');
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('LinkedIn API fetch error:', error);
      throw error;
    }
  }

  private shouldUseMockData(): boolean {
    if (process.env.NEXT_PUBLIC_LINKEDIN_FORCE_MOCK === 'true') {
      return true;
    }

    if (process.env.NEXT_PUBLIC_LINKEDIN_ENABLE_LIVE === 'true') {
      return false;
    }

    return process.env.NODE_ENV === 'development';
  }

  async getProfile(): Promise<LinkedInProfile> {
    const response = await this.fetchWithCache<LinkedInProfile>('/profile');
    return response.data;
  }

  async getStats(): Promise<LinkedInStats> {
    const response = await this.fetchWithCache<LinkedInStats>('/stats');
    return response.data;
  }

  async getTimeline(): Promise<TimelineEvent[]> {
    const response = await this.fetchWithCache<TimelineEvent[]>('/timeline');
    return response.data;
  }

  async getSkillsByCategory(): Promise<Record<string, any[]>> {
    const profile = await this.getProfile();
    const skillsByCategory: Record<string, any[]> = {};
    
    profile.skills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill);
    });

    return skillsByCategory;
  }

  async getTopSkills(limit: number = 10): Promise<any[]> {
    const profile = await this.getProfile();
    return profile.skills
      .sort((a, b) => b.endorsements - a.endorsements)
      .slice(0, limit);
  }

  async searchProfile(query: string): Promise<{
    positions: any[];
    skills: any[];
    achievements: any[];
  }> {
    const profile = await this.getProfile();
    const lowercaseQuery = query.toLowerCase();

    const positions = profile.experience.filter(exp =>
      exp.title.toLowerCase().includes(lowercaseQuery) ||
      exp.company.toLowerCase().includes(lowercaseQuery) ||
      exp.description.toLowerCase().includes(lowercaseQuery)
    );

    const skills = profile.skills.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery)
    );

    const achievements: string[] = [];
    profile.experience.forEach(exp => {
      exp.achievements.forEach(achievement => {
        if (achievement.toLowerCase().includes(lowercaseQuery)) {
          achievements.push(achievement);
        }
      });
    });

    return { positions, skills, achievements };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const LinkedInAPI = new LinkedInAPIService();