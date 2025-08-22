import React, { useMemo } from 'react';
import { LinkedInExperience } from '../../../types/linkedin';

import { skillsProgression } from '../../../data/linkedin-experience';

interface SkillProgression {
  skill: string;
  category: 'Technical' | 'Soft Skills' | 'Tools' | 'Languages' | 'Frameworks';
  level: number; // 1-5 scale
  experienceIds: string[]; // Which experiences contributed to this skill
  firstIntroduced: string; // Date first used
  lastUsed?: string;
  yearsOfExperience: number;
}

interface SkillsProgressionProps {
  experiences: LinkedInExperience[];
  skills?: SkillProgression[];
  selectedExperienceId?: string;
}

const SkillsProgression: React.FC<SkillsProgressionProps> = ({
  experiences,
  skills = skillsProgression,
  selectedExperienceId
}) => {
  // Generate skill progression based on experiences
  const calculatedSkills = useMemo(() => {
    if (skills.length > 0) return skills;

    const skillMap = new Map<string, SkillProgression>();
    
    experiences.forEach(exp => {
      exp.technologies.forEach(tech => {
        if (!skillMap.has(tech)) {
          skillMap.set(tech, {
            skill: tech,
            category: 'Technical',
            level: 1,
            experienceIds: [exp.id],
            firstIntroduced: exp.startDate,
            yearsOfExperience: 1
          });
        } else {
          const existing = skillMap.get(tech)!;
          existing.experienceIds.push(exp.id);
          existing.level = Math.min(5, existing.level + 1);
        }
      });
    });

    return Array.from(skillMap.values());
  }, [experiences, skills]);

  // Filter skills based on selected experience
  const displayedSkills = useMemo(() => {
    if (!selectedExperienceId) return calculatedSkills;
    
    return calculatedSkills.filter(skill => 
      skill.experienceIds.includes(selectedExperienceId)
    );
  }, [calculatedSkills, selectedExperienceId]);

  const getSkillColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'from-blue-500 to-cyan-500';
      case 'Languages': return 'from-green-500 to-emerald-500';
      case 'Frameworks': return 'from-purple-500 to-pink-500';
      case 'Tools': return 'from-orange-500 to-red-500';
      case 'Soft Skills': return 'from-indigo-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Novice';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getExperienceTitle = (expId: string) => {
    const exp = experiences.find(e => e.id === expId);
    return exp ? `${exp.title} at ${exp.company}` : 'Unknown Experience';
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Skills Progression</h3>
        <p className="text-white/70">
          {selectedExperienceId 
            ? `Skills from ${getExperienceTitle(selectedExperienceId)}`
            : `${displayedSkills.length} skills across all experiences`
          }
        </p>
      </div>

      {/* Skills categories */}
      <div className="space-y-6">
        {['Technical', 'Languages', 'Frameworks', 'Tools', 'Soft Skills'].map(category => {
          const categorySkills = displayedSkills.filter(skill => skill.category === category);
          
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSkillColor(category)}`} />
                  <span>{category}</span>
                </h4>
                <span className="text-white/60 text-sm">
                  {categorySkills.length} skill{categorySkills.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map(skill => (
                  <div 
                    key={skill.skill}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    {/* Skill header */}
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-white text-sm">{skill.skill}</h5>
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${skill.level >= 4 ? 'bg-green-500/20 text-green-300' : 
                          skill.level >= 3 ? 'bg-blue-500/20 text-blue-300' :
                          skill.level >= 2 ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'}
                      `}>
                        {getLevelLabel(skill.level)}
                      </span>
                    </div>

                    {/* Skill level bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                        <span>Proficiency</span>
                        <span>{skill.level}/5</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getSkillColor(category)} transition-all duration-500`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Experience info */}
                    <div className="text-xs text-white/60 space-y-1">
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>
                          Used in {skill.experienceIds.length} position{skill.experienceIds.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Experience tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 pt-2 border-t border-white/10">
                      <div className="text-xs text-white/50">
                        <span className="font-medium">Used at:</span>
                        <ul className="mt-1 space-y-0.5">
                          {skill.experienceIds.slice(0, 3).map(expId => {
                            const exp = experiences.find(e => e.id === expId);
                            return exp ? (
                              <li key={expId} className="truncate">
                                • {exp.company}
                              </li>
                            ) : null;
                          })}
                          {skill.experienceIds.length > 3 && (
                            <li className="text-white/40">
                              +{skill.experienceIds.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills evolution timeline */}
      {!selectedExperienceId && (
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-400/20">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Skills Evolution Over Time</span>
          </h4>
          
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  {index < experiences.length - 1 && (
                    <div className="w-0.5 h-16 bg-purple-500/30 mt-1" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-white text-sm">{exp.title}</h5>
                    <span className="text-white/60 text-xs">
                      {new Date(exp.startDate).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {exp.technologies.slice(0, 8).map(tech => (
                      <span 
                        key={tech}
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded border border-white/20"
                      >
                        {tech}
                      </span>
                    ))}
                    {exp.technologies.length > 8 && (
                      <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded">
                        +{exp.technologies.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsProgression;