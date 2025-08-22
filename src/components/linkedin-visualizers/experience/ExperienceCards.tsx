import React, { useState, useMemo } from 'react';
import { LinkedInExperience } from '../../../types/linkedin';
import { linkedInExperiences } from '../../../data/linkedin-experience';
import LinkedInExperienceCard from './LinkedInExperienceCard';
import SkillsProgression from './SkillsProgression';

interface ExperienceFilters {
  company?: string;
  technology?: string;
  skills?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  employmentType?: string[];
  searchQuery?: string;
}

interface ExperienceCardsProps {
  experiences?: LinkedInExperience[];
  showFilters?: boolean;
  maxCards?: number;
}

const ExperienceCards: React.FC<ExperienceCardsProps> = ({
  experiences = linkedInExperiences,
  showFilters = true,
  maxCards
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExperienceFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showSkillsProgression, setShowSkillsProgression] = useState(false);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const companies = [...new Set(experiences.map(exp => exp.company))];
    const technologies = [...new Set(experiences.flatMap(exp => exp.technologies))];
    const employmentTypes = [...new Set(experiences.map(exp => exp.employmentType))];
    
    return { companies, technologies, employmentTypes };
  }, [experiences]);

  // Filter experiences based on current filters
  const filteredExperiences = useMemo(() => {
    let filtered = [...experiences];

    if (filters.company) {
      filtered = filtered.filter(exp => exp.company === filters.company);
    }

    if (filters.technology) {
      filtered = filtered.filter(exp => 
        exp.technologies.some(tech => 
          tech.toLowerCase().includes(filters.technology!.toLowerCase())
        )
      );
    }

    if (filters.employmentType && filters.employmentType.length > 0) {
      filtered = filtered.filter(exp => 
        filters.employmentType!.includes(exp.employmentType)
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(query) ||
        exp.company.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.skills.some(skill => skill.toLowerCase().includes(query)) ||
        exp.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Sort by start date (most recent first)
    filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    if (maxCards) {
      filtered = filtered.slice(0, maxCards);
    }

    return filtered;
  }, [experiences, filters, maxCards]);

  const handleCardToggle = (experienceId: string) => {
    setExpandedCard(prev => prev === experienceId ? null : experienceId);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getTotalExperience = () => {
    const totalMonths = experiences.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return `${years} years${months > 0 ? ` ${months} months` : ''}`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Professional Experience</h2>
            <p className="text-white/70">
              {getTotalExperience()} of experience • {filteredExperiences.length} positions
            </p>
          </div>
          
          {/* View mode toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  viewMode === 'timeline'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Timeline View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => setShowSkillsProgression(!showSkillsProgression)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                showSkillsProgression
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
              title="Toggle Skills Progression"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden sm:inline">Skills</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search experiences..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Company filter */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Company
                </label>
                <select
                  value={filters.company || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value || undefined }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Companies</option>
                  {filterOptions.companies.map(company => (
                    <option key={company} value={company} className="bg-gray-800">
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technology filter */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Technology
                </label>
                <input
                  type="text"
                  placeholder="e.g., Unity, React..."
                  value={filters.technology || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, technology: e.target.value || undefined }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Employment type filter */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Employment Type
                </label>
                <select
                  value={filters.employmentType?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    employmentType: e.target.value ? [e.target.value as any] : undefined 
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {filterOptions.employmentTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters and clear button */}
            {Object.keys(filters).some(key => filters[key as keyof ExperienceFilters]) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    const displayValue = Array.isArray(value) ? value.join(', ') : value;
                    return (
                      <span
                        key={key}
                        className="px-3 py-1 bg-purple-500/20 text-purple-200 text-sm rounded-full border border-purple-400/30 flex items-center space-x-1"
                      >
                        <span>{key}: {displayValue}</span>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, [key]: undefined }))}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills Progression Section */}
      {showSkillsProgression && (
        <div className="mb-8">
          <SkillsProgression 
            experiences={filteredExperiences}
            selectedExperienceId={expandedCard || undefined}
          />
        </div>
      )}

      {/* Experience cards */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg mb-4">No experiences match your filters</div>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' 
            : 'space-y-6'
          }
        `}>
          {filteredExperiences.map((experience, index) => (
            <div
              key={experience.id}
              className={`
                ${viewMode === 'timeline' ? 'flex items-start space-x-6' : ''}
                ${index > 0 && viewMode === 'timeline' ? 'border-l-2 border-white/20 pl-6 ml-6' : ''}
              `}
            >
              {viewMode === 'timeline' && (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white/20" />
                  {index < filteredExperiences.length - 1 && (
                    <div className="w-0.5 h-24 bg-white/20 mt-2" />
                  )}
                </div>
              )}
              
              <div className={viewMode === 'timeline' ? 'flex-1' : ''}>
                <LinkedInExperienceCard
                  experience={experience}
                  isExpanded={expandedCard === experience.id}
                  onToggleExpand={() => handleCardToggle(experience.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills summary */}
      <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-400/20">
        <h3 className="text-xl font-bold text-white mb-4">Skills Across All Positions</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(filteredExperiences.flatMap(exp => exp.technologies))]
            .slice(0, 20)
            .map((tech) => {
              const count = filteredExperiences.filter(exp => 
                exp.technologies.includes(tech)
              ).length;
              
              return (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20 flex items-center space-x-1"
                  title={`Used in ${count} position${count > 1 ? 's' : ''}`}
                >
                  <span>{tech}</span>
                  <span className="text-purple-300 text-xs">({count})</span>
                </span>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCards;