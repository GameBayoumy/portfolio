import React from 'react';
import { ExperienceCards } from './index';

const ExperienceDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Professional Experience
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Explore Sharif Bayoumy's career journey in XR/VR development with interactive experience cards 
            showcasing skills progression, key achievements, and technology evolution.
          </p>
        </div>

        <ExperienceCards />
      </div>
    </div>
  );
};

export default ExperienceDemo;