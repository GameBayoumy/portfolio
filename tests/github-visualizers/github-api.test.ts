import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import axios from 'axios';
import { GitHubAPIService } from '../../src/services/github/github-api.service';
import { RateLimitError, NetworkError, NotFoundError } from '../../src/services/github/errors';
import type { GitHubUser, Repository, GitHubEvent } from '../../src/types/github.types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('GitHubAPIService', () => {
  let service: GitHubAPIService;
  let mockCreate: Mock;
  let mockGet: Mock;
  let mockPost: Mock;

  const mockConfig = {
    baseURL: 'https://api.github.com',
    token: 'test-token',
    timeout: 5000,
    userAgent: 'Portfolio-App/1.0'
  };

  const mockUser: GitHubUser = {
    login: 'GameBayoumy',
    id: 12345,
    avatar_url: 'https://avatars.githubusercontent.com/u/12345',
    name: 'Sharif Bayoumy',
    company: null,
    location: 'Egypt',
    bio: 'Game Developer & XR Enthusiast',
    public_repos: 42,
    followers: 150,
    following: 89,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockRepository: Repository = {
    id: 67890,
    name: 'awesome-project',
    full_name: 'GameBayoumy/awesome-project',
    description: 'An awesome project',
    private: false,
    html_url: 'https://github.com/GameBayoumy/awesome-project',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-15T00:00:00Z',
    stargazers_count: 25,
    watchers_count: 25,
    forks_count: 5,
    language: 'TypeScript',
    languages: {
      'TypeScript': 15000,
      'JavaScript': 8000,
      'CSS': 2000
    },
    topics: ['react', 'typescript', 'web-development']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockCreate = vi.fn().mockReturnValue({
      get: mockGet,
      post: mockPost,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    });
    
    mockedAxios.create = mockCreate;
    
    service = new GitHubAPIService(mockConfig);
  });

  describe('fetchUser', () => {
    it('should fetch user profile successfully', async () => {
      const mockResponse = {
        data: mockUser,
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200',
          'etag': '"abc123"'
        }
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.fetchUser('GameBayoumy');

      expect(mockGet).toHaveBeenCalledWith('/users/GameBayoumy', {
        headers: {}
      });
      expect(result.data).toEqual(mockUser);
      expect(result.rateLimit).toEqual({
        remaining: 4999,
        limit: 5000,
        resetTime: new Date(1640995200 * 1000),
        used: 1
      });
      expect(result.etag).toBe('"abc123"');
    });

    it('should handle cached data with ETag', async () => {
      // First call - populate cache
      const mockResponse = {
        data: mockUser,
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200',
          'etag': '"abc123"'
        }
      };

      mockGet.mockResolvedValueOnce(mockResponse);
      await service.fetchUser('GameBayoumy');

      // Second call - should use cached data
      mockGet.mockRejectedValueOnce({
        response: {
          status: 304,
          headers: mockResponse.headers
        }
      });

      const result = await service.fetchUser('GameBayoumy');

      expect(result.data).toEqual(mockUser);
      expect(mockGet).toHaveBeenCalledWith('/users/GameBayoumy', {
        headers: { 'If-None-Match': '"abc123"' }
      });
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = {
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' },
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': '1640995200'
          }
        }
      };

      mockGet.mockRejectedValueOnce(rateLimitError);

      await expect(service.fetchUser('GameBayoumy')).rejects.toThrow(RateLimitError);
    });

    it('should handle user not found', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      };

      mockGet.mockRejectedValueOnce(notFoundError);

      await expect(service.fetchUser('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should handle network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockGet.mockRejectedValueOnce(networkError);

      await expect(service.fetchUser('GameBayoumy')).rejects.toThrow(NetworkError);
    });
  });

  describe('fetchRepositories', () => {
    it('should fetch repositories with pagination', async () => {
      const mockRepos = [mockRepository];
      const mockLanguageResponse = { data: mockRepository.languages };

      // Mock repository list response
      mockGet
        .mockResolvedValueOnce({
          data: mockRepos,
          headers: {
            'x-ratelimit-remaining': '4998',
            'x-ratelimit-limit': '5000',
            'x-ratelimit-reset': '1640995200'
          }
        })
        // Mock empty response for next page (end pagination)
        .mockResolvedValueOnce({
          data: [],
          headers: {
            'x-ratelimit-remaining': '4997',
            'x-ratelimit-limit': '5000',
            'x-ratelimit-reset': '1640995200'
          }
        })
        // Mock language response
        .mockResolvedValueOnce(mockLanguageResponse);

      const result = await service.fetchRepositories('GameBayoumy');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockRepository);
      expect(mockGet).toHaveBeenCalledWith('/users/GameBayoumy/repos', {
        params: {
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
          page: 1,
          type: 'all'
        }
      });
      expect(mockGet).toHaveBeenCalledWith(`/repos/${mockRepository.full_name}/languages`);
    });

    it('should handle empty repository list', async () => {
      mockGet.mockResolvedValueOnce({
        data: [],
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200'
        }
      });

      const result = await service.fetchRepositories('GameBayoumy');

      expect(result.data).toEqual([]);
    });

    it('should continue on language fetch errors', async () => {
      const mockRepos = [{ ...mockRepository, languages: undefined }];

      mockGet
        .mockResolvedValueOnce({
          data: mockRepos,
          headers: {
            'x-ratelimit-remaining': '4998'
          }
        })
        .mockResolvedValueOnce({ data: [] }) // End pagination
        .mockRejectedValueOnce(new Error('Language fetch failed')); // Language error

      const result = await service.fetchRepositories('GameBayoumy');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].languages).toEqual({});
    });
  });

  describe('fetchUserEvents', () => {
    const mockEvent: GitHubEvent = {
      id: 'event123',
      type: 'PushEvent',
      created_at: '2024-01-01T00:00:00Z',
      repo: {
        name: 'GameBayoumy/awesome-project',
        url: 'https://api.github.com/repos/GameBayoumy/awesome-project'
      },
      payload: {
        commits: [{
          sha: 'commit123',
          message: 'Add new feature',
          author: {
            name: 'Sharif Bayoumy',
            email: 'sharif@example.com'
          },
          url: 'https://api.github.com/repos/GameBayoumy/awesome-project/commits/commit123'
        }]
      }
    };

    it('should fetch user events successfully', async () => {
      const mockResponse = {
        data: [mockEvent],
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200'
        }
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.fetchUserEvents('GameBayoumy');

      expect(mockGet).toHaveBeenCalledWith('/users/GameBayoumy/events/public', {
        params: {
          per_page: 100,
          page: 1
        }
      });
      expect(result.data).toEqual([mockEvent]);
    });

    it('should filter irrelevant events', async () => {
      const irrelevantEvent = {
        ...mockEvent,
        type: 'FollowEvent'
      };

      const mockResponse = {
        data: [mockEvent, irrelevantEvent],
        headers: {
          'x-ratelimit-remaining': '4999'
        }
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.fetchUserEvents('GameBayoumy');

      // Should only include relevant events (PushEvent, not FollowEvent)
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('PushEvent');
    });
  });

  describe('fetchContributions', () => {
    const mockContributionData = {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 365,
            weeks: [
              {
                contributionDays: [
                  {
                    contributionCount: 5,
                    date: '2024-01-01',
                    color: '#40c463'
                  },
                  {
                    contributionCount: 0,
                    date: '2024-01-02',
                    color: '#ebedf0'
                  }
                ]
              }
            ]
          }
        }
      }
    };

    it('should fetch contribution data successfully', async () => {
      const mockResponse = {
        data: { data: mockContributionData },
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200'
        }
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await service.fetchContributions('GameBayoumy', 2024);

      expect(mockPost).toHaveBeenCalledWith('/graphql', {
        query: expect.stringContaining('contributionsCollection'),
        variables: {
          username: 'GameBayoumy',
          from: '2024-01-01T00:00:00Z',
          to: '2024-12-31T23:59:59Z'
        }
      });
      expect(result.data).toBeDefined();
      expect(result.data.totalContributions).toBe(365);
    });

    it('should handle GraphQL errors', async () => {
      const graphqlError = {
        response: {
          status: 200,
          data: {
            errors: [{ message: 'Field not found' }]
          }
        }
      };

      mockPost.mockResolvedValueOnce(graphqlError);

      await expect(service.fetchContributions('GameBayoumy', 2024)).rejects.toThrow();
    });
  });

  describe('rate limiting', () => {
    it('should wait when rate limit is low', async () => {
      const spy = vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return 1 as any;
      });

      // Mock low rate limit
      mockGet.mockResolvedValueOnce({
        data: mockUser,
        headers: {
          'x-ratelimit-remaining': '5',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
        }
      });

      await service.fetchUser('GameBayoumy');

      spy.mockRestore();
    });
  });

  describe('data validation', () => {
    it('should validate user data', async () => {
      const invalidUser = { ...mockUser, login: null };

      mockGet.mockResolvedValueOnce({
        data: invalidUser,
        headers: { 'x-ratelimit-remaining': '4999' }
      });

      await expect(service.fetchUser('GameBayoumy')).rejects.toThrow('Invalid user data');
    });

    it('should validate repository data', async () => {
      const invalidRepo = { ...mockRepository, name: null };

      mockGet
        .mockResolvedValueOnce({
          data: [invalidRepo],
          headers: { 'x-ratelimit-remaining': '4998' }
        })
        .mockResolvedValueOnce({ data: [] });

      await expect(service.fetchRepositories('GameBayoumy')).rejects.toThrow('Invalid repository data');
    });
  });
});