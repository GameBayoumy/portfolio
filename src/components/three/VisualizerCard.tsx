'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisualizerConfig, PerformanceMetrics } from '@/types';

interface VisualizerCardProps {
  config: VisualizerConfig;
  isActive: boolean;
  onActivate: (id: string) => void;
  performance: PerformanceMetrics;
  className?: string;
}

const VisualizerCard = memo(function VisualizerCard({
  config,
  isActive,
  onActivate,
  performance,
  className = ''
}: VisualizerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = () => {
    if (!isActive) {
      setIsLoading(true);
      onActivate(config.id);
    }
  };

  useEffect(() => {
    if (isActive && isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive, isLoading]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'particles':
        return '✨';
      case 'geometry':
        return '🔷';
      case 'models':
        return '🎭';
      case 'effects':
        return '🌟';
      default:
        return '⚡';
    }
  };

  return (
    <motion.div
      className={`relative group cursor-pointer rounded-lg border transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-gray-700 bg-gradient-to-br from-gray-900/80 to-gray-800/60 hover:border-gray-600 hover:shadow-md hover:shadow-gray-700/20'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleActivate}
      layout
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getCategoryIcon(config.category)}</span>
            <h3 className="text-lg font-semibold text-white">{config.name}</h3>
          </div>
          <div className={`px-2 py-1 rounded border text-xs font-medium ${getComplexityColor(config.complexity)}`}>
            {config.complexity}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{config.description}</p>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 capitalize">{config.category}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500">{config.requiredFeatures.length} features</span>
          </div>
          
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2 text-green-400"
            >
              <span>{performance.fps}fps</span>
              <span>{performance.memoryUsage}mb</span>
            </motion.div>
          )}
        </div>

        {/* Active Status Indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-400">● Active</span>
              <span className="text-xs text-gray-500">Real-time metrics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Triangles:</span>
                <span className="text-white font-mono">{performance.triangles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Draw Calls:</span>
                <span className="text-white font-mono">{performance.drawCalls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Render Time:</span>
                <span className="text-white font-mono">{performance.renderTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Memory:</span>
                <span className="text-white font-mono">{performance.memoryUsage}mb</span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Performance</span>
                <span className={`font-medium ${
                  performance.fps >= 50 ? 'text-green-400' :
                  performance.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {performance.fps >= 50 ? 'Excellent' :
                   performance.fps >= 30 ? 'Good' : 'Poor'}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    performance.fps >= 50 ? 'bg-green-400' :
                    performance.fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(performance.fps / 60 * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <div className="relative mb-3">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-r-purple-500 rounded-full animate-spin-slow"></div>
              </div>
              <div className="text-sm text-gray-300 font-medium">Initializing</div>
              <div className="text-xs text-gray-500 mt-1">Loading {config.name}...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Glow Effect */}
      {isHovered && !isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Active Glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-sm pointer-events-none -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
});

export default VisualizerCard;