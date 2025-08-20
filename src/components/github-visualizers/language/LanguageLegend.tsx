'use client';

import React from 'react';
import type { LanguageStats } from '../../../types/github.types';

interface LanguageLegendProps {
  languages: LanguageStats[];
  onLanguageSelect?: (language: LanguageStats) => void;
  interactive?: boolean;
  maxItems?: number;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000) {
    return `${(bytes / 1000000).toFixed(1)} MB`;
  }
  if (bytes >= 1000) {
    return `${(bytes / 1000).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

export const LanguageLegend: React.FC<LanguageLegendProps> = ({
  languages,
  onLanguageSelect,
  interactive = true,
  maxItems = 10,
  className = ''
}) => {
  const displayLanguages = languages.slice(0, maxItems);
  const hasMore = languages.length > maxItems;

  const handleLanguageClick = (language: LanguageStats) => {
    if (interactive && onLanguageSelect) {
      onLanguageSelect(language);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, language: LanguageStats) => {
    if ((event.key === 'Enter' || event.key === ' ') && interactive) {
      event.preventDefault();
      handleLanguageClick(language);
    }
  };

  return (
    <div className={className}>
      <ul
        className="space-y-2"
        data-testid="language-legend"
        role="list"
        aria-label="Programming languages legend"
      >
        {displayLanguages.map((language, index) => (
          <li
            key={language.name}
            className={`
              flex items-center justify-between p-3 rounded-lg border
              bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
              ${interactive ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500' : ''}
              transition-colors duration-200
            `}
            onClick={() => handleLanguageClick(language)}
            onKeyDown={(e) => handleKeyDown(e, language)}
            tabIndex={interactive ? 0 : -1}
            role="listitem"
            aria-label={`${language.name}: ${language.percentage.toFixed(1)}% (${formatBytes(language.bytes)})`}
          >
            {/* Language info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Color indicator */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: language.color }}
                aria-hidden="true"
              />
              
              {/* Language name and percentage */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {language.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-2">
                    {language.percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: language.color,
                      width: `${language.percentage}%`
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Byte count */}
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
              {formatBytes(language.bytes)}
            </div>
          </li>
        ))}
      </ul>

      {/* Show more indicator */}
      {hasMore && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            and {languages.length - maxItems} more languages
          </span>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Languages:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {languages.length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Size:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formatBytes(languages.reduce((sum, lang) => sum + lang.bytes, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};