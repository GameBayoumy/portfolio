'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguageStats } from '../../../hooks/useLanguageStats';
import { PieChart } from './PieChart';
import { LanguageLegend } from './LanguageLegend';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import type { ChartSize, LanguageStats } from '../../../types/github.types';

interface LanguageDistributionProps {
  username: string;
  size?: ChartSize;
  interactive?: boolean;
  respectMotionPreference?: boolean;
  onLanguageSelect?: (language: LanguageStats) => void;
  className?: string;
}

export const LanguageDistribution: React.FC<LanguageDistributionProps> = ({
  username,
  size = 'medium',
  interactive = true,
  respectMotionPreference = true,
  onLanguageSelect,
  className = ''
}) => {
  const { data: languages, isLoading, error } = useLanguageStats(username);
  const chartRef = useRef<HTMLDivElement>(null);

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center p-8 ${className}`}
        data-testid="language-chart-loading"
      >
        <LoadingSpinner 
          size="large" 
          aria-label="Loading language distribution"
        />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading language distribution...
        </span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div 
        className={`p-6 ${className}`}
        data-testid="language-chart-error"
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to load language distribution
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!languages || languages.length === 0) {
    return (
      <div 
        className={`p-6 ${className}`}
        data-testid="language-empty-state"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No language data available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No programming languages found in repositories
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback="Failed to render language distribution">
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Language Distribution
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {languages.length} languages
          </span>
        </div>

        {/* Chart and Legend Container */}
        <div 
          className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8"
          data-testid="language-chart-container"
        >
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <PieChart
              languages={languages}
              size={size}
              interactive={interactive}
              respectMotionPreference={respectMotionPreference}
              onLanguageSelect={onLanguageSelect}
            />
          </div>

          {/* Legend */}
          <div className="flex-1 min-w-0">
            <LanguageLegend
              languages={languages}
              onLanguageSelect={onLanguageSelect}
              interactive={interactive}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};