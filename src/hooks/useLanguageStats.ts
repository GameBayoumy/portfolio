import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { GitHubAPIService } from '../services/github/github-api.service';
import type { LanguageStats, GitHubDataHookResult } from '../types/github.types';

const githubService = new GitHubAPIService({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  userAgent: 'XR-Portfolio/1.0',
  token: process.env.NEXT_PUBLIC_GITHUB_TOKEN
});

// Language color mapping based on GitHub's official colors
const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C': '#555555',
  'C#': '#239120',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Swift': '#ffac45',
  'Kotlin': '#F18E33',
  'Dart': '#00B4AB',
  'CSS': '#563d7c',
  'HTML': '#e34c26',
  'Shell': '#89e051',
  'PowerShell': '#012456',
  'Dockerfile': '#384d54',
  'YAML': '#cb171e',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'Vue': '#4FC08D',
  'React': '#61DAFB',
  'Angular': '#DD0031'
};

const getLanguageColor = (language: string): string => {
  return LANGUAGE_COLORS[language] || '#8e8e93';
};

export const useLanguageStats = (
  username: string
): GitHubDataHookResult<LanguageStats[]> => {
  // Query for repositories data
  const reposQuery = useQuery({
    queryKey: ['github', 'repositories', username],
    queryFn: () => githubService.fetchRepositories(username),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: !!username
  });

  // Process language statistics from repository data
  const languageStats = useMemo(() => {
    if (!reposQuery.data?.data) {
      return [];
    }

    const repositories = reposQuery.data.data;
    const languageMap = new Map<string, number>();
    let totalBytes = 0;

    // Aggregate language data from all repositories
    repositories.forEach(repo => {
      if (repo.languages && Object.keys(repo.languages).length > 0) {
        Object.entries(repo.languages).forEach(([language, bytes]) => {
          const currentBytes = languageMap.get(language) || 0;
          languageMap.set(language, currentBytes + bytes);
          totalBytes += bytes;
        });
      }
    });

    // Convert to array and calculate percentages
    const languageArray = Array.from(languageMap.entries()).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
      color: getLanguageColor(name)
    }));

    // Sort by percentage (highest first) and return
    return languageArray
      .sort((a, b) => b.percentage - a.percentage)
      .filter(lang => lang.percentage > 0.1); // Filter out very small percentages
  }, [reposQuery.data]);

  return {
    data: languageStats,
    isLoading: reposQuery.isLoading,
    error: reposQuery.error,
    refetch: reposQuery.refetch,
    lastUpdated: reposQuery.dataUpdatedAt ? new Date(reposQuery.dataUpdatedAt).toISOString() : undefined
  };
};