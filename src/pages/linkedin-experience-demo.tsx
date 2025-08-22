import React from 'react';
import Head from 'next/head';
import { ExperienceDemo } from '../components/linkedin-visualizers/experience';

const LinkedInExperienceDemoPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>LinkedIn Experience Cards Demo - Sharif Bayoumy Portfolio</title>
        <meta name="description" content="Interactive LinkedIn experience cards showcasing Sharif Bayoumy's XR development career journey with skills progression and achievements." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <ExperienceDemo />
    </>
  );
};

export default LinkedInExperienceDemoPage;