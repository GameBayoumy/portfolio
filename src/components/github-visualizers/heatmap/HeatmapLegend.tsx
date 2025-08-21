'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

const contributionLevels = [
  { level: 0, color: '#161b22', label: 'No contributions', range: '0' },
  { level: 1, color: '#0e4429', label: 'Low activity', range: '1-3' },
  { level: 2, color: '#006d32', label: 'Moderate activity', range: '4-6' },
  { level: 3, color: '#26a641', label: 'High activity', range: '7-9' },
  { level: 4, color: '#39d353', label: 'Very high activity', range: '10+' },
]

export function HeatmapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      {/* Simple Legend */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Less</span>
        <div className="flex items-center gap-1">
          {contributionLevels.map(({ level, color }) => (
            <motion.div
              key={level}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.5 + level * 0.1,
                type: 'spring',
                stiffness: 200
              }}
              className="w-3 h-3 rounded-sm border border-gray-700/30 hover:border-gray-500/50 transition-colors cursor-help"
              style={{ backgroundColor: color }}
              title={`${contributionLevels[level].label} (${contributionLevels[level].range} contributions)`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">More</span>
      </div>

      {/* Detailed Legend */}
      <div className="p-4 bg-glass-100 rounded-lg border border-glass-200">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-medium text-white">Activity Levels</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {contributionLevels.map(({ level, color, label, range }, index) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.6 + index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-glass-200 transition-colors group"
            >
              <div 
                className="w-3 h-3 rounded-sm border border-gray-600/50 group-hover:border-gray-400/50 transition-colors flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {label}
                </div>
                <div className="text-xs text-gray-400">
                  {range} contributions
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Color Guide */}
        <div className="mt-4 pt-4 border-t border-glass-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              GitHub-style contribution intensity
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-neon-green/50" />
              <span className="text-gray-400">Real-time updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized summary */}
      <div className="sm:hidden p-3 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg">
        <div className="text-xs text-gray-300 text-center">
          <span className="font-medium">Tip:</span> Tap on any day to view detailed contribution information
        </div>
      </div>
    </motion.div>
  )
}