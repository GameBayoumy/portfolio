'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Play, Eye, Calendar, Users, Cpu } from 'lucide-react';
import type { Project } from '@/types';

const projects: Project[] = [
  {
    id: '1',
    title: 'Virtual Reality Eye Tracking System',
    description: 'Advanced VR simulation with precision eye tracking technology for enhanced user interaction and data analytics.',
    longDescription: 'Developed a comprehensive VR system that integrates high-precision eye tracking technology to create immersive experiences with advanced user interaction patterns. The system captures and analyzes user gaze patterns, attention mapping, and interaction behaviors for research and commercial applications.',
    technologies: ['Unity', 'C#', 'VR SDKs', 'Eye Tracking', 'Data Analytics', 'Computer Vision'],
    category: 'xr',
    status: 'completed',
    featured: true,
    imageUrl: '/images/projects/vr-eye-tracking.jpg',
    videoUrl: '/videos/vr-eye-tracking-demo.mp4',
    githubUrl: 'https://github.com/sharifbayoumy/vr-eye-tracking',
    achievements: [
      'Achieved 99.2% eye tracking accuracy',
      'Reduced user interaction latency by 45%',
      'Published research findings in VR conference',
      'Patent pending for novel gaze-based UI patterns'
    ],
    teamSize: 3,
    duration: '8 months',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-02-01'),
    xrFeatures: {
      platform: ['unity', 'native-vr'],
      trackingType: ['6dof', 'eye-tracking'],
      interactions: ['gaze', 'gesture', 'controller'],
      deviceSupport: ['quest', 'vive', 'index'],
      performanceLevel: 'high'
    }
  },
  {
    id: '2',
    title: 'WebXR Museum Experience',
    description: 'Interactive virtual museum accessible through web browsers with immersive 3D galleries and artifact exploration.',
    longDescription: 'Created an accessible virtual museum experience using WebXR technologies, allowing users to explore historical artifacts and art pieces in immersive 3D environments directly through web browsers without additional software.',
    technologies: ['Three.js', 'WebXR', 'React', 'TypeScript', 'GLSL', 'Web Audio API'],
    category: 'xr',
    status: 'completed',
    featured: true,
    demoUrl: 'https://webxr-museum-demo.sharifbayoumy.com',
    githubUrl: 'https://github.com/sharifbayoumy/webxr-museum',
    achievements: [
      'Cross-platform compatibility across devices',
      '50,000+ visitors in first month',
      'Featured in WebXR showcase',
      'Award: Best Educational XR Experience 2023'
    ],
    teamSize: 1,
    duration: '6 months',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-07-01'),
    xrFeatures: {
      platform: ['webxr'],
      trackingType: ['6dof', '3dof'],
      interactions: ['controller', 'touch'],
      deviceSupport: ['quest', 'mobile-ar', 'web-browser'],
      performanceLevel: 'medium'
    }
  },
  {
    id: '3',
    title: 'AR Data Visualization Tool',
    description: 'Augmented reality application for visualizing complex datasets in 3D space with real-time data streaming.',
    longDescription: 'Built an innovative AR application that transforms complex data sets into interactive 3D visualizations overlaid on the real world. Features real-time data streaming, collaborative viewing, and gesture-based interaction.',
    technologies: ['Unity', 'ARCore', 'ARKit', 'C#', 'REST APIs', 'Real-time Networking'],
    category: 'xr',
    status: 'in-progress',
    featured: true,
    achievements: [
      'Real-time processing of 10M+ data points',
      'Collaborative multi-user AR sessions',
      'Integration with 15+ data sources'
    ],
    teamSize: 4,
    duration: '12 months',
    startDate: new Date('2023-08-01'),
    xrFeatures: {
      platform: ['native-ar'],
      trackingType: ['6dof', 'object-tracking'],
      interactions: ['gesture', 'voice', 'touch'],
      deviceSupport: ['mobile-ar', 'hololens'],
      performanceLevel: 'high'
    }
  },
  {
    id: '4',
    title: 'Multiplayer VR Game Engine',
    description: 'Custom VR game engine with networking capabilities for seamless multiplayer experiences across platforms.',
    longDescription: 'Developed a custom VR game engine from the ground up with advanced networking architecture to support large-scale multiplayer VR experiences. Features include cross-platform compatibility, voice chat, physics synchronization, and custom shader pipeline.',
    technologies: ['C++', 'OpenGL', 'Vulkan', 'Networking', 'Physics Engine', 'Audio Processing'],
    category: 'game',
    status: 'prototype',
    featured: false,
    githubUrl: 'https://github.com/sharifbayoumy/vr-game-engine',
    achievements: [
      'Supports 32 concurrent VR players',
      'Sub-20ms network latency optimization',
      'Custom physics engine with haptic feedback'
    ],
    teamSize: 2,
    duration: '14 months',
    startDate: new Date('2022-10-01'),
    endDate: new Date('2024-01-01'),
    xrFeatures: {
      platform: ['native-vr'],
      trackingType: ['6dof', 'hand-tracking', 'body-tracking'],
      interactions: ['controller', 'gesture', 'haptic', 'voice'],
      deviceSupport: ['quest', 'vive', 'index', 'pico'],
      performanceLevel: 'ultra'
    }
  }
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'xr' | 'game' | 'web'>('all');
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const filteredProjects = projects.filter(
    project => filter === 'all' || project.category === filter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8"
      id="projects"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore my latest work in XR development, showcasing innovative solutions 
            for virtual and augmented reality experiences.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex gap-2 p-2 glass-morphism rounded-lg">
            {['all', 'xr', 'game', 'web'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-6 py-2 rounded-md capitalize transition-all duration-300 ${
                  filter === filterOption
                    ? 'bg-neon-blue text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="group relative glass-morphism rounded-xl p-6 hover:bg-glass-200 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProject(project)}
              whileHover={{ y: -5 }}
            >
              {/* Project Header */}
              <div className="mb-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-neon-blue transition-colors">
                    {project.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      project.status === 'completed'
                        ? 'bg-green-900/50 text-green-300'
                        : project.status === 'in-progress'
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-orange-900/50 text-orange-300'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-glass-100 text-xs text-gray-300 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="px-2 py-1 bg-glass-100 text-xs text-gray-400 rounded">
                    +{project.technologies.length - 4}
                  </span>
                )}
              </div>

              {/* Project Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                {project.teamSize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.duration}
                  </div>
                )}
                {project.xrFeatures && (
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {project.xrFeatures.performanceLevel}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {project.demoUrl && (
                  <button className="flex items-center gap-1 px-3 py-2 bg-neon-blue/20 text-neon-blue text-xs rounded hover:bg-neon-blue/30 transition-colors">
                    <Play className="w-3 h-3" />
                    Demo
                  </button>
                )}
                {project.githubUrl && (
                  <button className="flex items-center gap-1 px-3 py-2 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-700 transition-colors">
                    <Github className="w-3 h-3" />
                    Code
                  </button>
                )}
                <button className="flex items-center gap-1 px-3 py-2 bg-glass-100 text-gray-300 text-xs rounded hover:bg-glass-200 transition-colors">
                  <Eye className="w-3 h-3" />
                  Details
                </button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}