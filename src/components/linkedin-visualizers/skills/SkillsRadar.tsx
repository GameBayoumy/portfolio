'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Skill, LINKEDIN_COLORS, SKILL_LEVEL_COLORS } from './types';

interface SkillsRadarProps {
  skills: Skill[];
  selectedCategory?: string;
}

export function SkillsRadar({ skills, selectedCategory }: SkillsRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || skills.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Set dimensions
    const containerRect = container.getBoundingClientRect();
    const size = Math.min(containerRect.width, 500);
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 80;
    
    svg
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('margin', '0 auto');
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Filter skills by category if selected
    const filteredSkills = selectedCategory 
      ? skills.filter(skill => skill.category === selectedCategory)
      : skills;

    // Take top 8-10 skills for better visibility
    const topSkills = filteredSkills
      .sort((a, b) => b.level - a.level || b.endorsements - a.endorsements)
      .slice(0, Math.min(10, filteredSkills.length));

    if (topSkills.length === 0) return;

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, topSkills.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, radius]);

    // Create radial grid
    const gridLevels = [1, 2, 3, 4, 5];
    
    // Add grid circles
    g.selectAll('.grid-circle')
      .data(gridLevels)
      .enter()
      .append('circle')
      .attr('class', 'grid-circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d => radiusScale(d))
      .style('fill', 'none')
      .style('stroke', LINKEDIN_COLORS.border)
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.3);

    // Add grid level labels
    g.selectAll('.grid-label')
      .data(gridLevels)
      .enter()
      .append('text')
      .attr('class', 'grid-label')
      .attr('x', 0)
      .attr('y', d => -radiusScale(d))
      .attr('dy', '-0.3em')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', LINKEDIN_COLORS.secondaryText)
      .style('font-weight', '500')
      .text(d => {
        const labels = ['', 'Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'];
        return labels[d];
      });

    // Add radial grid lines
    topSkills.forEach((skill, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      g.append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', LINKEDIN_COLORS.border)
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.2);
    });

    // Create radar area path
    const line = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinalClosed);

    const areaPoints: [number, number][] = topSkills.map((skill, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(skill.level);
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });

    // Add radar area
    g.append('path')
      .datum(areaPoints)
      .attr('class', 'radar-area')
      .attr('d', line)
      .style('fill', LINKEDIN_COLORS.primary)
      .style('fill-opacity', 0.2)
      .style('stroke', LINKEDIN_COLORS.primary)
      .style('stroke-width', 2);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'skills-radar-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
      .style('border', `1px solid ${LINKEDIN_COLORS.primary}`);

    // Add skill points
    const skillPoints = g.selectAll('.skill-point')
      .data(topSkills)
      .enter()
      .append('g')
      .attr('class', 'skill-point');

    skillPoints.each(function(skill, i) {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(skill.level);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      const point = d3.select(this);
      
      // Add skill point circle
      point.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 6)
        .style('fill', SKILL_LEVEL_COLORS[skill.level as keyof typeof SKILL_LEVEL_COLORS])
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
        .on('mouseover', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8);
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: 600; color: ${LINKEDIN_COLORS.accent}; margin-bottom: 4px;">
                ${skill.name}
              </div>
              <div style="margin-bottom: 2px;">
                <strong>Level:</strong> ${skill.level}/5 
                ${['', 'Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'][skill.level]}
              </div>
              <div style="margin-bottom: 2px;">
                <strong>Endorsements:</strong> ${skill.endorsements}
              </div>
              <div style="margin-bottom: 2px;">
                <strong>Experience:</strong> ${skill.yearsOfExperience} years
              </div>
              <div style="font-size: 12px; color: #ccc;">
                Category: ${skill.category}
              </div>
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
            .attr('r', 6);
          
          tooltip.style('opacity', 0);
        });
    });

    // Add skill labels
    const labelRadius = radius + 25;
    skillPoints.each(function(skill, i) {
      const angle = angleScale(i) - Math.PI / 2;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;
      
      const point = d3.select(this);
      
      point.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', '0.35em')
        .attr('text-anchor', x > 0 ? 'start' : x < 0 ? 'end' : 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', LINKEDIN_COLORS.text)
        .style('pointer-events', 'none')
        .text(skill.name);
      
      // Add level indicator
      point.append('text')
        .attr('x', x)
        .attr('y', y + 14)
        .attr('dy', '0.35em')
        .attr('text-anchor', x > 0 ? 'start' : x < 0 ? 'end' : 'middle')
        .style('font-size', '10px')
        .style('fill', SKILL_LEVEL_COLORS[skill.level as keyof typeof SKILL_LEVEL_COLORS])
        .style('font-weight', '500')
        .style('pointer-events', 'none')
        .text(`Level ${skill.level}`);
    });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [skills, selectedCategory]);

  if (skills.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>No skills data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div 
        ref={containerRef} 
        className="flex justify-center items-center"
        style={{ minHeight: '500px' }}
      >
        <svg ref={svgRef}></svg>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {[1, 2, 3, 4, 5].map(level => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: SKILL_LEVEL_COLORS[level as keyof typeof SKILL_LEVEL_COLORS] }}
            />
            <span className="text-xs text-gray-600">
              {['', 'Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'][level]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}