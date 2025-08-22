'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { 
  Users, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Building,
  Calendar,
  Star,
  Filter,
  Search,
  MessageCircle
} from 'lucide-react';
import { Endorsement, Skill, LINKEDIN_COLORS, SKILL_LEVEL_COLORS } from './types';

interface EndorsementsVisualizationProps {
  endorsements: Endorsement[];
  skills: Skill[];
}

type RelationshipType = 'colleague' | 'manager' | 'client' | 'peer';

const relationshipColors: Record<RelationshipType, string> = {
  colleague: '#059669',
  manager: '#dc2626',
  client: '#7c3aed',
  peer: '#f59e0b'
};

const relationshipIcons: Record<RelationshipType, any> = {
  colleague: Users,
  manager: Building,
  client: UserCheck,
  peer: Award
};

export function EndorsementsVisualization({ endorsements, skills }: EndorsementsVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const networkRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'chart' | 'network' | 'list'>('chart');

  // Process endorsements data
  const processedData = useMemo(() => {
    // Group endorsements by skill
    const skillEndorsements = endorsements.reduce((acc, endorsement) => {
      if (!acc[endorsement.skill]) {
        acc[endorsement.skill] = [];
      }
      acc[endorsement.skill].push(endorsement);
      return acc;
    }, {} as Record<string, Endorsement[]>);

    // Create skill summary with endorsement details
    const skillSummary = Object.entries(skillEndorsements).map(([skillName, skillEndorsements]) => {
      const skill = skills.find(s => s.name === skillName);
      const relationshipCounts = skillEndorsements.reduce((acc, e) => {
        acc[e.relationship] = (acc[e.relationship] || 0) + 1;
        return acc;
      }, {} as Record<RelationshipType, number>);

      return {
        skillName,
        skill,
        endorsements: skillEndorsements,
        totalEndorsements: skillEndorsements.length,
        relationshipCounts,
        averageDate: new Date(
          skillEndorsements.reduce((sum, e) => sum + new Date(e.date).getTime(), 0) / skillEndorsements.length
        )
      };
    }).sort((a, b) => b.totalEndorsements - a.totalEndorsements);

    return { skillEndorsements, skillSummary };
  }, [endorsements, skills]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = processedData.skillSummary;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.endorsements.some(e => 
          e.endorserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.endorserTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply relationship filter
    if (selectedRelationship !== 'all') {
      filtered = filtered.filter(item =>
        item.endorsements.some(e => e.relationship === selectedRelationship)
      );
    }

    return filtered;
  }, [processedData.skillSummary, searchTerm, selectedRelationship]);

  // Bar Chart Visualization
  useEffect(() => {
    if (viewMode !== 'chart' || !svgRef.current || !containerRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Set dimensions
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 40, right: 80, bottom: 80, left: 120 };
    const width = Math.max(600, containerRect.width) - margin.left - margin.right;
    const height = Math.max(400, filteredData.length * 50) - margin.top - margin.bottom;
    
    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.totalEndorsements) || 0])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(filteredData.map(d => d.skillName))
      .range([0, height])
      .padding(0.1);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'endorsements-tooltip')
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

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d}`);
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', LINKEDIN_COLORS.secondaryText);

    // Add skill labels
    g.selectAll('.skill-label')
      .data(filteredData)
      .enter()
      .append('text')
      .attr('class', 'skill-label')
      .attr('x', -10)
      .attr('y', d => (yScale(d.skillName) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('fill', LINKEDIN_COLORS.text)
      .style('cursor', 'pointer')
      .text(d => d.skillName.length > 15 ? d.skillName.substring(0, 15) + '...' : d.skillName)
      .on('click', function(event, d) {
        setSelectedSkill(selectedSkill === d.skillName ? null : d.skillName);
      });

    // Create stacked bars
    filteredData.forEach(skillData => {
      const skillY = yScale(skillData.skillName) || 0;
      const skillHeight = yScale.bandwidth();
      let currentX = 0;

      // Create segments for each relationship type
      Object.entries(skillData.relationshipCounts).forEach(([relationship, count]) => {
        const segmentWidth = xScale(count);
        
        g.append('rect')
          .attr('x', currentX)
          .attr('y', skillY)
          .attr('width', segmentWidth)
          .attr('height', skillHeight)
          .style('fill', relationshipColors[relationship as RelationshipType])
          .style('stroke', 'white')
          .style('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            tooltip
              .style('opacity', 1)
              .html(`
                <div style="font-weight: 600; color: ${LINKEDIN_COLORS.accent}; margin-bottom: 4px;">
                  ${skillData.skillName}
                </div>
                <div style="margin-bottom: 2px;">
                  <strong>${relationship.charAt(0).toUpperCase() + relationship.slice(1)}s:</strong> ${count} endorsements
                </div>
                <div style="font-size: 12px; color: #ccc;">
                  Total: ${skillData.totalEndorsements} endorsements
                </div>
              `)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
          })
          .on('mouseout', function() {
            tooltip.style('opacity', 0);
          });

        currentX += segmentWidth;
      });

      // Add total count label
      g.append('text')
        .attr('x', currentX + 5)
        .attr('y', skillY + skillHeight / 2)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', LINKEDIN_COLORS.primary)
        .text(skillData.totalEndorsements);
    });

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 20)`);

    Object.entries(relationshipColors).forEach(([relationship, color], index) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${index * 25})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .style('fill', color);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('fill', LINKEDIN_COLORS.text)
        .text(relationship.charAt(0).toUpperCase() + relationship.slice(1));
    });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [viewMode, filteredData, selectedSkill]);

  // Network Visualization
  useEffect(() => {
    if (viewMode !== 'network' || !networkRef.current || endorsements.length === 0) return;

    const svg = d3.select(networkRef.current);
    svg.selectAll('*').remove();
    
    const width = 600;
    const height = 400;
    
    svg
      .attr('width', width)
      .attr('height', height);

    // Create network data
    const nodes: any[] = [];
    const links: any[] = [];
    
    // Add skill nodes
    const skillNodes = new Set();
    endorsements.forEach(endorsement => {
      if (!skillNodes.has(endorsement.skill)) {
        skillNodes.add(endorsement.skill);
        nodes.push({
          id: endorsement.skill,
          type: 'skill',
          group: 1,
          size: endorsements.filter(e => e.skill === endorsement.skill).length
        });
      }
    });

    // Add endorser nodes and links
    endorsements.forEach(endorsement => {
      const endorserId = `${endorsement.endorserName}-${endorsement.endorserTitle}`;
      if (!nodes.find(n => n.id === endorserId)) {
        nodes.push({
          id: endorserId,
          type: 'endorser',
          group: 2,
          relationship: endorsement.relationship,
          name: endorsement.endorserName,
          title: endorsement.endorserTitle
        });
      }
      
      links.push({
        source: endorsement.skill,
        target: endorserId,
        relationship: endorsement.relationship
      });
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .style('stroke', d => relationshipColors[d.relationship as RelationshipType])
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.6);

    // Create nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.type === 'skill' ? Math.max(8, Math.min(20, d.size * 2)) : 6)
      .style('fill', d => d.type === 'skill' ? LINKEDIN_COLORS.primary : relationshipColors[d.relationship as RelationshipType] || '#666')
      .style('stroke', 'white')
      .style('stroke-width', 2)
      .call(d3.drag<any, any>()
        .on('start', function(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', function(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', function(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels
    const labels = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .style('font-size', d => d.type === 'skill' ? '12px' : '10px')
      .style('font-weight', d => d.type === 'skill' ? '600' : '400')
      .style('fill', LINKEDIN_COLORS.text)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.type === 'skill' ? d.id : d.name);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y + (d.type === 'skill' ? 25 : 15));
    });

  }, [viewMode, endorsements]);

  const relationshipCounts = endorsements.reduce((acc, e) => {
    acc[e.relationship] = (acc[e.relationship] || 0) + 1;
    return acc;
  }, {} as Record<RelationshipType, number>);

  return (
    <motion.div 
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Professional Endorsements</h3>
          <p className="text-sm text-gray-600 mt-1">
            {endorsements.length} endorsements from professional network
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { mode: 'chart', icon: TrendingUp, label: 'Chart' },
            { mode: 'network', icon: Users, label: 'Network' },
            { mode: 'list', icon: MessageCircle, label: 'List' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills or endorsers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedRelationship}
            onChange={(e) => setSelectedRelationship(e.target.value as RelationshipType | 'all')}
            className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Relationships</option>
            <option value="colleague">Colleagues</option>
            <option value="manager">Managers</option>
            <option value="client">Clients</option>
            <option value="peer">Peers</option>
          </select>
        </div>
      </div>

      {/* Relationship Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(relationshipCounts).map(([relationship, count]) => {
          const Icon = relationshipIcons[relationship as RelationshipType];
          return (
            <div key={relationship} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: relationshipColors[relationship as RelationshipType] }}
                />
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{relationship}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {viewMode === 'chart' && (
          <div ref={containerRef} style={{ minHeight: '400px' }}>
            <svg ref={svgRef}></svg>
          </div>
        )}

        {viewMode === 'network' && (
          <div className="flex justify-center">
            <svg ref={networkRef}></svg>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredData.map((skillData) => (
              <motion.div
                key={skillData.skillName}
                layout
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{skillData.skillName}</h4>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {skillData.totalEndorsements} endorsements
                  </span>
                </div>
                
                <div className="space-y-2">
                  {skillData.endorsements.slice(0, 3).map((endorsement, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: relationshipColors[endorsement.relationship] }}
                      />
                      <span className="font-medium">{endorsement.endorserName}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{endorsement.endorserTitle}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500 capitalize">{endorsement.relationship}</span>
                    </div>
                  ))}
                  {skillData.endorsements.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{skillData.endorsements.length - 3} more endorsements
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
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
              <Star className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                {selectedSkill} Endorsements
              </h3>
            </div>
            
            {(() => {
              const skillData = filteredData.find(s => s.skillName === selectedSkill);
              if (!skillData) return null;
              
              return (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Endorsement Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(skillData.relationshipCounts).map(([relationship, count]) => {
                        const Icon = relationshipIcons[relationship as RelationshipType];
                        return (
                          <div key={relationship} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: relationshipColors[relationship as RelationshipType] }}
                              />
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm capitalize">{relationship}s</span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Endorsers</h4>
                    <div className="space-y-2">
                      {skillData.endorsements
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((endorsement, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{endorsement.endorserName}</div>
                            <div className="text-gray-600">{endorsement.endorserTitle}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}