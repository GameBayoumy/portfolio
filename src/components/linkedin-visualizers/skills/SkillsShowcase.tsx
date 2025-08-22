'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  Grid3X3, 
  Clock, 
  Award,
  TrendingUp,
  Users,
  Star,
  Filter
} from 'lucide-react';
import { SkillsRadar } from './SkillsRadar';
import { SkillsMatrix } from './SkillsMatrix';
import { ProfessionalTimeline } from './ProfessionalTimeline';
import { EndorsementsVisualization } from './EndorsementsVisualization';
import { SkillsData, SkillCategory, LINKEDIN_COLORS } from './types';

interface SkillsShowcaseProps {
  data: SkillsData;
}

type ViewMode = 'radar' | 'matrix' | 'timeline' | 'endorsements' | 'overview';

const viewModes = [
  {
    key: 'overview' as ViewMode,
    label: 'Overview',
    icon: Star,
    description: 'Complete skills summary and insights'
  },
  {
    key: 'radar' as ViewMode,
    label: 'Skills Radar',
    icon: Radar,
    description: 'Interactive radar chart showing skill proficiency levels'
  },
  {
    key: 'matrix' as ViewMode,
    label: 'Skills Matrix',
    icon: Grid3X3,
    description: 'Detailed grid view with filtering and search capabilities'
  },
  {
    key: 'timeline' as ViewMode,
    label: 'Professional Timeline',
    icon: Clock,
    description: 'Career progression and skill development journey'
  },
  {
    key: 'endorsements' as ViewMode,
    label: 'Endorsements',
    icon: Award,
    description: 'Professional network validation and peer recognition'
  }
];

export function SkillsShowcase({ data }: SkillsShowcaseProps) {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');

  const categories = Array.from(new Set(data.skills.map(skill => skill.category)));
  const filteredSkills = selectedCategory === 'All' 
    ? data.skills 
    : data.skills.filter(skill => skill.category === selectedCategory);

  // Overview Statistics
  const overviewStats = {
    totalSkills: data.skills.length,
    expertSkills: data.skills.filter(skill => skill.level === 5).length,
    trendingSkills: data.skills.filter(skill => skill.trending).length,
    totalEndorsements: data.summary.totalEndorsements,
    averageExperience: data.summary.averageExperience,
    recentlyUsed: data.skills.filter(skill => {
      const daysSinceUsed = Math.floor(
        (new Date().getTime() - new Date(skill.lastUsed).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUsed <= 30;
    }).length
  };

  const categoryDistribution = categories.reduce((acc, category) => {
    const categorySkills = data.skills.filter(skill => skill.category === category);
    acc[category] = {
      count: categorySkills.length,
      avgLevel: categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length,
      endorsements: categorySkills.reduce((sum, skill) => sum + skill.endorsements, 0)
    };
    return acc;
  }, {} as Record<string, { count: number; avgLevel: number; endorsements: number }>);

  const topSkills = data.skills
    .sort((a, b) => b.level - a.level || b.endorsements - a.endorsements)
    .slice(0, 8);

  return (
    <motion.div 
      className="w-full space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Professional Skills & Expertise
          </h2>
          <p className="text-lg text-gray-300">
            Comprehensive view of technical capabilities and professional development
          </p>
        </motion.div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Total Skills', value: overviewStats.totalSkills, icon: Grid3X3, color: LINKEDIN_COLORS.primary },
            { label: 'Expert Level', value: overviewStats.expertSkills, icon: Star, color: '#f59e0b' },
            { label: 'Trending', value: overviewStats.trendingSkills, icon: TrendingUp, color: '#ef4444' },
            { label: 'Endorsements', value: overviewStats.totalEndorsements, icon: Users, color: '#10b981' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="glass-morphism p-4 rounded-lg text-center"
            >
              <stat.icon 
                className="w-6 h-6 mx-auto mb-2" 
                style={{ color: stat.color }}
              />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* View Mode Navigation */}
      <div className="flex flex-wrap justify-center gap-2 p-4 glass-morphism rounded-xl">
        {viewModes.map((mode, index) => (
          <motion.button
            key={mode.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            onClick={() => setActiveView(mode.key)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeView === mode.key
                ? 'bg-white text-blue-600 shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-glass-100'
            }`}
            title={mode.description}
          >
            <mode.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Category Filter */}
      {(activeView === 'radar' || activeView === 'matrix') && (
        <div className="flex justify-center">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'All')}
              className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="All" className="text-gray-900">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="text-gray-900">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="glass-morphism p-8 rounded-xl"
        >
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Category Distribution */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Skills by Category</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryDistribution).map(([category, stats]) => (
                    <div key={category} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">{category}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Skills:</span>
                          <span className="text-white font-medium">{stats.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Avg Level:</span>
                          <span className="text-white font-medium">{stats.avgLevel.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Endorsements:</span>
                          <span className="text-white font-medium">{stats.endorsements}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Skills */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Top Skills</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {topSkills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{skill.name}</h4>
                          {skill.trending && <TrendingUp className="w-4 h-4 text-orange-400" />}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{skill.category}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Level {skill.level}/5</span>
                          <span>{skill.endorsements} endorsements</span>
                          <span>{skill.yearsOfExperience}y exp</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ 
                            backgroundColor: `rgba(0, 119, 181, ${skill.level / 5})`,
                            border: '2px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {skill.level}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'radar' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Skills Proficiency Radar</h3>
              <SkillsRadar 
                skills={filteredSkills} 
                selectedCategory={selectedCategory === 'All' ? undefined : selectedCategory}
              />
            </div>
          )}

          {activeView === 'matrix' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Skills Matrix</h3>
              <SkillsMatrix skills={filteredSkills} />
            </div>
          )}

          {activeView === 'timeline' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Professional Development Timeline</h3>
              <ProfessionalTimeline timelines={data.timelines} />
            </div>
          )}

          {activeView === 'endorsements' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Professional Endorsements</h3>
              <EndorsementsVisualization 
                endorsements={data.endorsements}
                skills={data.skills}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}