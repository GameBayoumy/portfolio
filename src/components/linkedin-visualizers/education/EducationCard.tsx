'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EducationEntry } from './types';

interface EducationCardProps {
  education: EducationEntry;
  index: number;
}

const EducationCard: React.FC<EducationCardProps> = ({ education, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months}m`;
  };

  const getDegreeIcon = (degreeType: string) => {
    switch (degreeType.toLowerCase()) {
      case 'bachelor':
        return '🎓';
      case 'master':
        return '🎯';
      case 'phd':
        return '🔬';
      case 'certificate':
        return '📜';
      default:
        return '📚';
    }
  };

  const getDegreeColor = (degreeType: string) => {
    switch (degreeType.toLowerCase()) {
      case 'bachelor':
        return 'from-blue-500 to-cyan-500';
      case 'master':
        return 'from-purple-500 to-pink-500';
      case 'phd':
        return 'from-red-500 to-orange-500';
      case 'certificate':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative"
    >
      <div className="h-full bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Institution Logo */}
              <div className={`w-16 h-16 bg-gradient-to-br ${getDegreeColor(education.degreeType)} rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden`}>
                {education.logo ? (
                  <img 
                    src={education.logo} 
                    alt={`${education.institution} logo`}
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">
                    {getDegreeIcon(education.degreeType)}
                  </span>
                )}
                
                {/* Degree level indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-xs font-bold text-white">
                    {education.degreeType === 'Bachelor' ? 'B' : 
                     education.degreeType === 'Master' ? 'M' : 
                     education.degreeType === 'PhD' ? 'P' : 'C'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {education.degree}
                </h3>
                <p className="text-purple-300 font-semibold mb-1">
                  {education.institution}
                </p>
                <p className="text-blue-300 text-sm mb-2">
                  {education.fieldOfStudy}
                </p>
                <p className="text-white/60 text-sm mb-2">
                  {education.location}
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-white/50">
                  <span>
                    {formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : 'Present'}
                  </span>
                  <span>•</span>
                  <span>{calculateDuration(education.startDate, education.endDate)}</span>
                  {!education.isCompleted && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                        In Progress
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Expand button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.div>
            </motion.button>
          </div>

          {/* GPA and Honors */}
          <div className="flex items-center gap-4 mb-4">
            {education.gpa && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">GPA:</span>
                <span className="text-white font-semibold">{education.gpa}</span>
              </div>
            )}
            
            {education.honors && education.honors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {education.honors?.slice(0, 2).map((honor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30"
                  >
                    {honor}
                  </span>
                ))}
                {education.honors && education.honors.length > 2 && (
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                    +{(education.honors?.length || 0) - 2} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            {education.description}
          </p>

          {/* Top Skills/Coursework */}
          <div className="flex flex-wrap gap-2 mb-4">
            {education.relevantCoursework.slice(0, 4).map((course, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
              >
                {course}
              </span>
            ))}
            {education.relevantCoursework.length > 4 && (
              <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                +{education.relevantCoursework.length - 4} more courses
              </span>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="p-6 pt-4 space-y-6">
                {/* All Honors */}
                {education.honors.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Academic Honors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {education.honors.map((honor, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30"
                        >
                          {honor}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Major Projects */}
                {education.projects.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Key Projects
                    </h4>
                    <div className="space-y-4">
                      {education.projects.map((project, idx) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-white font-medium">{project.title}</h5>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {project.type}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-3">{project.description}</p>
                          
                          {/* Technologies */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIdx) => (
                              <span
                                key={techIdx}
                                className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* Outcomes */}
                          {project.outcomes && project.outcomes.length > 0 && (
                            <div>
                              <h6 className="text-white/80 font-medium text-sm mb-2">Outcomes:</h6>
                              <ul className="space-y-1">
                                {project.outcomes.map((outcome, outcomeIdx) => (
                                  <li key={outcomeIdx} className="text-white/70 text-xs flex items-start">
                                    <span className="text-green-400 mr-2 mt-0.5">✓</span>
                                    {outcome}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Project Links */}
                          {project.links && (
                            <div className="flex gap-3 mt-3">
                              {project.links.github && (
                                <a
                                  href={project.links.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                  GitHub →
                                </a>
                              )}
                              {project.links.demo && (
                                <a
                                  href={project.links.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-300 hover:text-green-200 transition-colors"
                                >
                                  Demo →
                                </a>
                              )}
                              {project.links.publication && (
                                <a
                                  href={project.links.publication}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                                >
                                  Publication →
                                </a>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Coursework */}
                {education.relevantCoursework.length > 4 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Relevant Coursework
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {education.relevantCoursework.map((course, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                        >
                          {course}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {education.achievements.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Academic Achievements
                    </h4>
                    <ul className="space-y-2">
                      {education.achievements.map((achievement, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-white/70 text-sm flex items-start"
                        >
                          <span className="text-purple-400 mr-2 mt-1">★</span>
                          {achievement}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Activities */}
                {education.activities.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                      Activities & Leadership
                    </h4>
                    <ul className="space-y-2">
                      {education.activities.map((activity, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-white/70 text-sm flex items-start"
                        >
                          <span className="text-cyan-400 mr-2 mt-1">•</span>
                          {activity}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Institution Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Institution Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Type:</span>
                      <span className="text-white/80">{education.institutionType}</span>
                    </div>
                    {education.accreditation && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Accreditation:</span>
                        <span className="text-white/80">{education.accreditation}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">Degree Type:</span>
                      <span className="text-white/80">{education.degreeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Status:</span>
                      <span className={education.isCompleted ? 'text-green-400' : 'text-blue-400'}>
                        {education.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  
                  {education.website && (
                    <div className="mt-4 text-center">
                      <a
                        href={education.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm"
                      >
                        <span>Visit Institution Website</span>
                        <span>→</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gradient effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getDegreeColor(education.degreeType)} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
      </div>
    </motion.div>
  );
};

export default EducationCard;