'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, Award, Clock, Star } from 'lucide-react';
import { Skill, SkillCategory, LINKEDIN_COLORS, SKILL_LEVEL_COLORS, CATEGORY_COLORS } from './types';

interface SkillsMatrixProps {
  skills: Skill[];
}

export function SkillsMatrix({ skills }: SkillsMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'level' | 'endorsements' | 'experience' | 'recent'>('level');
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(skills.map(skill => skill.category)));
    return ['All', ...uniqueCategories] as (SkillCategory | 'All')[];
  }, [skills]);

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Apply trending filter
    if (showOnlyTrending) {
      filtered = filtered.filter(skill => skill.trending);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level || b.endorsements - a.endorsements;
        case 'endorsements':
          return b.endorsements - a.endorsements;
        case 'experience':
          return b.yearsOfExperience - a.yearsOfExperience;
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [skills, searchTerm, selectedCategory, sortBy, showOnlyTrending]);

  const getLevelLabel = (level: number): string => {
    const labels = ['', 'Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'];
    return labels[level] || '';
  };

  const getIndustryDemandColor = (demand?: string): string => {
    switch (demand) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#65a30d';
      default: return LINKEDIN_COLORS.secondaryText;
    }
  };

  const formatLastUsed = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <motion.div 
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Controls */}
      <div className="space-y-4">
        {/* Search and Trending Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowOnlyTrending(!showOnlyTrending)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showOnlyTrending
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending Only
          </button>
        </div>

        {/* Category and Sort Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'All')}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="level">Skill Level</option>
              <option value="endorsements">Endorsements</option>
              <option value="experience">Years of Experience</option>
              <option value="recent">Recently Used</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredSkills.length} of {skills.length} skills
        </p>
        {showOnlyTrending && (
          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            Trending skills only
          </div>
        )}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                layout: { duration: 0.3 }
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                    {skill.name}
                    {skill.trending && (
                      <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{skill.category}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[skill.category] }}
                  title={skill.category}
                />
              </div>

              {/* Skill Level */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {getLevelLabel(skill.level)}
                  </span>
                  <span className="text-sm font-bold" style={{ color: SKILL_LEVEL_COLORS[skill.level as keyof typeof SKILL_LEVEL_COLORS] }}>
                    {skill.level}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(skill.level / 5) * 100}%`,
                      backgroundColor: SKILL_LEVEL_COLORS[skill.level as keyof typeof SKILL_LEVEL_COLORS]
                    }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-600">{skill.endorsements} endorsements</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600">{skill.yearsOfExperience}y exp</span>
                </div>
              </div>

              {/* Industry Demand */}
              {skill.industryDemand && (
                <div className="mt-2 flex items-center gap-1">
                  <Star 
                    className="w-3 h-3" 
                    style={{ color: getIndustryDemandColor(skill.industryDemand) }}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ color: getIndustryDemandColor(skill.industryDemand) }}
                  >
                    {skill.industryDemand.charAt(0).toUpperCase() + skill.industryDemand.slice(1)} Demand
                  </span>
                </div>
              )}

              {/* Last Used */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Last used: {formatLastUsed(skill.lastUsed)}
                </p>
              </div>

              {/* Projects Preview */}
              {skill.projects && skill.projects.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Recent Projects:</p>
                  <div className="flex flex-wrap gap-1">
                    {skill.projects.slice(0, 2).map((project, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate"
                        title={project}
                      >
                        {project}
                      </span>
                    ))}
                    {skill.projects.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{skill.projects.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {skill.certifications && skill.certifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Certifications:</p>
                  {skill.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">{cert}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find more skills.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}