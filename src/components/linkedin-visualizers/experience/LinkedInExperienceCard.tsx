import React, { useState } from 'react';
import { LinkedInExperience } from '../../../types/linkedin';
import { companyInfo } from '../../../data/linkedin-experience';

interface CompanyInfo {
  name: string;
  logo: string;
  website: string;
  industry: string;
  size: string;
  description: string;
  color: string; // Brand color for theming
}

interface LinkedInExperienceCardProps {
  experience: LinkedInExperience;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const LinkedInExperienceCard: React.FC<LinkedInExperienceCardProps> = ({ 
  experience, 
  isExpanded = false, 
  onToggleExpand 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const company = companyInfo[experience.company as keyof typeof companyInfo];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (experience.companyWebsite) {
      window.open(experience.companyWebsite, '_blank');
    }
  };

  return (
    <div
      className={`relative group transition-all duration-500 ease-out transform ${
        isExpanded ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggleExpand}
    >
      {/* Glass morphism card */}
      <div className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-500
        backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5
        border border-white/20 shadow-2xl
        ${isHovered ? 'shadow-purple-500/20 border-purple-400/30' : ''}
        ${isExpanded ? 'bg-gradient-to-br from-white/15 to-white/8' : ''}
      `}>
        {/* Current role indicator */}
        {experience.isCurrentRole && (
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Current
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Company logo placeholder */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: company?.color || '#6366f1' }}
            >
              {experience.company.charAt(0)}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {experience.title}
              </h3>
              <button
                onClick={handleCompanyClick}
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200 flex items-center space-x-1"
              >
                <span>{experience.company}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expand/collapse icon */}
          <button className="text-white/60 hover:text-white transition-colors duration-200">
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Employment details */}
        <div className="text-white/80 text-sm mb-4 space-y-1">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{experience.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
              </span>
            </span>
          </div>
          <div className="text-purple-300">{experience.duration} • {experience.employmentType}</div>
        </div>

        {/* Description (always visible) */}
        <p className="text-white/90 mb-4 leading-relaxed">
          {experience.description}
        </p>

        {/* Technology stack (always visible) */}
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Technologies Used</h4>
          <div className="flex flex-wrap gap-2">
            {experience.technologies.slice(0, isExpanded ? undefined : 6).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white text-xs rounded-full border border-purple-400/30"
              >
                {tech}
              </span>
            ))}
            {!isExpanded && experience.technologies.length > 6 && (
              <span className="px-3 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                +{experience.technologies.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Expanded content */}
        <div className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {/* Key achievements */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Key Achievements</span>
            </h4>
            <ul className="space-y-2">
              {experience.achievements.map((achievement, index) => (
                <li key={index} className="text-white/80 text-sm flex items-start space-x-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          {experience.projects && experience.projects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Key Projects</span>
              </h4>
              <div className="space-y-4">
                {experience.projects.map((project, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white font-semibold mb-2">{project.name}</h5>
                    <p className="text-white/80 text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-400/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {project.impact && (
                      <div className="text-green-300 text-sm flex items-start space-x-2">
                        <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>{project.impact}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills gained */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Skills Developed</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white text-sm rounded-full border border-purple-400/40"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r from-purple-500/5 to-blue-500/5`} />
      </div>
    </div>
  );
};

export default LinkedInExperienceCard;