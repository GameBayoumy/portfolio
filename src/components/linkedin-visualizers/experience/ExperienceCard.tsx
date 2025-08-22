import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position } from '../../../types/linkedin';

interface ExperienceCardProps {
  position: Position;
  index: number;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ position, index }) => {
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
              {/* Company Logo Placeholder */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                {position.companyLogo ? (
                  <img 
                    src={position.companyLogo} 
                    alt={`${position.company} logo`}
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white/60">
                    {position.company.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {position.title}
                </h3>
                <p className="text-purple-300 font-semibold mb-1">
                  {position.company}
                </p>
                <p className="text-white/60 text-sm mb-2">
                  {position.location}
                </p>
                <div className="flex items-center space-x-2 text-sm text-white/50">
                  <span>
                    {formatDate(position.startDate)} - {position.endDate ? formatDate(position.endDate) : 'Present'}
                  </span>
                  <span>•</span>
                  <span>{calculateDuration(position.startDate, position.endDate)}</span>
                  {position.isCurrentRole && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">
                        Current
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

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            {position.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {position.skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30"
              >
                {skill}
              </span>
            ))}
            {position.skills.length > 6 && (
              <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                +{position.skills.length - 6} more
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
                {/* Achievements */}
                {position.achievements.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Key Achievements
                    </h4>
                    <ul className="space-y-2">
                      {position.achievements.map((achievement, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-white/70 text-sm flex items-start"
                        >
                          <span className="text-green-400 mr-2 mt-1">✓</span>
                          {achievement}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {position.companySize && (
                    <div className="flex items-center space-x-2">
                      <span className="text-white/50 text-sm">Company Size:</span>
                      <span className="text-white/80 text-sm font-medium">{position.companySize}</span>
                    </div>
                  )}
                  {position.industry && (
                    <div className="flex items-center space-x-2">
                      <span className="text-white/50 text-sm">Industry:</span>
                      <span className="text-white/80 text-sm font-medium">{position.industry}</span>
                    </div>
                  )}
                </div>

                {/* All Skills */}
                {position.skills.length > 6 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      All Technologies & Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {position.skills.map((skill, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gradient effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

export default ExperienceCard;