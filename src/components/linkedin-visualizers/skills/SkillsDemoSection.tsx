'use client';

import { motion } from 'framer-motion';
import { SkillsShowcase, mockSkillsData } from './index';

interface SkillsDemoSectionProps {
  className?: string;
}

export function SkillsDemoSection({ className = '' }: SkillsDemoSectionProps) {
  return (
    <section className={`min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 py-20 ${className}`}>
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="text-white font-semibold">LinkedIn Skills Visualization</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            XR Developer Skills
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto mb-8">
            Interactive visualization of professional skills, endorsements, and career progression 
            in Extended Reality development and technology leadership.
          </p>

          {/* Key Features */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { title: 'Skills Radar', desc: 'Interactive proficiency chart', value: '24 Skills' },
              { title: 'Endorsements', desc: 'Professional validation', value: '589 Total' },
              { title: 'Career Timeline', desc: 'Development journey', value: '6+ Years' },
              { title: 'Expert Level', desc: 'Advanced proficiency', value: '8 Skills' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4"
              >
                <div className="text-2xl font-bold text-white mb-1">{feature.value}</div>
                <div className="text-white/80 font-medium text-sm mb-1">{feature.title}</div>
                <div className="text-white/60 text-xs">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills Showcase */}
        <SkillsShowcase data={mockSkillsData} />

        {/* Professional Summary */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Professional Skills Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Technical Excellence</h4>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• Unity 3D & C# Expert (6+ years)</li>
                  <li>• WebXR & Three.js Advanced</li>
                  <li>• React/TypeScript Proficient</li>
                  <li>• VR Interaction Design Expert</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Professional Growth</h4>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• 589+ Professional Endorsements</li>
                  <li>• 4.2 Years Average Experience</li>
                  <li>• 9 Trending Technologies</li>
                  <li>• Continuous Learning Focus</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Industry Recognition</h4>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• Unity Certified Developer</li>
                  <li>• PMP Project Management</li>
                  <li>• Microsoft Azure Certified</li>
                  <li>• Peer-Validated Expertise</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}