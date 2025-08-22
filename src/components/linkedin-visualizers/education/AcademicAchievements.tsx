'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicAchievement, Certification } from './types';

interface AcademicAchievementsProps {
  achievements: AcademicAchievement[];
  certifications: Certification[];
  className?: string;
}

const AcademicAchievements: React.FC<AcademicAchievementsProps> = ({
  achievements,
  certifications,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AcademicAchievement | Certification | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Get achievement type icon and color
  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'award':
        return '🏆';
      case 'honor':
        return '🎖️';
      case 'scholarship':
        return '💰';
      case 'recognition':
        return '⭐';
      case 'publication':
        return '📚';
      case 'competition':
        return '🥇';
      default:
        return '🎯';
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'award':
        return 'from-yellow-500 to-orange-500';
      case 'honor':
        return 'from-purple-500 to-pink-500';
      case 'scholarship':
        return 'from-green-500 to-emerald-500';
      case 'recognition':
        return 'from-blue-500 to-cyan-500';
      case 'publication':
        return 'from-indigo-500 to-purple-500';
      case 'competition':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getCertificationIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return '⚙️';
      case 'professional':
        return '💼';
      case 'academic':
        return '🎓';
      case 'industry':
        return '🏭';
      case 'vendor':
        return '🏢';
      default:
        return '📜';
    }
  };

  const getCertificationColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return 'from-blue-500 to-indigo-500';
      case 'professional':
        return 'from-purple-500 to-violet-500';
      case 'academic':
        return 'from-green-500 to-teal-500';
      case 'industry':
        return 'from-orange-500 to-red-500';
      case 'vendor':
        return 'from-cyan-500 to-blue-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  // Get unique categories
  const categories = [
    'all',
    ...Array.from(new Set([
      ...achievements.map(a => a.type.toLowerCase()),
      ...certifications.map(c => c.category.toLowerCase())
    ]))
  ];

  // Filter items based on active category
  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.type.toLowerCase() === activeCategory);

  const filteredCertifications = activeCategory === 'all'
    ? certifications
    : certifications.filter(c => c.category.toLowerCase() === activeCategory);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id');
            if (itemId) {
              setVisibleItems(prev => new Set([...prev, itemId]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const itemElements = document.querySelectorAll('[data-item-id]');
    itemElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredAchievements, filteredCertifications]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Academic Achievements & Certifications
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-lg max-w-2xl mx-auto"
        >
          Recognition, awards, and professional certifications earned throughout academic and professional journey
        </motion.p>
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <div className="flex flex-wrap justify-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 capitalize ${
                activeCategory === category
                  ? 'bg-purple-500/30 border border-purple-500/50 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {category === 'all' ? 'All Items' : category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {achievements.length}
          </div>
          <div className="text-white/70 text-sm">Academic Achievements</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {certifications.filter(c => !c.isExpired).length}
          </div>
          <div className="text-white/70 text-sm">Active Certifications</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {achievements.filter(a => a.significance === 'High').length}
          </div>
          <div className="text-white/70 text-sm">High Impact Awards</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {achievements.filter(a => a.type === 'Publication').length}
          </div>
          <div className="text-white/70 text-sm">Research Publications</div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="space-y-8">
        {/* Academic Achievements */}
        {filteredAchievements.length > 0 && (
          <div>
            <motion.h4
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white mb-6 flex items-center"
            >
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
              Academic Achievements
            </motion.h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement, index) => {
                const isVisible = visibleItems.has(achievement.id);
                
                return (
                  <motion.div
                    key={achievement.id}
                    data-item-id={achievement.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedItem(selectedItem?.id === achievement.id ? null : achievement)}
                  >
                    <div className={`h-full bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      selectedItem?.id === achievement.id ? 'ring-2 ring-purple-500/50 border-purple-500/50' : ''
                    }`}>
                      {/* Achievement Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAchievementColor(achievement.type)} flex items-center justify-center text-2xl`}>
                          {getAchievementIcon(achievement.type)}
                        </div>
                        
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {achievement.title}
                          </h5>
                          <p className="text-purple-300 text-sm font-medium mb-1">
                            {achievement.institution || achievement.category}
                          </p>
                          <p className="text-white/50 text-xs">
                            {formatDate(achievement.date)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            achievement.type === 'Award' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            achievement.type === 'Honor' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            achievement.type === 'Scholarship' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            achievement.type === 'Publication' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {achievement.type}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            achievement.significance === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            achievement.significance === 'Medium' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {achievement.significance}
                          </span>
                        </div>
                      </div>

                      {/* Achievement Description */}
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>

                      {/* Hover indicator */}
                      <div className="mt-4 text-right">
                        <span className="text-purple-300 text-xs group-hover:text-purple-200 transition-colors">
                          Click for details →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {filteredCertifications.length > 0 && (
          <div>
            <motion.h4
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white mb-6 flex items-center"
            >
              <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
              Professional Certifications
            </motion.h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertifications.map((certification, index) => {
                const isVisible = visibleItems.has(certification.id);
                
                return (
                  <motion.div
                    key={certification.id}
                    data-item-id={certification.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedItem(selectedItem?.id === certification.id ? null : certification)}
                  >
                    <div className={`h-full bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      selectedItem?.id === certification.id ? 'ring-2 ring-green-500/50 border-green-500/50' : ''
                    }`}>
                      {/* Certification Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCertificationColor(certification.category)} flex items-center justify-center text-2xl`}>
                          {getCertificationIcon(certification.category)}
                        </div>
                        
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {certification.name}
                          </h5>
                          <p className="text-green-300 text-sm font-medium mb-1">
                            {certification.issuer}
                          </p>
                          <p className="text-white/50 text-xs">
                            Issued: {formatDate(certification.issueDate)}
                          </p>
                          {certification.expiryDate && (
                            <p className="text-white/50 text-xs">
                              Expires: {formatDate(certification.expiryDate)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            certification.category === 'Technical' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            certification.category === 'Professional' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            certification.category === 'Academic' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {certification.category}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            certification.isExpired 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {certification.isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Certification Description */}
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-4">
                        {certification.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {certification.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {certification.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                            +{certification.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Hover indicator */}
                      <div className="text-right">
                        <span className="text-green-300 text-xs group-hover:text-green-200 transition-colors">
                          Click for details →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content based on item type */}
              {'type' in selectedItem ? (
                <AchievementModal achievement={selectedItem as AcademicAchievement} onClose={() => setSelectedItem(null)} />
              ) : (
                <CertificationModal certification={selectedItem as Certification} onClose={() => setSelectedItem(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Achievement Modal Component
const AchievementModal: React.FC<{ achievement: AcademicAchievement; onClose: () => void }> = ({ achievement, onClose }) => (
  <div>
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
          achievement.type === 'Award' ? 'from-yellow-500 to-orange-500' :
          achievement.type === 'Honor' ? 'from-purple-500 to-pink-500' :
          achievement.type === 'Scholarship' ? 'from-green-500 to-emerald-500' :
          achievement.type === 'Publication' ? 'from-blue-500 to-indigo-500' :
          'from-gray-500 to-slate-500'
        } flex items-center justify-center text-3xl`}>
          {achievement.type === 'Award' ? '🏆' :
           achievement.type === 'Honor' ? '🎖️' :
           achievement.type === 'Scholarship' ? '💰' :
           achievement.type === 'Publication' ? '📚' : '🎯'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{achievement.title}</h3>
          <p className="text-purple-300 text-lg font-semibold">{achievement.institution || achievement.category}</p>
          <p className="text-white/50">{new Date(achievement.date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        ✕
      </motion.button>
    </div>

    <div className="space-y-4">
      <p className="text-white/80 leading-relaxed">{achievement.description}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Type:</span>
          <span className="text-white/90">{achievement.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Significance:</span>
          <span className={`font-medium ${
            achievement.significance === 'High' ? 'text-yellow-300' :
            achievement.significance === 'Medium' ? 'text-blue-300' : 'text-gray-300'
          }`}>
            {achievement.significance}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Category:</span>
          <span className="text-white/90">{achievement.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Date:</span>
          <span className="text-white/90">{new Date(achievement.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
);

// Certification Modal Component
const CertificationModal: React.FC<{ certification: Certification; onClose: () => void }> = ({ certification, onClose }) => (
  <div>
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
          certification.category === 'Technical' ? 'from-blue-500 to-indigo-500' :
          certification.category === 'Professional' ? 'from-purple-500 to-violet-500' :
          certification.category === 'Academic' ? 'from-green-500 to-teal-500' :
          'from-gray-500 to-slate-500'
        } flex items-center justify-center text-3xl`}>
          📜
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{certification.name}</h3>
          <p className="text-green-300 text-lg font-semibold">{certification.issuer}</p>
          <p className="text-white/50">Issued: {new Date(certification.issueDate).toLocaleDateString()}</p>
        </div>
      </div>
      
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        ✕
      </motion.button>
    </div>

    <div className="space-y-6">
      <p className="text-white/80 leading-relaxed">{certification.description}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Category:</span>
          <span className="text-white/90">{certification.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Status:</span>
          <span className={certification.isExpired ? 'text-red-400' : 'text-green-400'}>
            {certification.isExpired ? 'Expired' : 'Active'}
          </span>
        </div>
        {certification.expiryDate && (
          <div className="flex justify-between">
            <span className="text-white/60">Expires:</span>
            <span className="text-white/90">{new Date(certification.expiryDate).toLocaleDateString()}</span>
          </div>
        )}
        {certification.credentialId && (
          <div className="flex justify-between">
            <span className="text-white/60">Credential ID:</span>
            <span className="text-white/90 font-mono text-xs">{certification.credentialId}</span>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Skills Validated</h4>
        <div className="flex flex-wrap gap-2">
          {certification.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {certification.credentialUrl && (
        <div className="text-center">
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors"
          >
            <span>Verify Credential</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  </div>
);

export default AcademicAchievements;