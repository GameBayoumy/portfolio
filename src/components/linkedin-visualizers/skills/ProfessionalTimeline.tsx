'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { 
  Calendar, 
  Award, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  User,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SkillTimeline, LINKEDIN_COLORS } from './types';

interface ProfessionalTimelineProps {
  timelines: SkillTimeline[];
}

type MilestoneType = 'certification' | 'project' | 'promotion' | 'training';

const milestoneIcons: Record<MilestoneType, any> = {
  certification: Award,
  project: Briefcase,
  promotion: TrendingUp,
  training: BookOpen
};

const milestoneColors: Record<MilestoneType, string> = {
  certification: '#f59e0b',
  project: '#059669',
  promotion: '#dc2626',
  training: '#7c3aed'
};

export function ProfessionalTimeline({ timelines }: ProfessionalTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<MilestoneType | 'all'>('all');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Process timeline data
  const processedTimelines = timelines.map(timeline => ({
    ...timeline,
    milestones: timeline.milestones.map(milestone => ({
      ...milestone,
      date: new Date(milestone.date)
    })).sort((a, b) => a.date.getTime() - b.date.getTime())
  }));

  // Get date range
  const dateExtent = d3.extent(
    processedTimelines.flatMap(t => t.milestones.map(m => m.date))
  ) as [Date, Date];

  // Filter by current year range (show 3 years at a time)
  const yearRange = [currentYear - 1, currentYear + 1];
  const visibleTimelines = processedTimelines.map(timeline => ({
    ...timeline,
    milestones: timeline.milestones.filter(milestone => {
      const year = milestone.date.getFullYear();
      const typeMatch = filterType === 'all' || milestone.type === filterType;
      return year >= yearRange[0] && year <= yearRange[1] && typeMatch;
    })
  })).filter(timeline => timeline.milestones.length > 0);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || visibleTimelines.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Set dimensions
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 40, right: 80, bottom: 60, left: 120 };
    const width = Math.max(800, containerRect.width) - margin.left - margin.right;
    const height = Math.max(400, visibleTimelines.length * 120) - margin.top - margin.bottom;
    
    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('overflow', 'visible');
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const timeScale = d3.scaleTime()
      .domain([new Date(yearRange[0], 0, 1), new Date(yearRange[1], 11, 31)])
      .range([0, width]);

    const skillScale = d3.scaleBand()
      .domain(visibleTimelines.map(t => t.skill))
      .range([0, height])
      .padding(0.2);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'timeline-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000')
      .style('max-width', '300px')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
      .style('border', `1px solid ${LINKEDIN_COLORS.primary}`);

    // Add time axis
    const timeAxis = d3.axisBottom(timeScale)
      .tickFormat((domainValue) => d3.timeFormat('%b %Y')(domainValue as Date))
      .ticks(d3.timeMonth.every(4) as any);

    g.append('g')
      .attr('class', 'time-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(timeAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', LINKEDIN_COLORS.secondaryText);

    // Add skill labels
    g.selectAll('.skill-label')
      .data(visibleTimelines)
      .enter()
      .append('text')
      .attr('class', 'skill-label')
      .attr('x', -10)
      .attr('y', d => (skillScale(d.skill) || 0) + skillScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', LINKEDIN_COLORS.primary)
      .style('cursor', 'pointer')
      .text(d => d.skill)
      .on('click', function(event, d) {
        setSelectedSkill(selectedSkill === d.skill ? null : d.skill);
      });

    // Add timeline lines
    visibleTimelines.forEach(timeline => {
      const y = (skillScale(timeline.skill) || 0) + skillScale.bandwidth() / 2;
      const milestones = timeline.milestones;
      
      if (milestones.length === 0) return;

      const lineStart = timeScale(milestones[0].date);
      const lineEnd = timeScale(milestones[milestones.length - 1].date);

      g.append('line')
        .attr('class', 'timeline-line')
        .attr('x1', lineStart)
        .attr('y1', y)
        .attr('x2', lineEnd)
        .attr('y2', y)
        .style('stroke', LINKEDIN_COLORS.border)
        .style('stroke-width', 3)
        .style('stroke-opacity', selectedSkill && selectedSkill !== timeline.skill ? 0.3 : 0.8);
    });

    // Add milestone groups
    const milestoneGroups = g.selectAll('.milestone-group')
      .data(visibleTimelines.flatMap(timeline => 
        timeline.milestones.map(milestone => ({
          ...milestone,
          skill: timeline.skill
        }))
      ))
      .enter()
      .append('g')
      .attr('class', 'milestone-group')
      .attr('transform', d => {
        const x = timeScale(d.date);
        const y = (skillScale(d.skill) || 0) + skillScale.bandwidth() / 2;
        return `translate(${x}, ${y})`;
      })
      .style('opacity', d => selectedSkill && selectedSkill !== d.skill ? 0.4 : 1)
      .style('cursor', 'pointer');

    // Add milestone circles
    milestoneGroups
      .append('circle')
      .attr('r', 8)
      .style('fill', d => milestoneColors[d.type])
      .style('stroke', 'white')
      .style('stroke-width', 3)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 12);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; color: ${LINKEDIN_COLORS.accent}; margin-bottom: 6px;">
              ${d.event}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Skill:</strong> ${d.skill}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Date:</strong> ${d.date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Type:</strong> ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}
            </div>
            ${d.description ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444; font-size: 12px; color: #ccc;">
                ${d.description}
              </div>
            ` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);
        
        tooltip.style('opacity', 0);
      });

    // Add milestone type icons (using text symbols)
    milestoneGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => {
        switch (d.type) {
          case 'certification': return '🏆';
          case 'project': return '💼';
          case 'promotion': return '📈';
          case 'training': return '📚';
          default: return '•';
        }
      });

    // Add year markers
    const years = d3.timeYear.range(
      new Date(yearRange[0], 0, 1), 
      new Date(yearRange[1] + 1, 0, 1)
    );

    g.selectAll('.year-marker')
      .data(years)
      .enter()
      .append('line')
      .attr('class', 'year-marker')
      .attr('x1', d => timeScale(d))
      .attr('y1', -20)
      .attr('x2', d => timeScale(d))
      .attr('y2', height + 20)
      .style('stroke', LINKEDIN_COLORS.border)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '2,2')
      .style('stroke-opacity', 0.3);

    g.selectAll('.year-label')
      .data(years)
      .enter()
      .append('text')
      .attr('class', 'year-label')
      .attr('x', d => timeScale(d))
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', LINKEDIN_COLORS.primary)
      .text(d => d.getFullYear());

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [visibleTimelines, selectedSkill, currentYear, filterType]);

  const canNavigatePrev = currentYear > (dateExtent[0]?.getFullYear() || 2018);
  const canNavigateNext = currentYear < (dateExtent[1]?.getFullYear() || new Date().getFullYear());

  const milestoneTypeCounts = processedTimelines.reduce((acc, timeline) => {
    timeline.milestones.forEach(milestone => {
      acc[milestone.type] = (acc[milestone.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<MilestoneType, number>);

  return (
    <motion.div 
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentYear(prev => prev - 1)}
            disabled={!canNavigatePrev}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {yearRange[0]} - {yearRange[1]}
            </h3>
            <p className="text-xs text-gray-500">Professional Timeline</p>
          </div>
          
          <button
            onClick={() => setCurrentYear(prev => prev + 1)}
            disabled={!canNavigateNext}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MilestoneType | 'all')}
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm"
            >
              <option value="all">All Types</option>
              <option value="certification">Certifications</option>
              <option value="project">Projects</option>
              <option value="promotion">Promotions</option>
              <option value="training">Training</option>
            </select>
          </div>

          {selectedSkill && (
            <button
              onClick={() => setSelectedSkill(null)}
              className="px-3 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Milestone Type Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        {Object.entries(milestoneColors).map(([type, color]) => {
          const Icon = milestoneIcons[type as MilestoneType];
          const count = milestoneTypeCounts[type as MilestoneType] || 0;
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline Visualization */}
      <div 
        ref={containerRef} 
        className="bg-white border border-gray-200 rounded-lg p-6 overflow-x-auto"
        style={{ minHeight: '500px' }}
      >
        {visibleTimelines.length > 0 ? (
          <svg ref={svgRef}></svg>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline data</h3>
              <p className="text-gray-500">
                No professional milestones found for the selected time period and filters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Skill Details */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                {selectedSkill} Development Journey
              </h3>
            </div>
            
            {(() => {
              const skillTimeline = processedTimelines.find(t => t.skill === selectedSkill);
              if (!skillTimeline) return null;
              
              return (
                <div className="space-y-3">
                  {skillTimeline.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: milestoneColors[milestone.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{milestone.event}</h4>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            {milestone.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {milestone.date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-gray-700 mt-1">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}