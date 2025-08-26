'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Home, User, Briefcase, Github, Linkedin as LinkedinIcon, Mail, Menu, X } from 'lucide-react';



interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Home', icon: Home, href: '#hero' },
  { id: 'about', label: 'About', icon: User, href: '#about' },
  { id: 'projects', label: 'Projects', icon: Briefcase, href: '#projects' },
  { id: 'github-stats', label: 'GitHub', icon: Github, href: '#github-stats' },
  { id: 'linkedin-visualizers', label: 'LinkedIn', icon: LinkedinIcon, href: '#linkedin-visualizers' },
  { id: 'contact', label: 'Contact', icon: Mail, href: '#contact' },
];

export default function FloatingNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // We'll use a motion value for scroll progress and top offset
  const scrollProgress = useMotionValue(0);
  const smoothScrollProgress = useSpring(scrollProgress, { stiffness: 120, damping: 20 });
  const topOffset = useMotionValue(24); // px, default top-6
  const smoothTopOffset = useSpring(topOffset, { stiffness: 120, damping: 20 });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      scrollProgress.set(progress);
      // Animate top offset for nav bar
      if (scrollY > 50) {
        setIsScrolled(true);
        topOffset.set(16); // px, top-4
      } else {
        setIsScrolled(false);
        topOffset.set(24); // px, top-6
      }

      // Find active section
      const sections = navItems.map(item => item.id);
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress, topOffset]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className={
          'fixed left-1/2 transform -translate-x-1/2 z-50 hidden md:block transition-all duration-300'
        }
        style={{ top: smoothTopOffset }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.div
        className="fixed top-4 right-4 z-50 md:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-20 right-4 z-50 md:hidden"
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px]">
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = activeSection === item.id;
                    const Icon = item.icon;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <motion.a
                      href="https://github.com/GameBayoumy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-800/50 text-white/70 hover:text-white hover:bg-gray-700/50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/sharif-bayoumy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center p-2 rounded-lg bg-blue-600/20 text-blue-300 hover:text-blue-200 hover:bg-blue-600/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LinkedinIcon className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="mailto:contact@sharifbayoumy.com"
                      className="flex-1 flex items-center justify-center p-2 rounded-lg bg-pink-600/20 text-pink-300 hover:text-pink-200 hover:bg-pink-600/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail className="w-5 h-5" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 z-50 origin-left"
        style={{ scaleX: smoothScrollProgress }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.1 }}
      />
    </>
  );
}