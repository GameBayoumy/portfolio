'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProcessedGitHubEvent } from '@/services/github-api';
import { 
  GitCommit, 
  GitPullRequest, 
  Bug, 
  Star, 
  GitFork, 
  Tag,
  Plus,
  ExternalLink,
  Clock,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineEventProps {
  event: ProcessedGitHubEvent;
  onClick?: () => void;
  detailed?: boolean;
  onClose?: () => void;
  className?: string;
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PushEvent: GitCommit,
  PullRequestEvent: GitPullRequest,
  IssuesEvent: Bug,
  WatchEvent: Star,
  ForkEvent: GitFork,
  ReleaseEvent: Tag,
  CreateEvent: Plus,
};

export const TimelineEvent: React.FC<TimelineEventProps> = ({ 
  event, 
  onClick, 
  detailed = false, 
  onClose,
  className = '' 
}) => {
  const IconComponent = EVENT_ICONS[event.type] || GitCommit;
  const timeAgo = formatDistanceToNow(event.timestamp, { addSuffix: true });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  const openUrl = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (detailed) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${event.color}20`, color: event.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{event.message}</h3>
              <p className="text-sm text-gray-400 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Repository */}
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <span className="text-white font-medium">{event.repository}</span>
          <button
            onClick={(e) => openUrl(event.repositoryUrl, e)}
            className="flex items-center space-x-1 text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Repository</span>
          </button>
        </div>

        {/* Event Details */}
        {event.details && (
          <div className="space-y-3">
            {/* Commits */}
            {event.details.commits && event.details.commits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Commits</h4>
                <div className="space-y-2">
                  {event.details.commits.map((commit, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-gray-800/30 rounded">
                      <GitCommit className="w-4 h-4 text-green-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{commit.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-xs text-gray-400 bg-gray-700 px-1 rounded">
                            {commit.sha}
                          </code>
                          <button
                            onClick={(e) => openUrl(commit.url, e)}
                            className="text-xs text-neon-blue hover:underline"
                          >
                            View commit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issue */}
            {event.details.issue && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Issue</h4>
                <div className="p-3 bg-gray-800/30 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white">#{event.details.issue?.number}: {event.details.issue?.title}</p>
                    </div>
                    <button
                      onClick={(e) => openUrl(event.details.issue?.url || '', e)}
                      className="ml-2 text-neon-blue hover:text-neon-blue/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pull Request */}
            {event.details.pullRequest && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Pull Request</h4>
                <div className="p-3 bg-gray-800/30 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white">#{event.details.pullRequest?.number}: {event.details.pullRequest?.title}</p>
                    </div>
                    <button
                      onClick={(e) => openUrl(event.details.pullRequest?.url || '', e)}
                      className="ml-2 text-neon-blue hover:text-neon-blue/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Release */}
            {event.details.release && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Release</h4>
                <div className="p-3 bg-gray-800/30 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white">{event.details.release?.tag_name}: {event.details.release?.name}</p>
                    </div>
                    <button
                      onClick={(e) => openUrl(event.details.release?.url || '', e)}
                      className="ml-2 text-neon-blue hover:text-neon-blue/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Branch */}
            {event.details.branch && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Branch</h4>
                <div className="p-3 bg-gray-800/30 rounded">
                  <p className="text-white">
                    {event.details.branch?.type}: <code className="bg-gray-700 px-1 rounded">{event.details.branch?.name}</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actor */}
        <div className="flex items-center space-x-3 p-3 bg-gray-700/20 rounded-lg">
          <img
            src={event.actor.avatar_url}
            alt={event.actor.login}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-300">{event.actor.login}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-all group ${className}`}
      onClick={handleClick}
    >
      {/* Event Icon */}
      <div 
        className="flex-shrink-0 p-2 rounded-lg transition-colors group-hover:scale-110"
        style={{ backgroundColor: `${event.color}20`, color: event.color }}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Event Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-neon-blue transition-colors">
              {event.message}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-400 truncate">
                {event.repository.split('/')[1]}
              </p>
              <span className="text-xs text-gray-500">•</span>
              <p className="text-xs text-gray-400">
                {timeAgo}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => openUrl(event.repositoryUrl, e)}
            className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-neon-blue"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};