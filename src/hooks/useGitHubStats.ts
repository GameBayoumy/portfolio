import { useState, useEffect } from 'react';
import { gitHubApi } from '@/services/github-api';
import type { GitHubStats } from '@/types/github';

interface UseGitHubStatsReturn {
  data: GitHubStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGitHubStats(): UseGitHubStatsReturn {
  const [data, setData] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await gitHubApi.getGitHubStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
      console.error('GitHub stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchStats
  };
}