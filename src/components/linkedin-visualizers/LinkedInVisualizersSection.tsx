'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinkedInProfile } from '../../hooks/useLinkedInProfile';
import ProfessionalTimeline from './timeline/ProfessionalTimeline';
import ProfessionalStats from './stats/ProfessionalStats';
import { LinkedInExperienceCard } from './experience';
import EducationTimeline from './education/EducationTimeline';
import EducationCard from './education/EducationCard';
import AcademicAchievements from './education/AcademicAchievements';
import { educationEntries, certifications, academicAchievements } from './education/educationData';
import { siteConfig } from '@/config/site';

interface Tab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Professional Overview',
    icon: '📊',
    description: 'Career statistics and professional metrics'
  },
  {
    id: 'timeline',
    label: 'Career Timeline',
    icon: '📅',
    description: 'Interactive journey through professional milestones'
  },
  {
    id: 'experience',
    label: 'Work Experience',
    icon: '💼',
    description: 'Detailed view of professional positions and achievements'
  },
  {
    id: 'education',
    label: 'Education & Certifications',
    icon: '🎓',
    description: 'Academic background, degrees, and professional certifications'
  }
];

export default function LinkedInVisualizersSection() {
  const { profile, stats, timeline, loading, error, refetch } = useLinkedInProfile();
  const [activeTab, setActiveTab] = useState('overview');

  if (error) {
    return (
      <section id="linkedin-visualizers" className="section-anchor-offset py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8"
            >
              <h3 className="text-red-400 text-xl font-semibold mb-2" role="alert">
                Failed to load LinkedIn data
              </h3>
              <p className="text-red-300 mb-4">{error}</p>
              <motion.button
                onClick={refetch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Retry
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Profile Header */}
            {profile?.personalInfo && (
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10">
                    <span className="text-4xl font-bold text-white/60">
                      {profile.personalInfo?.name?.charAt(0) ?? 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {profile.personalInfo?.name ?? 'Unknown User'}
                    </h2>
                    <p className="text-purple-300 text-xl mb-3">
                      {profile.personalInfo?.headline ?? 'Professional'}
                    </p>
                    <p className="text-white/60 mb-4">
                      {profile.personalInfo?.location ?? 'Earth'}
                    </p>
                    <p className="text-white/80 leading-relaxed max-w-3xl">
                      {profile.personalInfo?.summary ?? 'Profile information is unavailable.'}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-white/50">
                      <span>{profile.personalInfo?.connectionCount ?? 0} connections</span>
                      <span>•</span>
                      <span>{profile.personalInfo?.followerCount ?? 0} followers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Stats */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Professional Metrics</h3>
              {stats && <ProfessionalStats stats={{
                totalExperience: stats.totalExperience,
                totalPositions: stats.totalPositions,
                totalEducation: profile?.education?.length || 0,
                totalSkills: stats.totalSkills,
                totalCertifications: profile?.certifications?.length || 0,
                totalConnections: profile?.personalInfo?.connectionCount || 0,
                profileViews: stats.profileViews,
                skillEndorsements: stats.totalEndorsements
              }} loading={loading} />}
            </div>
          </motion.div>
        );

      case 'timeline':
        return (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Career Journey</h3>
              {timeline && timeline.length > 0 ? (
                <ProfessionalTimeline 
                  data={timeline.map(event => ({
                    ...event,
                    type: event.type === 'experience' ? 'job' as const : event.type as any,
                    duration: event.duration ? event.duration.toString() : undefined
                  }))}
                  height={600}
                  className="w-full"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">Loading timeline data...</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'experience':
        return (
          <motion.div
            key="experience"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Work Experience</h3>
            
            {/* Current Position */}
            {profile?.currentPosition && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Current Role
                </h4>
                <LinkedInExperienceCard 
                  experience={{
                    ...profile.currentPosition,
                    duration: 'Current',
                    isCurrentRole: true,
                    technologies: profile.currentPosition.skills || [],
                    employmentType: 'Full-time' as const
                  }} 
                />
              </div>
            )}

            {/* Previous Positions */}
            {profile?.experience && profile.experience.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  Previous Experience
                </h4>
                <div className="grid gap-6">
                  {profile.experience.map((position, index) => (
                    <LinkedInExperienceCard 
                      key={position.id} 
                      experience={{
                        ...position,
                        duration: `${position.startDate} - ${position.endDate || 'Present'}`,
                        isCurrentRole: !position.endDate,
                        technologies: position.skills || [],
                        employmentType: position.employmentType === 'full-time' ? 'Full-time' as const :
                                       position.employmentType === 'part-time' ? 'Part-time' as const :
                                       position.employmentType === 'contract' ? 'Contract' as const :
                                       position.employmentType === 'freelance' ? 'Freelance' as const :
                                       'Full-time' as const
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'education':
        return (
          <motion.div
            key="education"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Education Timeline */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <EducationTimeline 
                educationEntries={educationEntries}
                certifications={certifications}
                achievements={academicAchievements}
                className="w-full"
              />
            </div>

            {/* Education Cards */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
                Academic Degrees
              </h3>
              <div className="grid gap-8">
                {educationEntries.map((education, index) => (
                  <EducationCard 
                    key={education.id} 
                    education={education} 
                    index={index} 
                  />
                ))}
              </div>
            </div>

            {/* Academic Achievements & Certifications */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <AcademicAchievements 
                achievements={academicAchievements}
                certifications={certifications}
                className="w-full"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="linkedin-visualizers" className="section-anchor-offset py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
            💼 Professional Profile
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            LinkedIn
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}Professional Journey
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Explore my professional timeline, career milestones, and technical expertise through 
            interactive visualizations powered by real LinkedIn data.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 bg-black/40 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative px-6 py-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 border border-purple-500/30 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-70 mt-1 hidden sm:block">
                      {tab.description}
                    </div>
                  </div>
                </div>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </motion.div>

        {/* LinkedIn Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <motion.a
            href={siteConfig.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-2xl hover:bg-blue-600/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="font-semibold">View Full LinkedIn Profile</span>
            <span className="text-sm opacity-70">→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}