'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProcessedGitHubEvent } from '@/services/github-api';

interface TimelineAxisProps {
  events: ProcessedGitHubEvent[];
  width: number;
  height: number;
  timeRange: [Date, Date];
  onTimeRangeChange?: (range: [Date, Date]) => void;
  className?: string;
}

export const TimelineAxis: React.FC<TimelineAxisProps> = ({
  events,
  width,
  height,
  timeRange,
  onTimeRangeChange,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !events.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 20, bottom: 30, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create time scale
    const xScale = d3.scaleTime()
      .domain(timeRange)
      .range([0, innerWidth]);

    // Create axis
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickFormat(((d: any) => {
        const date = d as Date;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          return d3.timeFormat('%a %m/%d')(date);
        } else if (diffDays <= 30) {
          return d3.timeFormat('%m/%d')(date);
        } else {
          return d3.timeFormat('%m/%y')(date);
        }
      }) as any);

    // Add axis
    const axisGroup = g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Style axis
    axisGroup.selectAll('.domain')
      .style('stroke', '#374151');

    axisGroup.selectAll('.tick line')
      .style('stroke', '#374151')
      .style('opacity', 0.3);

    axisGroup.selectAll('.tick text')
      .style('fill', '#9CA3AF')
      .style('font-size', '11px');

    // Group events by time periods for overview
    const timeFormat = d3.timeDay;
    const eventsByPeriod = d3.rollup(
      events,
      v => v.length,
      d => timeFormat(d.timestamp)
    );

    // Create mini histogram
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Array.from(eventsByPeriod.values())) || 0])
      .range([innerHeight - 20, 5]);

    const bars = g.selectAll('.time-bar')
      .data(Array.from(eventsByPeriod.entries()))
      .enter()
      .append('rect')
      .attr('class', 'time-bar')
      .attr('x', d => xScale(d[0]))
      .attr('y', d => yScale(d[1]))
      .attr('width', Math.max(1, innerWidth / eventsByPeriod.size - 1))
      .attr('height', d => innerHeight - 20 - yScale(d[1]))
      .style('fill', '#06b6d4')
      .style('opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('opacity', 0.8);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'timeline-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('opacity', 0);

        tooltip.html(`
          <div>
            <strong>${d3.timeFormat('%B %d, %Y')(d[0])}</strong><br/>
            ${d[1]} event${d[1] !== 1 ? 's' : ''}
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.6);
        
        d3.selectAll('.timeline-tooltip').remove();
      })
      .on('click', function(event, d) {
        // Center the view on this time period
        const startTime = d3.timeDay.offset(d[0], -3);
        const endTime = d3.timeDay.offset(d[0], 3);
        
        if (onTimeRangeChange) {
          onTimeRangeChange([startTime, endTime]);
        }
      });

    // Add brush for time range selection
    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('end', (event) => {
        if (!event.selection) return;
        
        const [x0, x1] = event.selection as [number, number];
        const newRange: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)];
        
        if (onTimeRangeChange) {
          onTimeRangeChange(newRange);
        }
      });

    // Add brush overlay
    const brushGroup = g.append('g')
      .attr('class', 'brush')
      .call(brush);

    // Style brush
    brushGroup.selectAll('.overlay')
      .style('cursor', 'crosshair');

    brushGroup.selectAll('.selection')
      .style('fill', '#06b6d4')
      .style('opacity', 0.2)
      .style('stroke', '#06b6d4');

    brushGroup.selectAll('.handle')
      .style('fill', '#06b6d4')
      .style('stroke', '#06b6d4');

    // Add current time indicator
    const now = new Date();
    if (now >= timeRange[0] && now <= timeRange[1]) {
      g.append('line')
        .attr('class', 'current-time')
        .attr('x1', xScale(now))
        .attr('x2', xScale(now))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .style('stroke', '#ef4444')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '4,4')
        .style('opacity', 0.8);

      // Add "now" label
      g.append('text')
        .attr('x', xScale(now))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('fill', '#ef4444')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text('NOW');
    }

  }, [events, width, height, timeRange, onTimeRangeChange]);

  return (
    <div className={`timeline-axis ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
    </div>
  );
};