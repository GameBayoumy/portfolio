'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EducationEntry, Certification, AcademicAchievement } from './types';

interface EducationTimelineProps {
  educationEntries: EducationEntry[];
  certifications: Certification[];
  achievements: AcademicAchievement[];
  className?: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: 'education' | 'certification' | 'achievement';
  title: string;
  subtitle: string;
  description: string;
  data: EducationEntry | Certification | AcademicAchievement;
  icon: string;
  color: string;
}

const EducationTimeline: React.FC<EducationTimelineProps> = ({
  educationEntries,
  certifications,
  achievements,
  className = ''
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Combine and sort all timeline events
  const timelineEvents: TimelineEvent[] = [
    ...educationEntries.map(entry => ({
      id: entry.id,
      date: entry.startDate,
      type: 'education' as const,
      title: entry.degree,
      subtitle: entry.institution,
      description: entry.description,
      data: entry,
      icon: '🎓',
      color: 'from-blue-500 to-purple-500'
    })),
    ...certifications.map(cert => ({
      id: cert.id,
      date: cert.issueDate,
      type: 'certification' as const,
      title: cert.name,
      subtitle: cert.issuer,
      description: cert.description,
      data: cert,
      icon: '📜',
      color: 'from-green-500 to-blue-500'
    })),
    ...achievements.map(achievement => ({
      id: achievement.id,
      date: achievement.date,
      type: 'achievement' as const,
      title: achievement.title,
      subtitle: achievement.institution || achievement.category,
      description: achievement.description,
      data: achievement,
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = entry.target.getAttribute('data-event-id');
            if (eventId) {
              setVisibleEvents(prev => new Set([...prev, eventId]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const eventElements = document.querySelectorAll('[data-event-id]');
    eventElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getEventDuration = (event: TimelineEvent) => {
    if (event.type === 'education') {
      const entry = event.data as EducationEntry;
      const start = new Date(entry.startDate);
      const end = entry.endDate ? new Date(entry.endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return years > 0 ? `${years}y ${months}m` : `${months}m`;
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Header */}
      <div className="text-center mb-12">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Academic & Professional Journey
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-lg max-w-2xl mx-auto"
        >
          A comprehensive timeline of educational milestones, certifications, and academic achievements
        </motion.p>
      </div>

      {/* Timeline Container */}
      <div ref={timelineRef} className="relative">
        {/* Central timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />

        {/* Timeline Events */}
        <div className="space-y-16">
          {timelineEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isVisible = visibleEvents.has(event.id);

            return (
              <motion.div
                key={event.id}
                data-event-id={event.id}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`relative flex items-center ${
                  isLeft ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Event Card */}
                <motion.div
                  className={`relative w-5/12 ${isLeft ? 'mr-auto' : 'ml-auto'}`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 cursor-pointer hover:border-purple-500/50 transition-all duration-300 ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-purple-500/50 border-purple-500/50' : ''
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    {/* Event Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center text-2xl`}>
                        {event.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-bold text-white line-clamp-2">
                            {event.title}
                          </h4>
                          <span className="text-sm text-white/50 whitespace-nowrap ml-4">
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <p className="text-purple-300 font-semibold mb-1">
                          {event.subtitle}
                        </p>
                        {event.type === 'education' && (
                          <p className="text-white/50 text-sm">
                            Duration: {getEventDuration(event)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Event Description */}
                    <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Type Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                        event.type === 'education' 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : event.type === 'certification'
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {event.type}
                      </span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        <span className="text-sm">View Details →</span>
                      </motion.button>
                    </div>

                    {/* Expand indicator */}
                    {selectedEvent?.id === event.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full"
                      />
                    )}
                  </div>

                  {/* Connection line to center */}
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r ${
                      isLeft 
                        ? 'right-0 translate-x-full from-purple-500 to-transparent' 
                        : 'left-0 -translate-x-full from-transparent to-purple-500'
                    }`}
                  />
                </motion.div>

                {/* Center timeline node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="absolute left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${event.color} border-4 border-black/40 shadow-lg`} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedEvent.color} flex items-center justify-center text-3xl`}>
                    {selectedEvent.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-purple-300 text-lg font-semibold">
                      {selectedEvent.subtitle}
                    </p>
                    <p className="text-white/50 text-sm">
                      {formatDate(selectedEvent.date)}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => setSelectedEvent(null)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                <p className="text-white/80 leading-relaxed">
                  {selectedEvent.description}
                </p>

                {/* Render specific content based on event type */}
                {selectedEvent.type === 'education' && (
                  <EducationDetails entry={selectedEvent.data as EducationEntry} />
                )}
                {selectedEvent.type === 'certification' && (
                  <CertificationDetails certification={selectedEvent.data as Certification} />
                )}
                {selectedEvent.type === 'achievement' && (
                  <AchievementDetails achievement={selectedEvent.data as AcademicAchievement} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Education Details Component
const EducationDetails: React.FC<{ entry: EducationEntry }> = ({ entry }) => (
  <div className="space-y-6">
    {/* Academic Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Academic Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Field of Study:</span>
              <span className="text-white/90">{entry.fieldOfStudy}</span>
            </div>
            {entry.gpa && (
              <div className="flex justify-between">
                <span className="text-white/60">GPA:</span>
                <span className="text-white/90">{entry.gpa}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/60">Location:</span>
              <span className="text-white/90">{entry.location}</span>
            </div>
          </div>
        </div>

        {entry.honors && entry.honors.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-2">Honors & Recognition</h4>
            <div className="flex flex-wrap gap-2">
              {entry.honors?.map((honor, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30"
                >
                  {honor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-white font-semibold mb-2">Relevant Coursework</h4>
        <div className="flex flex-wrap gap-2">
          {entry.relevantCoursework.slice(0, 8).map((course, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
            >
              {course}
            </span>
          ))}
          {entry.relevantCoursework.length > 8 && (
            <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
              +{entry.relevantCoursework.length - 8} more
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Projects */}
    {entry.projects.length > 0 && (
      <div>
        <h4 className="text-white font-semibold mb-4">Key Projects</h4>
        <div className="space-y-4">
          {entry.projects.map((project, index) => (
            <div key={project.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-white font-medium">{project.title}</h5>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {project.type}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {project.outcomes && project.outcomes.length > 0 && (
                <div>
                  <h6 className="text-white/80 font-medium text-sm mb-2">Outcomes:</h6>
                  <ul className="space-y-1">
                    {project.outcomes.map((outcome, outcomeIndex) => (
                      <li key={outcomeIndex} className="text-white/70 text-xs flex items-start">
                        <span className="text-green-400 mr-2 mt-0.5">✓</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Certification Details Component
const CertificationDetails: React.FC<{ certification: Certification }> = ({ certification }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Certification Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Category:</span>
              <span className="text-white/90">{certification.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Issue Date:</span>
              <span className="text-white/90">{new Date(certification.issueDate).toLocaleDateString()}</span>
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
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-2">Skills Validated</h4>
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
);

// Achievement Details Component
const AchievementDetails: React.FC<{ achievement: AcademicAchievement }> = ({ achievement }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-white font-semibold mb-2">Achievement Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Type:</span>
            <span className="text-white/90">{achievement.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Category:</span>
            <span className="text-white/90">{achievement.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Date:</span>
            <span className="text-white/90">{new Date(achievement.date).toLocaleDateString()}</span>
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
        </div>
      </div>
    </div>
  </div>
);

export default EducationTimeline;