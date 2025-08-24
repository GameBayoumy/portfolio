'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ThreeVisualizersSection } from '@/components/three';

interface ShowcaseSectionProps {
  className?: string;
}

const ShowcaseSection = memo(function ShowcaseSection({
  className = ''
}: ShowcaseSectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isIntersecting = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 ${className}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Interactive Showcase
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience cutting-edge 3D visualizations and interactive demonstrations 
              showcasing modern web technologies and creative engineering.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { icon: '🚀', label: 'WebGL 2.0' },
              { icon: '⚡', label: 'Real-time' },
              { icon: '📱', label: 'Responsive' },
              { icon: '🎮', label: 'Interactive' },
              { icon: '🧠', label: 'AI-Enhanced' }
            ].map((feature, index) => (
              <div 
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-300">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <ThreeVisualizersSection
            showStats={true}
            enableNavigation={true}
            autoRotateCamera={true}
            maxConcurrentVisualizers={1}
            performanceMode="auto"
            className="max-w-7xl mx-auto px-4"
          />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="max-w-4xl mx-auto px-4 text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isIntersecting ? 1 : 0, y: isIntersecting ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Build Something Amazing?
            </h3>
            <p className="text-gray-300 mb-6">
              Let's discuss how these technologies can bring your next project to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start a Project
              </motion.button>
              <motion.button
                className="px-8 py-3 border border-gray-300 text-gray-300 rounded-lg font-medium transition-all hover:bg-white/5 hover:border-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Source Code
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default ShowcaseSection;