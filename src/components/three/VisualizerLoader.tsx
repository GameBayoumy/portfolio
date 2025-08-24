'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizerLoaderProps {
  name: string;
  progress?: number;
  message?: string;
  showProgress?: boolean;
  className?: string;
}

const VisualizerLoader = memo(function VisualizerLoader({
  name,
  progress = 0,
  message = 'Initializing 3D environment...',
  showProgress = false,
  className = ''
}: VisualizerLoaderProps) {
  const [dots, setDots] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    'Loading shaders',
    'Initializing WebGL context',
    'Preparing geometries',
    'Setting up materials',
    'Optimizing performance',
    'Finalizing scene'
  ];

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate loading steps
  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % loadingSteps.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [showProgress, loadingSteps.length]);

  return (
    <div className={`flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 ${className}`}>
      {/* Main Loading Animation */}
      <div className="relative mb-6">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full absolute"></div>
        
        {/* Primary Spinner */}
        <motion.div
          className="w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Secondary Spinner */}
        <motion.div
          className="absolute inset-2 w-12 h-12 border-3 border-transparent border-r-purple-500 border-b-purple-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Center Dot */}
        <motion.div
          className="absolute inset-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * Math.PI / 3) * 30],
              y: [0, Math.sin(i * Math.PI / 3) * 30],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <motion.h3
          className="text-xl font-semibold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading {name}
        </motion.h3>
        
        <motion.p
          className="text-gray-400 flex items-center justify-center min-h-[1.5rem]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
          <span className="w-6 text-left">{dots}</span>
        </motion.p>

        {/* Loading Steps */}
        <AnimatePresence mode="wait">
          {showProgress && (
            <motion.div
              key={currentStep}
              className="text-sm text-blue-400 min-h-[1.25rem]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {loadingSteps[currentStep]}...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        {showProgress && progress > 0 && (
          <div className="w-64 mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Technical Info */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>WebGL 2.0 Ready</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span>Hardware Acceleration Enabled</span>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
          }}
        />
      </div>
    </div>
  );
});

export default VisualizerLoader;