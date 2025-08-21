'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContributionDay } from '@/types/github'
import { Calendar, TrendingUp, GitCommit } from 'lucide-react'

interface HeatmapTooltipProps {
  day: ContributionDay | null
  visible: boolean
  position: { x: number; y: number }
}

export function HeatmapTooltip({ day, visible, position }: HeatmapTooltipProps) {
  const tooltipData = useMemo(() => {
    if (!day) return null

    const date = new Date(day.date)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    const shortDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })

    const contributionText = day.count === 0 
      ? 'No contributions' 
      : day.count === 1 
        ? '1 contribution' 
        : `${day.count} contributions`

    const activityLevel = day.level === 0 
      ? 'No activity'
      : day.level === 1
        ? 'Low activity'
        : day.level === 2
          ? 'Moderate activity'
          : day.level === 3
            ? 'High activity'
            : 'Very high activity'

    const levelColor = day.level === 0
      ? 'text-gray-400'
      : day.level === 1
        ? 'text-green-300'
        : day.level === 2
          ? 'text-green-200'
          : day.level === 3
            ? 'text-green-100'
            : 'text-neon-green'

    return {
      formattedDate,
      shortDate,
      contributionText,
      activityLevel,
      levelColor,
      isToday: date.toDateString() === new Date().toDateString(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    }
  }, [day])

  if (!tooltipData || !visible) return null

  // Adjust position to keep tooltip in viewport
  const adjustedPosition = useMemo(() => {
    const tooltipWidth = 280
    const tooltipHeight = 120
    const padding = 16

    let x = position.x + 10
    let y = position.y - 10

    // Adjust horizontal position
    if (typeof window !== 'undefined') {
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = position.x - tooltipWidth - 10
      }
      
      // Adjust vertical position
      if (y + tooltipHeight > window.innerHeight - padding) {
        y = position.y - tooltipHeight - 10
      }
      
      if (y < padding) {
        y = position.y + 20
      }
    }

    return { x, y }
  }, [position])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ 
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed z-50 pointer-events-none select-none"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
        >
          <div className="bg-black/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-2xl p-4 max-w-xs">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-neon-blue" />
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">
                  {tooltipData.shortDate}
                </span>
                {tooltipData.isToday && (
                  <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
                {tooltipData.isWeekend && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    Weekend
                  </span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400 mb-2">
              {tooltipData.formattedDate}
            </div>

            {/* Contributions */}
            <div className="flex items-center gap-2 mb-2">
              <GitCommit className="w-4 h-4 text-gray-400" />
              <span className="text-white font-semibold">
                {tooltipData.contributionText}
              </span>
            </div>

            {/* Activity Level */}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className={`text-sm font-medium ${tooltipData.levelColor}`}>
                {tooltipData.activityLevel}
              </span>
            </div>

            {/* Visual indicator */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Activity Level</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`w-2 h-2 rounded-sm transition-colors ${
                        level <= (day?.level || 0)
                          ? level === 0
                            ? 'bg-gray-600'
                            : level === 1
                              ? 'bg-green-800'
                              : level === 2
                                ? 'bg-green-600'
                                : level === 3
                                  ? 'bg-green-400'
                                  : 'bg-neon-green'
                          : 'bg-gray-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div 
            className="absolute w-3 h-3 bg-black/95 border-l border-t border-gray-700/50 transform rotate-45"
            style={{
              left: position.x > adjustedPosition.x ? '12px' : 'calc(100% - 24px)',
              top: position.y > adjustedPosition.y ? 'calc(100% - 6px)' : '-6px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}