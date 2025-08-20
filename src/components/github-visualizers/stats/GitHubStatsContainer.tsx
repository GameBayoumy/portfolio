'use client';

import React from 'react';
import { useGitHubStats } from '../../../hooks/useGitHubStats';
import { StatsGrid } from './StatsGrid';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { RefreshButton } from '../shared/RefreshButton';

interface GitHubStatsContainerProps {
  username: string;
  refreshInterval?: number;
  className?: string;
}

export const GitHubStatsContainer: React.FC<GitHubStatsContainerProps> = ({
  username,
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
  className = ''
}) => {
  const { data: stats, isLoading, error, refetch } = useGitHubStats(username, refreshInterval);

  if (isLoading && !stats) {
    return (
      <div 
        className={`flex items-center justify-center p-8 ${className}`}
        data-testid="stats-loading"
      >
        <LoadingSpinner 
          size="large" 
          aria-label="Loading GitHub statistics"
        />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading GitHub statistics...
        </span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div 
        className={`p-6 ${className}`}
        data-testid="stats-error"
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to load GitHub statistics
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error.message}
          </p>
          <RefreshButton 
            onClick={refetch}
            isLoading={isLoading}
            variant="error"
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div 
        className={`p-6 ${className}`}
        data-testid="stats-empty"
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          No GitHub statistics available
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback="Failed to render GitHub statistics">
      <div className={`space-y-4 ${className}`}>
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            GitHub Statistics
          </h2>
          <div className="flex items-center space-x-2">
            {stats.lastUpdate && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(stats.lastUpdate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
            <RefreshButton 
              onClick={refetch}
              isLoading={isLoading}
              aria-label="Refresh GitHub statistics"
            />
          </div>
        </div>

        {/* Stats grid */}
        <StatsGrid 
          stats={stats}
          isLoading={isLoading}
        />
      </div>
    </ErrorBoundary>
  );
};