'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { gitHubApi, type ProcessedGitHubEvent } from '@/services/github-api';
import { GitHubRepository } from '@/types/github';
import { TimelineAxis } from './TimelineAxis';
import { TimelineEvent } from './TimelineEvent';
import { TimelineFilters } from './TimelineFilters';
import { 
  Calendar, 
  GitCommit, 
  GitPullRequest, 
  Bug, 
  Star, 
  GitFork, 
  Tag,
  Plus,
  Loader2,
  RefreshCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export interface ActivityTimelineProps {
  repositories: GitHubRepository[];
  className?: string;
}

export type EventType = 'all' | 'PushEvent' | 'PullRequestEvent' | 'IssuesEvent' | 'CreateEvent' | 'WatchEvent' | 'ForkEvent' | 'ReleaseEvent';

interface TimelineState {
  events: ProcessedGitHubEvent[];
  filteredEvents: ProcessedGitHubEvent[];
  loading: boolean;
  error: string | null;
  selectedEvent: ProcessedGitHubEvent | null;
  zoomLevel: number;
  timeRange: [Date, Date] | null;
  selectedRepo: string;
  eventTypeFilter: EventType;
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PushEvent: GitCommit,
  PullRequestEvent: GitPullRequest,
  IssuesEvent: Bug,
  WatchEvent: Star,
  ForkEvent: GitFork,
  ReleaseEvent: Tag,
  CreateEvent: Plus,
};

const EVENT_COLORS: Record<string, string> = {
  PushEvent: '#22c55e',
  PullRequestEvent: '#8b5cf6',
  IssuesEvent: '#ef4444',
  WatchEvent: '#eab308',
  ForkEvent: '#f59e0b',
  ReleaseEvent: '#06b6d4',
  CreateEvent: '#3b82f6',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ repositories, className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  const [state, setState] = useState<TimelineState>({
    events: [],
    filteredEvents: [],
    loading: true,
    error: null,
    selectedEvent: null,
    zoomLevel: 1,
    timeRange: null,
    selectedRepo: 'all',
    eventTypeFilter: 'all',
  });

  // Load activity data
  const loadActivity = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const allEvents: ProcessedGitHubEvent[] = [];
      
      // Load multiple pages of activity
      for (let page = 1; page <= 3; page++) {
        const events = await gitHubApi.getProcessedActivity(page);
        allEvents.push(...events);
      }
      
      // Sort by timestamp (newest first)
      allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setState(prev => ({ 
        ...prev, 
        events: allEvents,
        filteredEvents: allEvents,
        loading: false,
        timeRange: allEvents.length > 0 ? [
          new Date(Math.min(...allEvents.map(e => e.timestamp.getTime()))),
          new Date(Math.max(...allEvents.map(e => e.timestamp.getTime())))
        ] : null
      }));
    } catch (error) {
      console.error('Failed to load activity:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load GitHub activity data' 
      }));
    }
  }, []);

  // Filter events based on filters
  const filteredEvents = useMemo(() => {
    let filtered = state.events;
    
    // Filter by event type
    if (state.eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === state.eventTypeFilter);
    }
    
    // Filter by repository
    if (state.selectedRepo !== 'all') {
      filtered = filtered.filter(event => event.repository.includes(state.selectedRepo));
    }
    
    return filtered;
  }, [state.events, state.eventTypeFilter, state.selectedRepo]);

  // Update filtered events
  useEffect(() => {
    setState(prev => ({ ...prev, filteredEvents }));
  }, [filteredEvents]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width - 32, // Account for padding
          height: Math.max(400, Math.min(600, rect.width * 0.6))
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data load
  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  // D3 Timeline Visualization
  useEffect(() => {
    if (!svgRef.current || state.loading || !state.filteredEvents.length || !state.timeRange) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const container = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = container
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(state.timeRange)
      .range([0, width]);

    // Group events by day for better visualization
    const eventsByDay = d3.group(state.filteredEvents, d => {
      const date = new Date(d.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const maxEventsPerDay = Math.max(...Array.from(eventsByDay.values()).map(events => events.length));
    
    const yScale = d3.scaleLinear()
      .domain([0, maxEventsPerDay])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%m/%d') as any)
      .ticks(Math.min(10, width / 80));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('d'));

    // Add axes
    (g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis as any) as any)
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px');

    (g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis as any) as any)
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px');

    // Add axis lines
    g.selectAll('.domain, .tick line')
      .style('stroke', '#374151');

    // Create timeline line
    const line = d3.line<[number, number]>()
      .x(d => xScale(new Date(d[0])))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    const lineData: [number, number][] = Array.from(eventsByDay.entries())
      .map(([timestamp, events]) => [timestamp, events.length] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    if (lineData.length > 1) {
      g.append('path')
        .datum(lineData)
        .attr('class', 'timeline-line')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', '#06b6d4')
        .style('stroke-width', 2)
        .style('opacity', 0.8);

      // Add area under curve
      const area = d3.area<[number, number]>()
        .x(d => xScale(new Date(d[0])))
        .y0(height)
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(lineData)
        .attr('class', 'timeline-area')
        .attr('d', area)
        .style('fill', 'url(#timelineGradient)')
        .style('opacity', 0.3);

      // Add gradient definition
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'timelineGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', height)
        .attr('x2', 0).attr('y2', 0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#06b6d4')
        .attr('stop-opacity', 0.1);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#06b6d4')
        .attr('stop-opacity', 0.4);
    }

    // Add event points
    const eventPoints = g.selectAll('.event-point')
      .data(Array.from(eventsByDay.entries()))
      .enter()
      .append('g')
      .attr('class', 'event-point')
      .attr('transform', d => `translate(${xScale(new Date(d[0]))},${yScale(d[1].length)})`);

    eventPoints.append('circle')
      .attr('r', d => Math.sqrt(d[1].length) * 2 + 3)
      .style('fill', d => {
        const eventTypes = d[1].map(e => e.type);
        const primaryType = eventTypes.sort((a, b) => 
          eventTypes.filter(t => t === b).length - eventTypes.filter(t => t === a).length
        )[0];
        return EVENT_COLORS[primaryType] || '#6b7280';
      })
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.sqrt(d[1].length) * 2 + 6)
          .style('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.sqrt(d[1].length) * 2 + 3)
          .style('opacity', 0.8);
      })
      .on('click', (event, d) => {
        setState(prev => ({ 
          ...prev, 
          selectedEvent: d[1][0] // Select first event of the day
        }));
      });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const { transform } = event;
        const newXScale = transform.rescaleX(xScale);
        
        // Update axes
        (g.select('.x-axis') as any).call(d3.axisBottom(newXScale).tickFormat(d3.timeFormat('%m/%d') as any));
        
        // Update line and points
        const newLine = d3.line<[number, number]>()
          .x(d => newXScale(new Date(d[0])))
          .y(d => yScale(d[1]))
          .curve(d3.curveMonotoneX);
          
        const newArea = d3.area<[number, number]>()
          .x(d => newXScale(new Date(d[0])))
          .y0(height)
          .y1(d => yScale(d[1]))
          .curve(d3.curveMonotoneX);
        
        g.select('.timeline-line')
          .attr('d', newLine(lineData) as any);
        
        g.select('.timeline-area')
          .attr('d', newArea(lineData) as any);
        
        g.selectAll('.event-point')
          .attr('transform', (d: any) => `translate(${newXScale(new Date(d[0]))},${yScale(d[1].length)})`);
      });

    svg.call(zoom);

  }, [state.filteredEvents, state.timeRange, state.loading, dimensions]);

  const handleEventTypeFilter = (eventType: EventType) => {
    setState(prev => ({ ...prev, eventTypeFilter: eventType }));
  };

  const handleRepoFilter = (repo: string) => {
    setState(prev => ({ ...prev, selectedRepo: repo }));
  };

  const handleZoomIn = () => {
    setState(prev => ({ ...prev, zoomLevel: Math.min(prev.zoomLevel * 1.5, 5) }));
  };

  const handleZoomOut = () => {
    setState(prev => ({ ...prev, zoomLevel: Math.max(prev.zoomLevel / 1.5, 0.5) }));
  };

  // Get unique repositories for filter
  const uniqueRepos = useMemo(() => {
    const repos = new Set(state.events.map(event => event.repository.split('/')[1]));
    return Array.from(repos).sort();
  }, [state.events]);

  if (state.error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <Bug className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Timeline</h3>
        <p className="text-gray-400 mb-4">{state.error}</p>
        <button
          onClick={loadActivity}
          className="flex items-center space-x-2 px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-neon-blue" />
          <h3 className="text-lg font-semibold text-white">GitHub Activity Timeline</h3>
          {state.loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={loadActivity}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <TimelineFilters
        eventTypeFilter={state.eventTypeFilter}
        selectedRepo={state.selectedRepo}
        repositories={uniqueRepos}
        onEventTypeChange={handleEventTypeFilter}
        onRepoChange={handleRepoFilter}
      />

      {/* Stats */}
      {!state.loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{state.filteredEvents.length}</div>
            <div className="text-sm text-gray-400">Events</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{uniqueRepos.length}</div>
            <div className="text-sm text-gray-400">Repositories</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {state.timeRange ? Math.ceil((state.timeRange[1].getTime() - state.timeRange[0].getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-gray-400">Days</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {new Set(state.filteredEvents.map(e => e.type)).size}
            </div>
            <div className="text-sm text-gray-400">Event Types</div>
          </div>
        </div>
      )}

      {/* Timeline Visualization */}
      <div ref={containerRef} className="relative bg-gray-900/30 rounded-lg p-4">
        {state.loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-neon-blue animate-spin" />
              <span className="text-gray-400">Loading activity timeline...</span>
            </div>
          </div>
        ) : state.filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            No events found for the selected filters
          </div>
        ) : (
          <svg ref={svgRef} className="w-full" />
        )}
      </div>

      {/* Recent Events List */}
      <div className="space-y-2">
        <h4 className="text-md font-medium text-white flex items-center space-x-2">
          <GitCommit className="w-4 h-4" />
          <span>Recent Activity</span>
        </h4>
        <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
          <AnimatePresence>
            {state.filteredEvents.slice(0, 20).map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TimelineEvent 
                  event={event} 
                  onClick={() => setState(prev => ({ ...prev, selectedEvent: event }))}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {state.selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setState(prev => ({ ...prev, selectedEvent: null }))}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <TimelineEvent 
                event={state.selectedEvent} 
                detailed={true}
                onClose={() => setState(prev => ({ ...prev, selectedEvent: null }))}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};