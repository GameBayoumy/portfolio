'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Brain, Code, Gamepad2, Glasses, Award, TrendingUp } from 'lucide-react';
import type { Skill } from '@/types';

const skills: Skill[] = [
  {
    name: 'Unity 3D',
    category: 'xr-development',
    proficiency: 'expert',
    yearsOfExperience: 6,
    description: 'Advanced Unity development with focus on VR/AR applications, custom shaders, and performance optimization.',
    icon: 'gamepad'
  },
  {
    name: 'WebXR Development',
    category: 'web-development',
    proficiency: 'expert',
    yearsOfExperience: 4,
    description: 'Building immersive web-based XR experiences using Three.js, A-Frame, and native WebXR APIs.',
    icon: 'code'
  },
  {
    name: 'Eye Tracking Systems',
    category: 'xr-development',
    proficiency: 'advanced',
    yearsOfExperience: 3,
    description: 'Integration and development of eye tracking systems for enhanced user interaction and analytics.',
    icon: 'glasses'
  },
  {
    name: 'Computer Vision',
    category: 'ai-ml',
    proficiency: 'advanced',
    yearsOfExperience: 5,
    description: 'Object detection, tracking, and recognition systems using OpenCV, TensorFlow, and custom algorithms.',
    icon: 'brain'
  },
  {
    name: 'C# / .NET',
    category: 'programming',
    proficiency: 'expert',
    yearsOfExperience: 7,
    description: 'Full-stack development with C#, .NET Core, and advanced object-oriented programming patterns.',
    icon: 'code'
  },
  {
    name: 'Three.js / WebGL',
    category: '3d-graphics',
    proficiency: 'advanced',
    yearsOfExperience: 4,
    description: '3D web graphics, custom shaders (GLSL), and performance-optimized rendering pipelines.',
    icon: 'code'
  },
  {
    name: 'Spatial Computing',
    category: 'xr-development',
    proficiency: 'advanced',
    yearsOfExperience: 4,
    description: 'Mixed reality applications with spatial mapping, hand tracking, and environmental understanding.',
    icon: 'glasses'
  },
  {
    name: 'Game Engine Architecture',
    category: 'game-engines',
    proficiency: 'advanced',
    yearsOfExperience: 5,
    description: 'Custom game engine development, ECS patterns, and performance optimization for real-time applications.',
    icon: 'gamepad'
  }
];

const achievements = [
  {
    title: 'VR Innovation Award 2023',
    description: 'Recognition for groundbreaking eye-tracking VR interface',
    icon: Award,
    year: '2023'
  },
  {
    title: 'WebXR Pioneer',
    description: 'Early adopter and contributor to WebXR standards',
    icon: TrendingUp,
    year: '2022'
  },
  {
    title: '50K+ Users Reached',
    description: 'Combined user base across XR applications',
    icon: TrendingUp,
    year: '2024'
  },
  {
    title: 'Research Publications',
    description: '3 peer-reviewed papers on XR user interaction',
    icon: Brain,
    year: '2023'
  }
];

const getIcon = (iconName: string) => {
  const iconMap = {
    brain: Brain,
    code: Code,
    gamepad: Gamepad2,
    glasses: Glasses,
  };
  return iconMap[iconName as keyof typeof iconMap] || Code;
};

export default function AboutSection() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      className="section-anchor-offset relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent"
      id="about"
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
            <span className="gradient-text">About Me</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            I'm a passionate XR developer and computer scientist with a deep fascination for 
            creating immersive digital experiences. My expertise spans virtual reality, 
            augmented reality, and cutting-edge web technologies.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Story & Philosophy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Brain className="w-6 h-6 text-neon-blue" />
                My Journey
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  My journey into XR development began during my computer science studies, 
                  where I was captivated by the potential of creating alternate realities. 
                  What started as curiosity about 3D graphics evolved into a deep expertise 
                  in immersive technology development.
                </p>
                <p>
                  I specialize in bridging the gap between cutting-edge research and 
                  practical applications, particularly in eye tracking systems, spatial 
                  computing, and WebXR technologies. My work focuses on creating intuitive, 
                  performant experiences that push the boundaries of what's possible in XR.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring the latest in XR hardware, 
                  contributing to open-source projects, or researching emerging technologies 
                  like neural interfaces and haptic feedback systems.
                </p>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-neon-purple" />
                Key Achievements
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    className="glass-morphism p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <achievement.icon className="w-5 h-5 text-neon-green flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {achievement.description}
                        </p>
                        <span className="text-xs text-neon-blue mt-2 block">
                          {achievement.year}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Skills */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Code className="w-6 h-6 text-neon-pink" />
                Core Expertise
              </h3>
              <div className="space-y-4">
                {skills.map((skill) => {
                  const IconComponent = getIcon(skill.icon || 'code');
                  const proficiencyWidth = {
                    beginner: '25%',
                    intermediate: '50%',
                    advanced: '75%',
                    expert: '90%',
                  }[skill.proficiency];

                  return (
                    <motion.div
                      key={skill.name}
                      variants={itemVariants}
                      className="glass-morphism p-4 rounded-lg cursor-pointer transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveSkill(activeSkill === skill.name ? null : skill.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-neon-blue" />
                          <span className="font-semibold text-white">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{skill.yearsOfExperience}y</span>
                          <span className="capitalize text-xs px-2 py-1 bg-glass-100 rounded">
                            {skill.proficiency}
                          </span>
                        </div>
                      </div>
                      
                      {/* Proficiency Bar */}
                      <div className="w-full bg-glass-100 rounded-full h-2 mb-3">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                          initial={{ width: 0 }}
                          animate={inView ? { width: proficiencyWidth } : { width: 0 }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>

                      {/* Expandable Description */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: activeSkill === skill.name ? 'auto' : 0,
                          opacity: activeSkill === skill.name ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-gray-300 leading-relaxed pt-2">
                          {skill.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}