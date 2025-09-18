'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import * as d3 from 'd3'
import { gitHubApi } from '@/services/github-api'
import { ContributionYear, ContributionDay } from '@/types/github'
import { HeatmapGrid } from './HeatmapGrid'
import { HeatmapTooltip } from './HeatmapTooltip'
import { HeatmapLegend } from './HeatmapLegend'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Activity } from 'lucide-react'

interface HeatmapTooltipData {
  date: string
  count: number
  level: number
}

interface HeatmapStats {
  totalContributions: number
  dailyAverage: number
  activeWeeks: number
  longestStreak: number
  currentStreak: number
  bestDay: ContributionDay | null
}

function HeatmapSkeleton() {
  return (
    <div className="glass-morphism p-8 rounded-xl">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="flex gap-2">
            {[...Array(53)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 h-4 bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export default function ContributionHeatmap() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { data: contributionData, isLoading, error } = useQuery({
    queryKey: ['github', 'contributions', selectedYear],
    queryFn: () => gitHubApi.getUserContributions(selectedYear),
    enabled: inView,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2
  })

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 2020 // Assume GitHub activity started in 2020
    const years = []
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year)
    }
    return years
  }, [])

  const heatmapData = useMemo(() => {
    if (!contributionData) return null

    const weeks: ContributionDay[][] = []
    const allDays = contributionData.weeks.flatMap(week => week.contributionDays)
    
    // Group days by week for proper calendar layout
    for (let i = 0; i < 53; i++) {
      const weekDays: ContributionDay[] = []
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j
        if (dayIndex < allDays.length) {
          weekDays.push(allDays[dayIndex])
        } else {
          // Fill empty days for incomplete weeks
          const date = new Date(selectedYear, 0, 1)
          date.setDate(date.getDate() + dayIndex)
          weekDays.push({
            date: date.toISOString().split('T')[0],
            count: 0,
            level: 0,
            weekday: j,
            week: i
          })
        }
      }
      weeks.push(weekDays)
    }

    return weeks
  }, [contributionData, selectedYear])

  const heatmapStats = useMemo((): HeatmapStats => {
    if (!contributionData) {
      return {
        totalContributions: 0,
        dailyAverage: 0,
        activeWeeks: 0,
        longestStreak: 0,
        currentStreak: 0,
        bestDay: null
      }
    }

    const allDays = contributionData.weeks.flatMap(week => week.contributionDays)
    const totalContributions = contributionData.totalContributions
    const activeWeeks = contributionData.weeks.filter(week => week.totalContributions > 0).length
    
    // Calculate streaks
    let longestStreak = 0
    let currentStreak = 0
    let tempStreak = 0
    
    allDays.forEach((day, index) => {
      if (day.count > 0) {
        tempStreak++
        if (index === allDays.length - 1 || allDays[index + 1]?.count === 0) {
          longestStreak = Math.max(longestStreak, tempStreak)
          if (index >= allDays.length - tempStreak) {
            currentStreak = tempStreak
          }
          tempStreak = 0
        }
      } else {
        tempStreak = 0
      }
    })

    // Find best day
    const bestDay = allDays.reduce((max, day) => 
      day.count > (max?.count || 0) ? day : max, null as ContributionDay | null
    )

    return {
      totalContributions,
      dailyAverage: Math.round(totalContributions / 365 * 10) / 10,
      activeWeeks,
      longestStreak,
      currentStreak,
      bestDay
    }
  }, [contributionData])

  const handleDayHover = useCallback((day: ContributionDay | null, event?: MouseEvent) => {
    setHoveredDay(day)
    if (day && event) {
      setTooltipPosition({ x: event.pageX, y: event.pageY })
      setShowTooltip(true)
    } else {
      setShowTooltip(false)
    }
  }, [])

  const handleDayClick = useCallback((day: ContributionDay) => {
    // Future: Could implement day detail modal
    console.log('Day clicked:', day)
  }, [])

  if (error) {
    return (
      <motion.div 
        ref={ref}
        className="glass-morphism p-8 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">GitHub Contribution Calendar</h3>
        <div className="text-center text-red-400">
          <p>Failed to load contribution data</p>
          <p className="text-sm text-gray-400 mt-2">Please try again later</p>
        </div>
      </motion.div>
    )
  }

  if (isLoading || !contributionData) {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeatmapSkeleton />
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className="glass-morphism p-8 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-neon-green" />
          <div>
            <h3 className="text-xl font-semibold text-white">GitHub Contributions</h3>
            <p className="text-gray-400 text-sm">Daily contribution activity</p>
          </div>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center gap-2 w-full justify-center sm:w-auto sm:justify-end">
          <button
            onClick={() => setSelectedYear(Math.min(selectedYear + 1, availableYears[0]))}
            disabled={selectedYear >= availableYears[0]}
            className="p-2 rounded-lg bg-glass-100 hover:bg-glass-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="View newer contributions"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-glass-100 text-white px-3 py-2 rounded-lg text-sm font-medium w-full sm:w-auto min-w-[5rem] text-center sm:text-left"
            aria-label="Select contribution year"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="bg-slate-800">
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSelectedYear(Math.max(selectedYear - 1, availableYears[availableYears.length - 1]))}
            disabled={selectedYear <= availableYears[availableYears.length - 1]}
            className="p-2 rounded-lg bg-glass-100 hover:bg-glass-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="View older contributions"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Contribution Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-glass-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-neon-green">
            {heatmapStats.totalContributions}
          </div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        
        <div className="p-4 bg-glass-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-neon-blue">
            {heatmapStats.dailyAverage}
          </div>
          <div className="text-xs text-gray-400">Daily Avg</div>
        </div>
        
        <div className="p-4 bg-glass-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-neon-purple">
            {heatmapStats.activeWeeks}
          </div>
          <div className="text-xs text-gray-400">Active Weeks</div>
        </div>

        <div className="p-4 bg-glass-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-neon-yellow">
            {heatmapStats.longestStreak}
          </div>
          <div className="text-xs text-gray-400">Best Streak</div>
        </div>

        <div className="p-4 bg-glass-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-neon-pink">
            {heatmapStats.currentStreak}
          </div>
          <div className="text-xs text-gray-400">Current</div>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div ref={containerRef} className="mb-6 overflow-x-auto">
        <div className="min-w-max p-4 bg-gradient-to-r from-slate-900/20 to-slate-800/20 rounded-lg">
          {heatmapData && (
            <HeatmapGrid
              data={heatmapData}
              year={selectedYear}
              onDayHover={handleDayHover}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      <HeatmapLegend />

      {/* Tooltip */}
      <HeatmapTooltip
        day={hoveredDay}
        visible={showTooltip}
        position={tooltipPosition}
      />

      {/* Best Day Highlight */}
      {heatmapStats.bestDay && (
        <div className="mt-6 p-4 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-lg border border-neon-green/20">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-neon-green" />
            <div>
              <div className="text-sm font-medium text-white">
                Best Day: {new Date(heatmapStats.bestDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-400">
                {heatmapStats.bestDay.count} contributions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-glass-100">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>
            Contribution data simulated based on repository activity • 
            Real GitHub contribution calendar requires GitHub API access
          </span>
        </div>
      </div>
    </motion.div>
  )
}