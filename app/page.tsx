'use client'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import 3D components for better performance
const BackgroundVisualizer = dynamic(() => import('@/components/three/BackgroundVisualizer'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
});

const HeroSection = dynamic(() => import('@/components/sections/hero-section'), {
  ssr: false
});

const ProjectsSection = dynamic(() => import('@/components/sections/projects-section'), {
  ssr: false
});

const AboutSection = dynamic(() => import('@/components/sections/about-section'), {
  ssr: false
});

const ContactSection = dynamic(() => import('@/components/sections/contact-section'), {
  ssr: false
});

const GitHubVisualizersSection = dynamic(() => import('@/components/github-visualizers/GitHubVisualizersSection'), {
  ssr: false
});


const FloatingNav = dynamic(() => import('@/components/navigation/floating-nav'), {
  ssr: false
});

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <FloatingNav />

      {/* 3D Artistic Background */}
      <Suspense fallback={<div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />}>
        <BackgroundVisualizer />
      </Suspense>

      {/* Main Content */}
      <div className="relative z-10">
        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
          <AboutSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
          <ProjectsSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
          <GitHubVisualizersSection />
        </Suspense>

        {/* LinkedIn section removed */}

        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
          <ContactSection />
        </Suspense>
      </div>
    </>
  );
}
