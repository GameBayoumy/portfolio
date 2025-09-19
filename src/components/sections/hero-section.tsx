'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { siteConfig } from '@/config/site';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  const glowVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      id="hero"
    >
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-10 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)',
          }}
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 -right-10 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,110,0.1) 0%, transparent 70%)',
          }}
          variants={glowVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* Main Heading */}
        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
          variants={itemVariants}
        >
          <span className="block text-white mb-2">
            Hi, I'm{' '}
            <span className="gradient-text neon-glow">
              Sharif Bayoumy
            </span>
          </span>
          <span className="block text-2xl sm:text-4xl lg:text-5xl text-gray-300 font-light">
            XR Developer & Computer Scientist
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Creating immersive virtual and augmented reality experiences with cutting-edge
          technology. Passionate about pushing the boundaries of what's possible in XR,
          3D graphics, and interactive digital environments.
        </motion.p>

        {/* Specialties */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          variants={itemVariants}
        >
          {[
            'Virtual Reality',
            'Augmented Reality',
            'WebXR',
            '3D Graphics',
            'Unity',
            'Three.js',
            'Eye Tracking',
            'Spatial Computing',
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 glass-morphism text-sm text-neon-blue border border-neon-blue/20 rounded-full hover:border-neon-blue/50 transition-colors duration-300"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={itemVariants}
        >
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold text-black overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
          >
            <span className="relative z-10">View My Work</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            className="group px-8 py-4 border-2 border-neon-blue/50 text-neon-blue rounded-lg font-semibold hover:bg-neon-blue/10 hover:border-neon-blue transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.open(siteConfig.contactMailto);
            }}
          >
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Get In Touch
            </span>
          </motion.button>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex justify-center gap-6 mb-16"
          variants={itemVariants}
        >
          {[
            {
              icon: Github,
              href: siteConfig.githubUrl,
              label: 'GitHub',
              color: 'hover:text-white',
            },
            {
              icon: Linkedin,
              href: siteConfig.linkedinUrl,
              label: 'LinkedIn',
              color: 'hover:text-blue-400',
            },
            {
              icon: Mail,
              href: siteConfig.contactMailto,
              label: 'Email',
              color: 'hover:text-neon-pink',
            },
            {
              icon: ExternalLink,
              href: '#',
              label: 'Resume',
              color: 'hover:text-neon-green',
            },
          ].map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              className={`p-3 rounded-full glass-morphism text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 group`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              title={social.label}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <social.icon className="w-6 h-6" />
              <span className="sr-only">{social.label}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-500 mb-2">Scroll to explore</p>
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
                  }}
          >
            <ArrowDown className="w-6 h-6 text-neon-blue" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Interactive VR Headset Hint */}
      <motion.div
        className="absolute bottom-10 left-10 hidden lg:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="glass-morphism p-4 rounded-lg max-w-xs">
          <p className="text-sm text-gray-300 mb-2">
            <span className="text-neon-blue">💡 Tip:</span> Click the VR headset
          </p>
          <p className="text-xs text-gray-400">
            Interact with the 3D model to explore XR projects
          </p>
        </div>
      </motion.div>
    </section>
  );
}