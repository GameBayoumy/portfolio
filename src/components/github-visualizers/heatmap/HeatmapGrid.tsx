'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { ContributionDay } from '@/types/github'

interface HeatmapGridProps {
  data: ContributionDay[][]
  year: number
  onDayHover: (day: ContributionDay | null, event?: MouseEvent) => void
  onDayClick: (day: ContributionDay) => void
}

export function HeatmapGrid({ data, year, onDayHover, onDayClick }: HeatmapGridProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const dimensions = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const cellSize = isMobile ? 10 : 12
    const cellGap = isMobile ? 1 : 2
    const padding = { top: 40, right: 20, bottom: 20, left: 40 }
    
    const gridWidth = 53 * (cellSize + cellGap) - cellGap
    const gridHeight = 7 * (cellSize + cellGap) - cellGap
    
    return {
      cellSize,
      cellGap,
      padding,
      gridWidth,
      gridHeight,
      totalWidth: gridWidth + padding.left + padding.right,
      totalHeight: gridHeight + padding.top + padding.bottom
    }
  }, [])

  const colorScale = useMemo(() => {
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
    return d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4])
      .range(colors)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { cellSize, cellGap, padding, totalWidth, totalHeight } = dimensions

    svg
      .attr('width', totalWidth)
      .attr('height', totalHeight)
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)

    // Main container group
    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)

    // Month labels
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const monthsGroup = mainGroup.append('g').attr('class', 'months')

    monthLabels.forEach((month, i) => {
      // Calculate approximate week position for each month
      const date = new Date(year, i, 1)
      const startOfYear = new Date(year, 0, 1)
      const daysDiff = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor(daysDiff / 7)
      
      if (weekIndex < 53) {
        monthsGroup
          .append('text')
          .attr('x', weekIndex * (cellSize + cellGap))
          .attr('y', -10)
          .attr('font-size', '11px')
          .attr('fill', '#7d8590')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .attr('font-weight', '500')
          .text(month)
      }
    })

    // Day labels (Sun, Mon, Tue, etc.)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const visibleDayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
    
    const daysGroup = mainGroup.append('g').attr('class', 'days')

    visibleDayLabels.forEach((day, i) => {
      if (day) {
        daysGroup
          .append('text')
          .attr('x', -8)
          .attr('y', i * (cellSize + cellGap) + cellSize / 2)
          .attr('font-size', '10px')
          .attr('fill', '#7d8590')
          .attr('font-family', 'system-ui, -apple-system, sans-serif')
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'end')
          .text(day)
      }
    })

    // Contribution squares
    const weeksGroup = mainGroup.append('g').attr('class', 'weeks')

    const weekGroups = weeksGroup.selectAll('.week')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'week')
      .attr('transform', (d, i) => `translate(${i * (cellSize + cellGap)}, 0)`)

    const daySquares = weekGroups.selectAll('.day')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('class', 'day')
      .attr('x', 0)
      .attr('y', (d, i) => i * (cellSize + cellGap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => colorScale(d.level))
      .attr('stroke', '#21262d')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0)

    // Enhanced animations with staggered appearance
    daySquares
      .transition()
      .duration(600)
      .delay((d, i, nodes) => {
        // Stagger based on week and day
        const weekIndex = Math.floor(i / 7)
        const dayIndex = i % 7
        return weekIndex * 15 + dayIndex * 5
      })
      .ease(d3.easeBackOut.overshoot(1.2))
      .style('opacity', 1)
      .attr('transform', 'scale(1)')

    // Enhanced hover interactions
    daySquares
      .on('mouseover', function(event, d) {
        const rect = this as SVGRectElement
        
        // Highlight effect
        d3.select(rect)
          .transition()
          .duration(150)
          .attr('stroke-width', 2)
          .attr('stroke', d.count > 0 ? '#ffffff' : '#64748b')
          .attr('transform', 'scale(1.1)')
          .style('filter', 'brightness(1.2)')

        // Call hover handler
        onDayHover(d, event as any)
      })
      .on('mousemove', function(event) {
        onDayHover(null)
        onDayHover((this as any).__data__, event as any)
      })
      .on('mouseout', function(event, d) {
        const rect = this as SVGRectElement
        
        // Reset appearance
        d3.select(rect)
          .transition()
          .duration(150)
          .attr('stroke-width', 1)
          .attr('stroke', '#21262d')
          .attr('transform', 'scale(1)')
          .style('filter', 'brightness(1)')

        onDayHover(null)
      })
      .on('click', function(event, d) {
        event.stopPropagation()
        onDayClick(d)
        
        // Click animation
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(0.9)')
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
      })

    // Add subtle grid animations on load
    const gridLines = mainGroup.append('g').attr('class', 'grid-lines').lower()
    
    // Vertical grid lines (week separators)
    for (let i = 0; i <= 53; i += 4) {
      gridLines
        .append('line')
        .attr('x1', i * (cellSize + cellGap) - cellGap / 2)
        .attr('y1', -cellGap)
        .attr('x2', i * (cellSize + cellGap) - cellGap / 2)
        .attr('y2', 7 * (cellSize + cellGap))
        .attr('stroke', '#30363d')
        .attr('stroke-width', 0.5)
        .style('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity', 0.3)
    }

  }, [data, year, dimensions, colorScale, onDayHover, onDayClick])

  return (
    <div ref={containerRef} className="w-full">
      <svg 
        ref={svgRef} 
        className="w-full h-auto"
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  )
}