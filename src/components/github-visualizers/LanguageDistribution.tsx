'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface LanguageStats {
  language: string;
  bytes: number;
  percentage: number;
}

interface LanguageDistributionProps {
  languages: LanguageStats[];
}

// Language color mapping (GitHub-like colors)
const languageColors: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Java': '#b07219',
  'C#': '#239120',
  'C++': '#f34b7d',
  'C': '#555555',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'Swift': '#fa7343',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'Scala': '#c22d40',
  'HTML': '#e34c26',
  'CSS': '#1572B6',
  'SCSS': '#c6538c',
  'Vue': '#4FC08D',
  'Svelte': '#ff3e00',
  'Shell': '#89e051',
  'PowerShell': '#012456',
  'Dockerfile': '#384d54',
  'YAML': '#cb171e',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'GLSL': '#5686a5',
  'HLSL': '#aace60',
  'Unity': '#000000',
  'UnityScript': '#102030',
  'ShaderLab': '#222c37',
};

export function LanguageDistribution({ languages }: LanguageDistributionProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Take top 8 languages and group the rest as "Others"
  const topLanguages = languages.slice(0, 8);
  const otherLanguages = languages.slice(8);
  
  const chartData = [
    ...topLanguages,
    ...(otherLanguages.length > 0 ? [{
      language: 'Others',
      bytes: otherLanguages.reduce((sum, lang) => sum + lang.bytes, 0),
      percentage: otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0)
    }] : [])
  ];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Set dimensions
    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 20;
    
    svg
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('margin', '0 auto');
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Create pie generator
    const pie = d3.pie<any>()
      .value((d: any) => d.percentage)
      .sort(null);
    
    // Create arc generator
    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius);
    
    const hoverArc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius + 10);
    
    // Generate pie data
    const pieData = pie(chartData);
    
    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');
    
    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => languageColors[d.data.language] || '#64748b')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s ease')
      .on('mouseover', function(event: any, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.data.language}</strong><br/>
            ${d.data.percentage.toFixed(1)}%<br/>
            ${(d.data.bytes / 1024).toFixed(1)} KB
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event: any) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        
        tooltip.style('opacity', 0);
      });
    
    // Add percentage labels for larger slices
    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .style('pointer-events', 'none')
      .text((d: any) => d.data.percentage > 5 ? `${d.data.percentage.toFixed(1)}%` : '');
    
    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="glass-morphism p-8 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-6">Programming Languages</h3>
        <div className="text-center text-gray-400">
          <p>No language data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="glass-morphism p-8 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h3 className="text-xl font-semibold text-white mb-6">Programming Languages</h3>
      
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Pie Chart */}
        <div ref={containerRef} className="flex justify-center" style={{ height: '400px' }}>
          <svg ref={svgRef}></svg>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {chartData.map((lang, index) => (
            <motion.div
              key={lang.language}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass-100 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: languageColors[lang.language] || '#64748b' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">
                    {lang.language}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {(lang.bytes / 1024).toFixed(1)} KB
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}