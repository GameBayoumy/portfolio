'use client';

import { Suspense } from 'react';

import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ThreeDBackground } from '@/components/three/three-d-background';

/**
 * Home page component with all main sections
 */
export default function HomePage(): JSX.Element {
  return (
    <>
      {/* 3D Background */}
      <div className='fixed inset-0 -z-20'>
        <Suspense fallback={<div className='h-full w-full bg-gradient-to-br from-background via-background/80 to-muted/20' />}>
          <ThreeDBackground />
        </Suspense>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main className='relative z-10'>
        <Suspense fallback={<LoadingScreen />}>
          {/* Hero Section */}
          <section id='hero' className='min-h-screen'>
            <HeroSection />
          </section>

          {/* About Section */}
          <section id='about' className='section-padding'>
            <AboutSection />
          </section>

          {/* Skills Section */}
          <section id='skills' className='section-padding bg-muted/20'>
            <SkillsSection />
          </section>

          {/* Projects Section */}
          <section id='projects' className='section-padding'>
            <ProjectsSection />
          </section>

          {/* Contact Section */}
          <section id='contact' className='section-padding bg-muted/20'>
            <ContactSection />
          </section>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <ScrollToTop />
    </>
  );
}