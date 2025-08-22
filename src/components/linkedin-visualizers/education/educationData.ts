import { EducationEntry, Certification, AcademicAchievement, EducationTimeline, EducationStats } from './types';

export const educationEntries: EducationEntry[] = [
  {
    id: 'msc-computer-science',
    institution: 'University of California, Berkeley',
    degree: 'Master of Science',
    fieldOfStudy: 'Computer Science - Human-Computer Interaction',
    startDate: '2018-09-01',
    endDate: '2020-12-15',
    gpa: '3.9/4.0',
    honors: ['Magna Cum Laude', 'Outstanding Graduate Student Award'],
    description: 'Specialized in Human-Computer Interaction with focus on Extended Reality (XR) interfaces, 3D user interaction, and immersive technologies. Conducted research on spatial computing and haptic feedback systems.',
    location: 'Berkeley, CA',
    logo: '/images/education/uc-berkeley-logo.png',
    relevantCoursework: [
      'Advanced Computer Graphics',
      'Human-Computer Interaction',
      '3D User Interfaces',
      'Virtual and Augmented Reality',
      'Machine Learning for HCI',
      'Computer Vision',
      'Advanced Algorithms',
      'Distributed Systems',
      'Mobile and Ubiquitous Computing'
    ],
    projects: [
      {
        id: 'thesis-xr-collaboration',
        title: 'Spatial Collaboration in Extended Reality Environments',
        description: 'Master\'s thesis exploring multi-user collaboration techniques in mixed reality environments. Developed novel interaction paradigms for 3D spatial manipulation and implemented cross-platform XR application supporting HoloLens, Oculus, and mobile AR.',
        technologies: ['Unity', 'C#', 'HoloLens SDK', 'Oculus SDK', 'ARCore', 'Photon Networking', 'MRTK'],
        type: 'Thesis',
        duration: '12 months',
        outcomes: [
          'Published in CHI 2021 conference',
          'Patent application filed for spatial gesture recognition',
          'Awarded Best Graduate Research Project'
        ],
        links: {
          github: 'https://github.com/sharif/xr-collaboration-thesis',
          publication: 'https://dl.acm.org/citation.cfm?id=thesis'
        }
      },
      {
        id: 'haptic-feedback-study',
        title: 'Haptic Feedback in Virtual Object Manipulation',
        description: 'Research project investigating the effectiveness of haptic feedback in virtual reality object manipulation tasks. Conducted user studies with 60+ participants using custom-built haptic interfaces.',
        technologies: ['Unity', 'C#', 'SteamVR', 'Custom Hardware', 'Python', 'Statistical Analysis'],
        type: 'Research',
        duration: '8 months',
        outcomes: [
          'Published in IEEE VR 2020',
          'Presented at ACM UIST 2020'
        ]
      }
    ],
    achievements: [
      'Graduate Student Research Award (2020)',
      'HCI Best Paper Nomination',
      'Teaching Assistant Excellence Award',
      'Dean\'s List (4 semesters)'
    ],
    activities: [
      'Graduate Student Association - Technology Committee',
      'VR/AR Research Group - Lead Developer',
      'ACM CHI Student Volunteer',
      'Women in Tech Mentorship Program'
    ],
    isCompleted: true,
    degreeType: 'Master',
    institutionType: 'University',
    accreditation: 'ABET Accredited',
    website: 'https://www.berkeley.edu'
  },
  {
    id: 'bsc-software-engineering',
    institution: 'Stanford University',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Software Engineering',
    startDate: '2014-09-01',
    endDate: '2018-06-15',
    gpa: '3.8/4.0',
    honors: ['Cum Laude', 'Phi Beta Kappa'],
    description: 'Comprehensive software engineering education with emphasis on large-scale system design, software architecture, and emerging technologies. Active in robotics and VR research labs.',
    location: 'Stanford, CA',
    logo: '/images/education/stanford-logo.png',
    relevantCoursework: [
      'Data Structures and Algorithms',
      'Software Engineering Principles',
      'Operating Systems',
      'Database Systems',
      'Computer Networks',
      'Software Architecture',
      'Mobile Application Development',
      'Web Technologies',
      'Artificial Intelligence',
      'Computer Graphics',
      'Game Development',
      'Entrepreneurship in Tech'
    ],
    projects: [
      {
        id: 'senior-capstone-ar',
        title: 'AR Navigation System for Campus Accessibility',
        description: 'Senior capstone project developing an augmented reality navigation system to improve campus accessibility for students with disabilities. Integrated with university mapping systems and accessibility databases.',
        technologies: ['Swift', 'ARKit', 'Core Location', 'Firebase', 'Node.js', 'MongoDB'],
        type: 'Capstone',
        duration: '10 months',
        outcomes: [
          'Deployed university-wide',
          'Featured in Stanford Daily',
          'Won Best Social Impact Project Award'
        ],
        links: {
          github: 'https://github.com/sharif/stanford-ar-nav',
          demo: 'https://stanford-ar-nav.demo.com'
        }
      },
      {
        id: 'vr-physics-lab',
        title: 'Virtual Reality Physics Laboratory',
        description: 'Course project creating an immersive VR environment for physics experiments. Students could manipulate objects and observe physics principles in 3D space with realistic simulations.',
        technologies: ['Unity', 'C#', 'Oculus SDK', 'Physics Simulation', 'UI/UX Design'],
        type: 'Course Project',
        duration: '4 months',
        outcomes: [
          'Adopted by Physics Department',
          'Presented at Stanford Innovation Showcase'
        ]
      }
    ],
    achievements: [
      'Outstanding Senior Project Award (2018)',
      'Computer Science Department Honor Roll',
      'hackathon Winner - TreeHacks 2017',
      'Academic Excellence Scholarship Recipient'
    ],
    activities: [
      'Stanford ACM Chapter - Vice President',
      'VR@Stanford Club - Founding Member',
      'CS106A Teaching Assistant',
      'Stanford Robotics Club'
    ],
    isCompleted: true,
    degreeType: 'Bachelor',
    institutionType: 'University',
    accreditation: 'ABET Accredited',
    website: 'https://www.stanford.edu'
  }
];

export const certifications: Certification[] = [
  {
    id: 'unity-expert',
    name: 'Unity Certified Expert: Programmer',
    issuer: 'Unity Technologies',
    issueDate: '2021-03-15',
    credentialId: 'UC-EXPERT-2021-001',
    credentialUrl: 'https://www.credly.com/badges/unity-expert-programmer',
    skills: ['Unity', 'C#', 'Game Development', '3D Programming', 'XR Development'],
    description: 'Advanced certification demonstrating expertise in Unity development, including complex scripting, performance optimization, and XR application development.',
    logo: '/images/certifications/unity-logo.png',
    isExpired: false,
    category: 'Technical'
  },
  {
    id: 'meta-ar-dev',
    name: 'Meta AR Developer Certification',
    issuer: 'Meta (Facebook)',
    issueDate: '2022-08-20',
    credentialId: 'META-AR-DEV-2022-456',
    credentialUrl: 'https://developers.facebook.com/certification/ar-developer',
    skills: ['Spark AR', 'JavaScript', 'AR Development', 'Computer Vision', 'Social AR'],
    description: 'Certification in developing augmented reality experiences for Meta platforms, including Instagram and Facebook AR effects.',
    logo: '/images/certifications/meta-logo.png',
    isExpired: false,
    category: 'Technical'
  },
  {
    id: 'microsoft-mixed-reality',
    name: 'Microsoft Mixed Reality Development',
    issuer: 'Microsoft',
    issueDate: '2021-11-10',
    credentialId: 'MS-MR-DEV-2021-789',
    credentialUrl: 'https://docs.microsoft.com/en-us/learn/certifications/mixed-reality-developer',
    skills: ['HoloLens', 'MRTK', 'Windows Mixed Reality', 'Spatial Computing', 'Holographic Apps'],
    description: 'Specialized certification for developing mixed reality applications on Microsoft platforms, including HoloLens and Windows Mixed Reality.',
    logo: '/images/certifications/microsoft-logo.png',
    isExpired: false,
    category: 'Technical'
  },
  {
    id: 'aws-solutions-architect',
    name: 'AWS Certified Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    issueDate: '2022-05-25',
    expiryDate: '2025-05-25',
    credentialId: 'AWS-CSA-PRO-2022-123',
    credentialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-professional',
    skills: ['AWS', 'Cloud Architecture', 'Scalable Systems', 'DevOps', 'Infrastructure as Code'],
    description: 'Advanced AWS certification demonstrating ability to design and deploy dynamically scalable, highly available, fault-tolerant, and reliable applications on AWS.',
    logo: '/images/certifications/aws-logo.png',
    isExpired: false,
    category: 'Technical'
  },
  {
    id: 'google-arvr-dev',
    name: 'Google AR/VR Developer Nanodegree',
    issuer: 'Google (Udacity)',
    issueDate: '2020-02-14',
    credentialId: 'GOOGLE-ARVR-2020-567',
    credentialUrl: 'https://www.udacity.com/course/vr-developer-nanodegree--nd017',
    skills: ['ARCore', 'Daydream', 'Android Development', 'VR UX Design', 'Performance Optimization'],
    description: 'Comprehensive program covering Google\'s AR and VR development platforms, including ARCore for Android and Daydream VR platform.',
    logo: '/images/certifications/google-logo.png',
    isExpired: false,
    category: 'Technical'
  },
  {
    id: 'pmp-certification',
    name: 'Project Management Professional (PMP)',
    issuer: 'Project Management Institute (PMI)',
    issueDate: '2023-01-20',
    expiryDate: '2026-01-20',
    credentialId: 'PMP-2023-8910',
    credentialUrl: 'https://www.pmi.org/certifications/project-management-pmp',
    skills: ['Project Management', 'Agile Methodologies', 'Team Leadership', 'Risk Management', 'Stakeholder Management'],
    description: 'Globally recognized certification demonstrating project management expertise and leadership capabilities.',
    logo: '/images/certifications/pmi-logo.png',
    isExpired: false,
    category: 'Professional'
  }
];

export const academicAchievements: AcademicAchievement[] = [
  {
    id: 'chi-2021-publication',
    title: 'CHI 2021 Best Paper Award',
    type: 'Publication',
    description: 'Received Best Paper Award at ACM CHI 2021 for research on "Spatial Collaboration Techniques in Extended Reality Environments"',
    date: '2021-05-15',
    institution: 'ACM CHI Conference',
    category: 'Research Excellence',
    significance: 'High'
  },
  {
    id: 'nsf-fellowship',
    title: 'National Science Foundation Graduate Research Fellowship',
    type: 'Scholarship',
    description: 'Prestigious fellowship supporting graduate research in computer science with focus on human-computer interaction.',
    date: '2019-04-01',
    institution: 'National Science Foundation',
    category: 'Research Funding',
    significance: 'High'
  },
  {
    id: 'ieee-vr-award',
    title: 'IEEE VR 2020 Outstanding Student Researcher',
    type: 'Award',
    description: 'Recognized for exceptional contributions to virtual reality research and innovative haptic feedback systems.',
    date: '2020-03-22',
    institution: 'IEEE Virtual Reality Society',
    category: 'Research Excellence',
    significance: 'High'
  },
  {
    id: 'treehacks-winner',
    title: 'TreeHacks 2017 Overall Winner',
    type: 'Competition',
    description: 'Won Stanford\'s premier hackathon with AR-based accessibility solution for campus navigation.',
    date: '2017-02-18',
    institution: 'Stanford University',
    category: 'Innovation',
    significance: 'Medium'
  },
  {
    id: 'phi-beta-kappa',
    title: 'Phi Beta Kappa Honor Society',
    type: 'Honor',
    description: 'Inducted into the nation\'s most prestigious academic honor society for outstanding academic achievement.',
    date: '2018-05-01',
    institution: 'Stanford University',
    category: 'Academic Excellence',
    significance: 'High'
  },
  {
    id: 'patent-application',
    title: 'Patent Application: Spatial Gesture Recognition System',
    type: 'Recognition',
    description: 'Filed patent application for novel spatial gesture recognition system for XR environments.',
    date: '2021-09-10',
    institution: 'US Patent Office',
    category: 'Innovation',
    significance: 'High'
  }
];

export const educationTimeline: EducationTimeline = {
  educationEntries,
  certifications,
  achievements: academicAchievements
};

export const educationStats: EducationStats = {
  totalEducationYears: 6,
  totalCertifications: 6,
  activeCertifications: 6,
  totalAchievements: 6,
  currentEducationLevel: 'Master\'s Degree',
  fieldsOfStudy: ['Computer Science', 'Software Engineering', 'Human-Computer Interaction'],
  institutionsAttended: 2,
  averageGPA: 3.85,
  researchProjects: 4,
  publicationsCount: 3
};