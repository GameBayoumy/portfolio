'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'error';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

const variantClasses = {
  default: {
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  error: {
    bg: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400'
  }
};

const sizeClasses = {
  small: {
    padding: 'p-1',
    icon: 'w-3 h-3',
    text: 'text-xs'
  },
  medium: {
    padding: 'p-2',
    icon: 'w-4 h-4',
    text: 'text-sm'
  },
  large: {
    padding: 'px-3 py-2',
    icon: 'w-5 h-5',
    text: 'text-base'
  }
};

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'default',
  size = 'medium',
  className = '',
  'aria-label': ariaLabel = 'Refresh',
  children
}) => {
  const variantStyles = variantClasses[variant];
  const sizeStyles = sizeClasses[size];

  const handleClick = async () => {
    if (!disabled && !isLoading) {
      await onClick();
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        ${variantStyles.bg} ${variantStyles.border} ${variantStyles.text}
        border rounded-lg transition-all duration-200
        ${sizeStyles.padding} ${sizeStyles.text}
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={ariaLabel}
      type="button"
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size={size === 'large' ? 'medium' : 'small'} 
            className="mr-1"
            data-testid="refresh-spinner"
          />
          {children && <span className="ml-1">{children}</span>}
        </>
      ) : (
        <>
          <RefreshCw 
            className={`${sizeStyles.icon} ${variantStyles.icon} ${isLoading ? 'animate-spin' : ''}`} 
            aria-hidden="true"
          />
          {children && <span className="ml-2">{children}</span>}
        </>
      )}
    </button>
  );
};