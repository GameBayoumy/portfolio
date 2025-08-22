import { SkillsData } from './types';

// Sample XR Developer Skills Data
export const mockSkillsData: SkillsData = {
  skills: [
    // Technical Skills
    { 
      name: 'Unity 3D', 
      category: 'Technical Skills', 
      level: 5, 
      endorsements: 47, 
      yearsOfExperience: 6, 
      lastUsed: '2024-01-15',
      certifications: ['Unity Certified Developer'],
      projects: ['VR Training Simulator', 'AR Shopping App', 'Mixed Reality Showcase'],
      trending: true,
      industryDemand: 'critical'
    },
    { 
      name: 'C#', 
      category: 'Programming Languages', 
      level: 5, 
      endorsements: 52, 
      yearsOfExperience: 8, 
      lastUsed: '2024-01-15',
      certifications: ['Microsoft Certified: Azure Developer'],
      projects: ['Unity VR Projects', '.NET Web Applications'],
      trending: false,
      industryDemand: 'high'
    },
    { 
      name: 'JavaScript', 
      category: 'Programming Languages', 
      level: 5, 
      endorsements: 38, 
      yearsOfExperience: 7, 
      lastUsed: '2024-01-14',
      projects: ['WebXR Applications', 'Portfolio Website', 'Interactive Visualizations'],
      trending: true,
      industryDemand: 'critical'
    },
    { 
      name: 'TypeScript', 
      category: 'Programming Languages', 
      level: 5, 
      endorsements: 34, 
      yearsOfExperience: 5, 
      lastUsed: '2024-01-14',
      projects: ['Next.js Portfolio', 'React Applications'],
      trending: true,
      industryDemand: 'high'
    },

    // XR/VR Specific
    { 
      name: 'WebXR', 
      category: 'XR/VR Specific', 
      level: 4, 
      endorsements: 29, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-10',
      projects: ['Browser-based VR Experiences', 'AR Web Applications'],
      trending: true,
      industryDemand: 'critical'
    },
    { 
      name: 'VR Interaction Design', 
      category: 'XR/VR Specific', 
      level: 5, 
      endorsements: 31, 
      yearsOfExperience: 5, 
      lastUsed: '2024-01-12',
      projects: ['VR Training Systems', 'Immersive Experiences'],
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: 'Spatial UI/UX', 
      category: 'XR/VR Specific', 
      level: 4, 
      endorsements: 24, 
      yearsOfExperience: 4, 
      lastUsed: '2024-01-08',
      projects: ['VR User Interfaces', 'AR HUD Design'],
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: 'Hand Tracking', 
      category: 'XR/VR Specific', 
      level: 4, 
      endorsements: 19, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-05',
      projects: ['Quest Hand Tracking Integration'],
      trending: true,
      industryDemand: 'medium'
    },
    { 
      name: 'Eye Tracking', 
      category: 'XR/VR Specific', 
      level: 3, 
      endorsements: 12, 
      yearsOfExperience: 2, 
      lastUsed: '2023-12-20',
      trending: false,
      industryDemand: 'medium'
    },
    { 
      name: 'Haptic Feedback', 
      category: 'XR/VR Specific', 
      level: 3, 
      endorsements: 15, 
      yearsOfExperience: 2, 
      lastUsed: '2023-12-15',
      trending: false,
      industryDemand: 'medium'
    },

    // Frameworks & Libraries
    { 
      name: 'React', 
      category: 'Frameworks & Libraries', 
      level: 5, 
      endorsements: 41, 
      yearsOfExperience: 6, 
      lastUsed: '2024-01-14',
      projects: ['Portfolio Website', 'Dashboard Applications'],
      trending: true,
      industryDemand: 'critical'
    },
    { 
      name: 'Next.js', 
      category: 'Frameworks & Libraries', 
      level: 4, 
      endorsements: 26, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-14',
      projects: ['Portfolio Website', 'Web Applications'],
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: 'Three.js', 
      category: 'Frameworks & Libraries', 
      level: 4, 
      endorsements: 22, 
      yearsOfExperience: 4, 
      lastUsed: '2024-01-12',
      projects: ['3D Web Experiences', 'WebXR Applications'],
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: 'D3.js', 
      category: 'Frameworks & Libraries', 
      level: 3, 
      endorsements: 18, 
      yearsOfExperience: 2, 
      lastUsed: '2024-01-14',
      projects: ['Data Visualizations', 'Interactive Charts'],
      trending: false,
      industryDemand: 'medium'
    },

    // Tools & Platforms
    { 
      name: 'OpenXR', 
      category: 'Tools & Platforms', 
      level: 3, 
      endorsements: 16, 
      yearsOfExperience: 2, 
      lastUsed: '2024-01-01',
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: 'Blender', 
      category: 'Tools & Platforms', 
      level: 3, 
      endorsements: 20, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-05',
      projects: ['3D Asset Creation', 'Animation'],
      trending: false,
      industryDemand: 'medium'
    },
    { 
      name: 'Git', 
      category: 'Tools & Platforms', 
      level: 5, 
      endorsements: 45, 
      yearsOfExperience: 8, 
      lastUsed: '2024-01-15',
      trending: false,
      industryDemand: 'critical'
    },
    { 
      name: 'Docker', 
      category: 'Tools & Platforms', 
      level: 3, 
      endorsements: 14, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-10',
      trending: true,
      industryDemand: 'high'
    },

    // Soft Skills
    { 
      name: 'Project Management', 
      category: 'Soft Skills', 
      level: 4, 
      endorsements: 33, 
      yearsOfExperience: 6, 
      lastUsed: '2024-01-15',
      certifications: ['PMP Certification'],
      trending: false,
      industryDemand: 'high'
    },
    { 
      name: 'Client Communication', 
      category: 'Soft Skills', 
      level: 4, 
      endorsements: 28, 
      yearsOfExperience: 7, 
      lastUsed: '2024-01-15',
      trending: false,
      industryDemand: 'high'
    },
    { 
      name: 'Creative Problem Solving', 
      category: 'Soft Skills', 
      level: 5, 
      endorsements: 39, 
      yearsOfExperience: 8, 
      lastUsed: '2024-01-15',
      trending: false,
      industryDemand: 'critical'
    },
    { 
      name: 'Team Leadership', 
      category: 'Leadership', 
      level: 3, 
      endorsements: 21, 
      yearsOfExperience: 4, 
      lastUsed: '2024-01-10',
      trending: false,
      industryDemand: 'high'
    },
    
    // Design & Creative
    { 
      name: 'UI/UX Design', 
      category: 'Design & Creative', 
      level: 4, 
      endorsements: 25, 
      yearsOfExperience: 5, 
      lastUsed: '2024-01-12',
      projects: ['VR Interface Design', 'Web Application UX'],
      trending: true,
      industryDemand: 'high'
    },
    { 
      name: '3D Modeling', 
      category: 'Design & Creative', 
      level: 3, 
      endorsements: 17, 
      yearsOfExperience: 3, 
      lastUsed: '2024-01-05',
      projects: ['VR Environment Assets', 'Product Visualizations'],
      trending: false,
      industryDemand: 'medium'
    }
  ],

  timelines: [
    {
      skill: 'Unity 3D',
      startDate: '2018-03-01',
      milestones: [
        { date: '2018-03-01', event: 'Started learning Unity', type: 'training' },
        { date: '2018-08-15', event: 'First VR project completed', type: 'project' },
        { date: '2019-06-01', event: 'Unity Certified Developer', type: 'certification' },
        { date: '2020-02-15', event: 'Lead VR Developer role', type: 'promotion' },
        { date: '2021-09-01', event: 'VR Training Platform launch', type: 'project' },
        { date: '2023-04-01', event: 'AR Shopping App release', type: 'project' }
      ]
    },
    {
      skill: 'WebXR',
      startDate: '2021-01-15',
      milestones: [
        { date: '2021-01-15', event: 'Started WebXR development', type: 'training' },
        { date: '2021-06-01', event: 'First WebXR prototype', type: 'project' },
        { date: '2022-03-15', event: 'Browser VR experience launched', type: 'project' },
        { date: '2023-08-01', event: 'WebXR expertise recognized', type: 'promotion' }
      ]
    },
    {
      skill: 'Project Management',
      startDate: '2018-09-01',
      milestones: [
        { date: '2018-09-01', event: 'First team lead role', type: 'promotion' },
        { date: '2020-04-01', event: 'PMP Certification', type: 'certification' },
        { date: '2021-11-15', event: 'Multi-team coordination', type: 'promotion' },
        { date: '2023-02-01', event: 'Client portfolio management', type: 'promotion' }
      ]
    }
  ],

  endorsements: [
    {
      skill: 'Unity 3D',
      endorserName: 'Sarah Chen',
      endorserTitle: 'Senior VR Developer',
      relationship: 'colleague',
      date: '2024-01-10',
      context: 'Worked together on VR training platform'
    },
    {
      skill: 'Project Management',
      endorserName: 'Michael Rodriguez',
      endorserTitle: 'Technical Director',
      relationship: 'manager',
      date: '2024-01-05',
      context: 'Successfully delivered multiple VR projects on time'
    },
    {
      skill: 'Creative Problem Solving',
      endorserName: 'Emily Johnson',
      endorserTitle: 'UX Designer',
      relationship: 'peer',
      date: '2023-12-28',
      context: 'Innovative solutions for spatial UI challenges'
    }
  ],

  summary: {
    totalSkills: 24,
    totalEndorsements: 589,
    expertLevelSkills: 8,
    trendingSkills: 9,
    averageExperience: 4.2
  }
};