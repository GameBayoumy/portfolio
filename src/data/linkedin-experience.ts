import { LinkedInExperience } from '../types/linkedin';

interface CompanyInfo {
  name: string;
  logo: string;
  website: string;
  industry: string;
  size: string;
  description: string;
  color: string; // Brand color for theming
}

export const companyInfo: Record<string, CompanyInfo> = {
  'MetaVerse Solutions': {
    name: 'MetaVerse Solutions',
    logo: '/images/companies/metaverse-solutions.png',
    website: 'https://metaversesolutions.com',
    industry: 'Extended Reality',
    size: '50-200 employees',
    description: 'Leading XR development company specializing in enterprise VR/AR solutions',
    color: '#6366f1'
  },
  'Immersive Dynamics': {
    name: 'Immersive Dynamics',
    logo: '/images/companies/immersive-dynamics.png',
    website: 'https://immersivedynamics.com',
    industry: 'VR/AR Technology',
    size: '20-50 employees',
    description: 'Boutique VR studio creating cutting-edge immersive experiences',
    color: '#8b5cf6'
  },
  'TechFlow Studios': {
    name: 'TechFlow Studios',
    logo: '/images/companies/techflow-studios.png',
    website: 'https://techflowstudios.com',
    industry: 'Software Development',
    size: '100-500 employees',
    description: 'Full-service digital agency with focus on web and mobile applications',
    color: '#06b6d4'
  },
  'Pixel Forge Games': {
    name: 'Pixel Forge Games',
    logo: '/images/companies/pixel-forge.png',
    website: 'https://pixelforge.games',
    industry: 'Game Development',
    size: '10-20 employees',
    description: 'Indie game studio creating innovative gaming experiences',
    color: '#f59e0b'
  }
};

export const linkedInExperiences: LinkedInExperience[] = [
  {
    id: 'exp-001',
    title: 'Senior XR Developer',
    company: 'MetaVerse Solutions',
    companyLogo: companyInfo['MetaVerse Solutions'].logo,
    companyWebsite: companyInfo['MetaVerse Solutions'].website,
    location: 'San Francisco, CA',
    startDate: '2023-03',
    duration: '1 year 5 months',
    description: 'Leading XR development team in creating next-generation virtual reality experiences for enterprise clients. Architecting scalable XR solutions using Unity, Unreal Engine, and WebXR technologies.',
    achievements: [
      'Led development of VR training platform serving 50,000+ users globally',
      'Reduced application load times by 40% through advanced optimization techniques',
      'Mentored team of 8 junior developers in XR best practices',
      'Implemented cross-platform XR framework supporting Quest, HoloLens, and WebXR',
      'Delivered 12 enterprise VR projects worth $2.5M in total contract value'
    ],
    skills: ['XR Leadership', 'Team Management', 'Enterprise Solutions', 'Performance Optimization', 'Mentoring'],
    technologies: ['Unity 3D', 'Unreal Engine 5', 'WebXR', 'Oculus SDK', 'HoloLens', 'C#', 'C++', 'TypeScript', 'Three.js'],
    projects: [
      {
        name: 'Enterprise VR Training Suite',
        description: 'Comprehensive VR training platform for Fortune 500 companies',
        technologies: ['Unity', 'Oculus SDK', 'Cloud Services', 'Analytics'],
        impact: '50,000+ users trained, 85% knowledge retention improvement'
      },
      {
        name: 'Cross-Platform XR Framework',
        description: 'Unified development framework for multiple XR platforms',
        technologies: ['Unity', 'WebXR', 'Native SDKs', 'CI/CD'],
        impact: 'Reduced development time by 60% for multi-platform deployments'
      }
    ],
    companySize: '50-200 employees',
    industry: 'Extended Reality',
    employmentType: 'Full-time',
    isCurrentRole: true
  },
  {
    id: 'exp-002',
    title: 'VR Application Developer',
    company: 'Immersive Dynamics',
    companyLogo: companyInfo['Immersive Dynamics'].logo,
    companyWebsite: companyInfo['Immersive Dynamics'].website,
    location: 'Los Angeles, CA',
    startDate: '2021-08',
    endDate: '2023-02',
    duration: '1 year 7 months',
    description: 'Specialized in developing immersive VR applications for entertainment and education sectors. Focused on creating intuitive user interfaces and seamless user experiences in virtual environments.',
    achievements: [
      'Developed award-winning VR educational experience used by 200+ schools',
      'Implemented innovative hand tracking solutions improving user engagement by 70%',
      'Optimized rendering pipeline achieving 90+ FPS on mid-range VR headsets',
      'Created reusable VR UI component library adopted across all company projects',
      'Collaborated with UX team to establish VR interaction design guidelines'
    ],
    skills: ['VR Development', 'User Experience Design', 'Performance Optimization', 'Component Architecture', 'Collaboration'],
    technologies: ['Unity 3D', 'Oculus SDK', 'SteamVR', 'Hand Tracking APIs', 'C#', 'Blender', 'Photon Networking'],
    projects: [
      {
        name: 'EduVerse Learning Platform',
        description: 'Immersive educational VR experience for K-12 students',
        technologies: ['Unity', 'Oculus SDK', 'Educational APIs', 'Analytics'],
        impact: 'Used by 200+ schools, 95% teacher satisfaction rate'
      },
      {
        name: 'VR UI Component Library',
        description: 'Reusable UI components for VR applications',
        technologies: ['Unity', 'Custom Shaders', 'Hand Tracking', 'Documentation'],
        impact: 'Reduced UI development time by 50% across all projects'
      }
    ],
    companySize: '20-50 employees',
    industry: 'VR/AR Technology',
    employmentType: 'Full-time',
    isCurrentRole: false
  },
  {
    id: 'exp-003',
    title: 'Full-Stack Developer',
    company: 'TechFlow Studios',
    companyLogo: companyInfo['TechFlow Studios'].logo,
    companyWebsite: companyInfo['TechFlow Studios'].website,
    location: 'Austin, TX',
    startDate: '2019-06',
    endDate: '2021-07',
    duration: '2 years 2 months',
    description: 'Developed comprehensive web and mobile applications using modern JavaScript frameworks. Gained experience in full-stack development, API design, and database management while building scalable solutions.',
    achievements: [
      'Built 15+ responsive web applications using React and Node.js',
      'Designed and implemented RESTful APIs serving 100,000+ daily requests',
      'Established CI/CD pipelines reducing deployment time from hours to minutes',
      'Mentored 3 junior developers in modern development practices',
      'Led migration from legacy PHP system to modern React/Node.js stack'
    ],
    skills: ['Full-Stack Development', 'API Design', 'Database Management', 'DevOps', 'Code Review'],
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Full-featured e-commerce solution with real-time inventory',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
        impact: 'Processing $500K+ monthly transactions'
      },
      {
        name: 'Real-time Analytics Dashboard',
        description: 'Live data visualization platform for business metrics',
        technologies: ['React', 'D3.js', 'WebSockets', 'InfluxDB'],
        impact: 'Improved decision-making speed by 40% for client teams'
      }
    ],
    companySize: '100-500 employees',
    industry: 'Software Development',
    employmentType: 'Full-time',
    isCurrentRole: false
  },
  {
    id: 'exp-004',
    title: 'Junior Game Developer',
    company: 'Pixel Forge Games',
    companyLogo: companyInfo['Pixel Forge Games'].logo,
    companyWebsite: companyInfo['Pixel Forge Games'].website,
    location: 'Seattle, WA',
    startDate: '2018-01',
    endDate: '2019-05',
    duration: '1 year 5 months',
    description: 'Started career in game development working on indie mobile and PC games. Learned fundamental programming concepts, game engine usage, and collaborative development practices in a creative environment.',
    achievements: [
      'Contributed to 3 published mobile games with 500K+ combined downloads',
      'Implemented game mechanics and UI systems using Unity and C#',
      'Optimized game performance for mobile devices achieving 60 FPS target',
      'Collaborated with artists and designers using version control systems',
      'Learned agile development methodologies and sprint planning'
    ],
    skills: ['Game Development', 'Problem Solving', 'Version Control', 'Agile Methodology', 'Cross-functional Collaboration'],
    technologies: ['Unity 3D', 'C#', 'Git', 'Mobile SDKs', 'Analytics APIs', 'Photoshop'],
    projects: [
      {
        name: 'Mystic Quest Mobile',
        description: 'Fantasy adventure game for iOS and Android',
        technologies: ['Unity', 'C#', 'Mobile Analytics', 'In-App Purchases'],
        impact: '300K+ downloads, 4.2 App Store rating'
      },
      {
        name: 'Puzzle Master',
        description: 'Brain training puzzle game with progressive difficulty',
        technologies: ['Unity', 'C#', 'Game Analytics', 'Social Integration'],
        impact: '200K+ downloads, featured on Google Play'
      }
    ],
    companySize: '10-20 employees',
    industry: 'Game Development',
    employmentType: 'Full-time',
    isCurrentRole: false
  }
];

export const skillsProgression = [
  {
    skill: 'Unity 3D',
    category: 'Technical' as const,
    level: 5,
    experienceIds: ['exp-001', 'exp-002', 'exp-004'],
    firstIntroduced: '2018-01',
    yearsOfExperience: 6
  },
  {
    skill: 'C#',
    category: 'Languages' as const,
    level: 5,
    experienceIds: ['exp-001', 'exp-002', 'exp-004'],
    firstIntroduced: '2018-01',
    yearsOfExperience: 6
  },
  {
    skill: 'XR Development',
    category: 'Technical' as const,
    level: 5,
    experienceIds: ['exp-001', 'exp-002'],
    firstIntroduced: '2021-08',
    yearsOfExperience: 3
  },
  {
    skill: 'React',
    category: 'Frameworks' as const,
    level: 4,
    experienceIds: ['exp-003'],
    firstIntroduced: '2019-06',
    yearsOfExperience: 2
  },
  {
    skill: 'Team Leadership',
    category: 'Soft Skills' as const,
    level: 4,
    experienceIds: ['exp-001', 'exp-003'],
    firstIntroduced: '2021-08',
    yearsOfExperience: 2
  },
  {
    skill: 'Performance Optimization',
    category: 'Technical' as const,
    level: 5,
    experienceIds: ['exp-001', 'exp-002', 'exp-004'],
    firstIntroduced: '2018-01',
    yearsOfExperience: 5
  }
];