'use client';

import React from 'react';
import { StatCard } from './StatCard';
import type { GitHubStats } from '../../../types/github.types';
import { 
  Users, 
  UserPlus, 
  FolderGit2, 
  Star, 
  GitFork 
} from 'lucide-react';

interface StatsGridProps {
  stats: GitHubStats;
  isLoading?: boolean;
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  isLoading = false,
  className = ''
}) => {
  const statCards = [
    {
      id: 'followers',
      label: 'Followers',
      value: formatNumber(stats.followers),
      rawValue: stats.followers,
      icon: <Users className="w-6 h-6" />,
      trend: stats.followersTrend,
      color: 'blue'
    },
    {
      id: 'following',
      label: 'Following',
      value: formatNumber(stats.following),
      rawValue: stats.following,
      icon: <UserPlus className="w-6 h-6" />,
      color: 'green'
    },
    {
      id: 'repositories',
      label: 'Repositories',
      value: formatNumber(stats.publicRepos),
      rawValue: stats.publicRepos,
      icon: <FolderGit2 className="w-6 h-6" />,
      color: 'purple'
    },
    {
      id: 'stars',
      label: 'Total Stars',
      value: formatNumber(stats.totalStars),
      rawValue: stats.totalStars,
      icon: <Star className="w-6 h-6" />,
      trend: stats.starsTrend,
      color: 'yellow'
    },
    {
      id: 'forks',
      label: 'Total Forks',
      value: formatNumber(stats.totalForks),
      rawValue: stats.totalForks,
      icon: <GitFork className="w-6 h-6" />,
      trend: stats.forksTrend,
      color: 'indigo'
    }
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}
      data-testid="stats-grid"
      role="region"
      aria-label="GitHub statistics"
    >
      {statCards.map((card) => (
        <StatCard
          key={card.id}
          icon={card.icon}
          label={card.label}
          value={card.value}
          rawValue={card.rawValue}
          trend={card.trend}
          color={card.color}
          loading={isLoading}
          aria-labelledby={`stat-${card.id}-label`}
          aria-describedby={`stat-${card.id}-description`}
        />
      ))}
    </div>
  );
};