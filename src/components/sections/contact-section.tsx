'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Github, 
  Linkedin, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { ContactFormData } from '@/types';

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    projectType: undefined,
    budget: undefined,
    timeline: undefined,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just open email client
      const emailBody = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ASubject: ${formData.subject}%0D%0AProject Type: ${formData.projectType || 'Not specified'}%0D%0ABudget: ${formData.budget || 'Not specified'}%0D%0ATimeline: ${formData.timeline || 'Not specified'}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
      
      window.open(`mailto:contact@sharifbayoumy.com?subject=${encodeURIComponent(formData.subject)}&body=${emailBody}`);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        projectType: undefined,
        budget: undefined,
        timeline: undefined,
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@sharifbayoumy.com',
      link: 'mailto:contact@sharifbayoumy.com',
      color: 'text-neon-blue',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Netherlands',
      color: 'text-neon-green',
    },
    {
      icon: Clock,
      label: 'Timezone',
      value: 'CET (UTC+1)',
      color: 'text-neon-purple',
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/GameBayoumy',
      color: 'hover:text-white',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/sharif-bayoumy/',
      color: 'hover:text-blue-400',
    },
    {
      icon: ExternalLink,
      label: 'Portfolio',
      href: 'https://sharifbayoumy.nl',
      color: 'hover:text-neon-pink',
    },
  ];

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
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8"
      id="contact"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Let's Create Together</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Have an XR project in mind? Let's discuss how we can bring your vision to life 
            with cutting-edge immersive technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info & Social */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-8"
          >
            {/* Contact Information */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-center gap-4">
                    <div className={`p-3 glass-morphism rounded-lg ${info.color}`}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-white hover:text-neon-blue transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-6">Connect With Me</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 glass-morphism rounded-lg text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 group`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Availability Status */}
            <motion.div variants={itemVariants} className="glass-morphism p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-semibold">Available for Projects</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                I'm currently accepting new XR development projects and consulting opportunities. 
                Typical response time is within 24 hours.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass-morphism rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass-morphism rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                  placeholder="Project inquiry, collaboration, etc."
                />
              </div>

              {/* Project Type & Budget Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass-morphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                  >
                    <option value="">Select type</option>
                    <option value="xr">XR/VR/AR Development</option>
                    <option value="web">Web Development</option>
                    <option value="game">Game Development</option>
                    <option value="ai">AI/ML Integration</option>
                    <option value="research">Research Project</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass-morphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                  >
                    <option value="">Select budget</option>
                    <option value="under-5k">Under €5K</option>
                    <option value="5k-15k">€5K - €15K</option>
                    <option value="15k-50k">€15K - €50K</option>
                    <option value="50k-plus">€50K+</option>
                    <option value="discuss">Let's discuss</option>
                  </select>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
                  Timeline
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="long-term">Long-term project</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 glass-morphism rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all resize-none"
                  placeholder="Tell me about your project, goals, and how I can help..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-green-900/20 border border-green-500/20 rounded-lg text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Message sent successfully! I'll get back to you soon.</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Something went wrong. Please try again or email me directly.</span>
                </motion.div>
              )}
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}