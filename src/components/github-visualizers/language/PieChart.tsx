'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ChartSize, LanguageStats } from '../../../types/github.types';

interface PieChartProps {
  languages: LanguageStats[];
  size?: ChartSize;
  interactive?: boolean;
  respectMotionPreference?: boolean;
  onLanguageSelect?: (language: LanguageStats) => void;
  className?: string;
}

const sizeConfig = {
  small: { width: 200, height: 200, radius: 80 },
  medium: { width: 300, height: 300, radius: 120 },
  large: { width: 400, height: 400, radius: 160 }
};

export const PieChart: React.FC<PieChartProps> = ({
  languages,
  size = 'medium',
  interactive = true,
  respectMotionPreference = true,
  onLanguageSelect,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  const config = sizeConfig[size];
  const reducedMotion = respectMotionPreference && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!svgRef.current || !languages.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height, radius } = config;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Prepare data
    const pie = d3.pie<LanguageStats>()
      .value(d => d.percentage)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<LanguageStats>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3.arc<d3.PieArcDatum<LanguageStats>>()
      .innerRadius(0)
      .outerRadius(radius + 10);

    const arcs = pie(languages);

    // Create path elements
    const paths = g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default');

    // Add test ids for testing
    paths.each(function(d) {
      d3.select(this).attr('data-testid', `chart-segment-${d.data.name}`);
    });

    if (interactive) {
      paths
        .on('mouseenter', function(event, d) {
          const language = d.data.name;
          setHoveredLanguage(language);

          // Hover animation
          if (!reducedMotion) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', hoverArc);
          }

          // Show tooltip
          const rect = svgRef.current!.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            content: `${d.data.name}: ${d.data.percentage.toFixed(1)}%`
          });
        })
        .on('mouseleave', function() {
          setHoveredLanguage(null);
          
          // Reset hover animation
          if (!reducedMotion) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', arc);
          }

          // Hide tooltip
          setTooltip(prev => ({ ...prev, visible: false }));
        })
        .on('click', function(event, d) {
          onLanguageSelect?.(d.data);
        });
    }

    // Entry animation
    if (!reducedMotion) {
      paths
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .style('opacity', 1)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate(
            { startAngle: 0, endAngle: 0 },
            d
          );
          return function(t) {
            return arc(interpolate(t))!;
          };
        });
    }

    // Add labels for larger segments
    const labels = g.selectAll('text')
      .data(arcs.filter(d => d.data.percentage > 5)) // Only show labels for segments > 5%
      .enter()
      .append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#ffffff')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
      .text(d => d.data.percentage > 10 ? d.data.name : '');

    if (!reducedMotion) {
      labels
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay(800)
        .style('opacity', 1);
    }

  }, [languages, config, interactive, reducedMotion, onLanguageSelect]);

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={config.width}
        height={config.height}
        data-testid="language-chart"
        data-animation={reducedMotion ? 'reduced' : 'enabled'}
        role="img"
        aria-label="Language distribution pie chart"
      >
        <title>Programming language distribution by percentage</title>
      </svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-10 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
          data-testid="language-tooltip"
        >
          {tooltip.content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};