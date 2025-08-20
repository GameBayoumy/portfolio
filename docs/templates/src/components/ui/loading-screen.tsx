'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  className?: string;
  message?: string;
  progress?: number;
  onComplete?: () => void;
}

/**
 * Loading screen component with animated progress indicator
 */
export function LoadingScreen({ 
  className,
  message = 'Loading Experience...',
  progress,
  onComplete
}: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Animate progress
  useEffect(() => {
    if (typeof progress === 'number') {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
        if (progress >= 100) {
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Auto-hide after 3 seconds if no progress provided
  useEffect(() => {
    if (typeof progress !== 'number') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md',
            className
          )}
        >
          {/* Animated logo/spinner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="h-24 w-24 animate-spin rounded-full border-4 border-muted"></div>
              
              {/* Inner ring with glow */}
              <div className="absolute inset-0 h-24 w-24 animate-pulse rounded-full border-4 border-primary glow-blue"></div>
              
              {/* Center dot */}
              <div className="absolute-center h-4 w-4 animate-pulse rounded-full bg-primary"></div>
            </div>
          </motion.div>

          {/* Loading message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-gradient-cyber">
              {message}
            </h2>
          </motion.div>

          {/* Progress bar (if progress provided) */}
          {typeof progress === 'number' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-64"
            >
              {/* Progress bar background */}
              <div className="mb-2 h-2 w-full rounded-full bg-muted/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                  style={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              
              {/* Progress text */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Loading...</span>
                <span>{Math.round(displayProgress)}%</span>
              </div>
            </motion.div>
          )}

          {/* Animated dots (if no progress provided) */}
          {typeof progress !== 'number' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex space-x-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="h-2 w-2 rounded-full bg-primary"
                />
              ))}
            </motion.div>
          )}

          {/* Subtle background pattern */}
          <div className="absolute inset-0 -z-10 grid-pattern opacity-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}