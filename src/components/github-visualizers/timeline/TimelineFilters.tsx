'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GitCommit, 
  GitPullRequest, 
  Bug, 
  Star, 
  GitFork, 
  Tag,
  Plus,
  Filter,
  X
} from 'lucide-react';

export type EventType = 'all' | 'PushEvent' | 'PullRequestEvent' | 'IssuesEvent' | 'CreateEvent' | 'WatchEvent' | 'ForkEvent' | 'ReleaseEvent';

interface TimelineFiltersProps {
  eventTypeFilter: EventType;
  selectedRepo: string;
  repositories: string[];
  onEventTypeChange: (eventType: EventType) => void;
  onRepoChange: (repo: string) => void;
  className?: string;
}

interface EventTypeInfo {
  id: EventType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const EVENT_TYPES: EventTypeInfo[] = [
  {
    id: 'all',
    label: 'All Events',
    icon: Filter,
    color: '#6b7280',
    description: 'Show all activity types'
  },
  {
    id: 'PushEvent',
    label: 'Commits',
    icon: GitCommit,
    color: '#22c55e',
    description: 'Code commits and pushes'
  },
  {
    id: 'PullRequestEvent',
    label: 'Pull Requests',
    icon: GitPullRequest,
    color: '#8b5cf6',
    description: 'Pull request activity'
  },
  {
    id: 'IssuesEvent',
    label: 'Issues',
    icon: Bug,
    color: '#ef4444',
    description: 'Issue management'
  },
  {
    id: 'CreateEvent',
    label: 'Created',
    icon: Plus,
    color: '#3b82f6',
    description: 'Repository or branch creation'
  },
  {
    id: 'WatchEvent',
    label: 'Stars',
    icon: Star,
    color: '#eab308',
    description: 'Repository stars'
  },
  {
    id: 'ForkEvent',
    label: 'Forks',
    icon: GitFork,
    color: '#f59e0b',
    description: 'Repository forks'
  },
  {
    id: 'ReleaseEvent',
    label: 'Releases',
    icon: Tag,
    color: '#06b6d4',
    description: 'Version releases'
  }
];

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  eventTypeFilter,
  selectedRepo,
  repositories,
  onEventTypeChange,
  onRepoChange,
  className = ''
}) => {
  const clearFilters = () => {
    onEventTypeChange('all');
    onRepoChange('all');
  };

  const hasActiveFilters = eventTypeFilter !== 'all' || selectedRepo !== 'all';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Event Type Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Event Types</span>
          </h4>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((eventType) => {
            const isActive = eventTypeFilter === eventType.id;
            const IconComponent = eventType.icon;
            
            return (
              <motion.button
                key={eventType.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEventTypeChange(eventType.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-700/50'
                }`}
                style={isActive ? {
                  backgroundColor: `${eventType.color}20`,
                  borderColor: eventType.color,
                  color: eventType.color,
                  border: '1px solid'
                } : {}}
                title={eventType.description}
              >
                <IconComponent className="w-3 h-3" />
                <span>{eventType.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Repository Filter */}
      {repositories.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Repository</h4>
          <div className="relative">
            <select
              value={selectedRepo}
              onChange={(e) => onRepoChange(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Repositories ({repositories.length})</option>
              {repositories.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </select>
            
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-2 p-3 bg-gray-800/20 rounded-lg border border-gray-700/50"
        >
          <span className="text-xs text-gray-400">Active filters:</span>
          
          {eventTypeFilter !== 'all' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-700/50 rounded text-xs">
              <span>Type: {EVENT_TYPES.find(t => t.id === eventTypeFilter)?.label}</span>
              <button
                onClick={() => onEventTypeChange('all')}
                className="text-gray-400 hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {selectedRepo !== 'all' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-700/50 rounded text-xs">
              <span>Repo: {selectedRepo}</span>
              <button
                onClick={() => onRepoChange('all')}
                className="text-gray-400 hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};