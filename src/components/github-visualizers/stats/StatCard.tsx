'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection } from '../../../types/github.types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  rawValue?: number;
  trend?: TrendDirection;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'red';
  loading?: boolean;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-900 dark:text-purple-100'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-100'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100'
  }
};

const getTrendIcon = (trend: TrendDirection) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-500" data-testid="trend-up" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-500" data-testid="trend-down" />;
    case 'neutral':
      return <Minus className="w-4 h-4 text-gray-500" data-testid="trend-neutral" />;
    default:
      return null;
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  rawValue,
  trend,
  color = 'blue',
  loading = false,
  className = '',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div
        className={`${colors.bg} ${colors.border} border rounded-lg p-6 ${className}`}
        role="article"
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${className}`}
      role="article"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-3">
        <div className={`${colors.icon}`}>
          {icon}
        </div>
        {trend && getTrendIcon(trend)}
      </div>

      {/* Value */}
      <div className="space-y-1">
        <div 
          className={`text-2xl font-bold ${colors.text}`}
          id={ariaLabelledBy}
        >
          {value}
        </div>
        
        {/* Label */}
        <div 
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
          id={ariaDescribedBy}
        >
          {label}
        </div>

        {/* Raw value for screen readers if different from formatted value */}
        {rawValue !== undefined && rawValue.toString() !== value.toString() && (
          <span className="sr-only">
            Exact value: {rawValue}
          </span>
        )}
      </div>
    </div>
  );
};