/**
 * Mock data for LinkedIn integration tests
 */

import { LinkedInProfile, TimelineEvent } from '../../src/types/linkedin';
import { ProfessionalStats } from '../../src/components/linkedin-visualizers/types';

export const mockLinkedInProfile: LinkedInProfile = {
  personalInfo: {
    name: "Sharif Bayoumy",
    headline: "XR Developer & Computer Scientist",
    location: "Netherlands",
    profileUrl: "https://www.linkedin.com/in/sharif-bayoumy/",
    avatarUrl: "",
    summary: "Passionate XR developer with expertise in virtual and augmented reality technologies. Experienced in Unity, WebXR, Three.js, and cutting-edge spatial computing solutions.",
    connectionCount: 500,
    followerCount: 1200
  },
  currentPosition: {
    id: "current-1",
    title: "Senior XR Developer",
    company: "Tech Innovators Inc.",
    companyLogo: "",
    location: "Amsterdam, Netherlands",
    startDate: "2022-01-01",
    endDate: undefined,
    duration: "2y 8m",
    description: "Leading XR development initiatives and building immersive experiences for enterprise clients.",
    skills: ["React", "Three.js", "WebXR", "Unity", "C#", "TypeScript", "Node.js", "WebGL", "VR", "AR"],
    achievements: [
      "Increased user engagement by 300% with new VR training modules",
      "Led cross-functional team of 8 developers and designers",
      "Implemented WebXR framework reducing development time by 40%",
      "Delivered 15+ successful VR/AR projects for Fortune 500 clients"
    ],
    isCurrentRole: true,
    companySize: "500-1000 employees",
    industry: "Technology"
  },
  experience: [
    {
      id: "exp-1",
      title: "XR Developer",
      company: "Virtual Solutions Ltd.",
      companyLogo: "",
      location: "London, UK",
      startDate: "2020-03-01",
      endDate: "2021-12-31",
      duration: "1y 10m",
      description: "Developed innovative VR applications for training and education sectors.",
      skills: ["Unity", "C#", "Oculus SDK", "SteamVR", "Blender", "3ds Max"],
      achievements: [
        "Built award-winning VR training simulator",
        "Reduced training costs by 60% for key clients",
        "Mentored 3 junior developers"
      ],
      isCurrentRole: false,
      companySize: "50-200 employees",
      industry: "Technology"
    },
    {
      id: "exp-2",
      title: "Frontend Developer",
      company: "Digital Agency Pro",
      companyLogo: "",
      location: "Manchester, UK",
      startDate: "2018-06-01",
      endDate: "2020-02-28",
      duration: "1y 9m",
      description: "Specialized in creating interactive web experiences and 3D web applications.",
      skills: ["JavaScript", "React", "Three.js", "WebGL", "GSAP", "CSS3", "HTML5"],
      achievements: [
        "Delivered 25+ interactive web projects",
        "Improved page load times by 50% across all projects",
        "Introduced WebGL workflows to the team"
      ],
      isCurrentRole: false,
      companySize: "10-50 employees",
      industry: "Digital Marketing"
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Technology",
      degree: "Master of Science",
      field: "Computer Science - Virtual Reality",
      startDate: "2016-09-01",
      endDate: "2018-05-31",
      grade: "First Class Honours",
      activities: ["VR Research Lab", "Computer Graphics Society", "Game Development Club"],
      description: "Specialized in computer graphics, 3D rendering, and immersive technologies.",
      logo: ""
    },
    {
      id: "edu-2", 
      institution: "Technical College",
      degree: "Bachelor of Science",
      field: "Software Engineering",
      startDate: "2013-09-01",
      endDate: "2016-06-30",
      grade: "2:1",
      activities: ["Programming Society", "Robotics Club"],
      description: "Foundation in software development, algorithms, and system design.",
      logo: ""
    }
  ],
  skills: [
    {
      name: "React",
      category: "Web Development",
      proficiency: "Expert",
      endorsements: 45,
      yearsOfExperience: 5
    },
    {
      name: "Three.js",
      category: "XR/VR Development",
      proficiency: "Expert",
      endorsements: 38,
      yearsOfExperience: 4
    },
    {
      name: "Unity",
      category: "Game Development", 
      proficiency: "Advanced",
      endorsements: 42,
      yearsOfExperience: 4
    },
    {
      name: "WebXR",
      category: "XR/VR Development",
      proficiency: "Expert", 
      endorsements: 35,
      yearsOfExperience: 3
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Unity Certified Developer",
      issuer: "Unity Technologies",
      issueDate: "2021-08-15",
      expirationDate: "2024-08-15",
      credentialId: "UC-12345",
      credentialUrl: "https://unity.com/cert/12345",
      logo: ""
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "VR Innovation Award",
      issuer: "Tech Innovation Society",
      date: "2023-11-01",
      type: "Award",
      description: "Recognized for groundbreaking work in VR training solutions"
    },
    {
      id: "ach-2",
      title: "Best XR Application",
      issuer: "WebXR Awards",
      date: "2023-06-15",
      type: "Award",
      description: "First place in WebXR category for immersive web application"
    }
  ]
};

export const mockProfessionalStats: ProfessionalStats = {
  totalExperience: 5,
  totalPositions: 3,
  totalCompanies: 3,
  totalSkills: 25,
  totalEndorsements: 160,
  profileViews: 1250,
  searchAppearances: 890,
  postImpressions: 15600,
  connectionGrowth: 12,
  industryRanking: 15,
  skillsRanking: {
    "React": 8,
    "Three.js": 5,
    "Unity": 12,
    "WebXR": 3
  },
  careerGrowthRate: 85,
  averageTenure: 22
};

export const mockTimelineData: TimelineEvent[] = [
  {
    id: "timeline-1",
    date: "2022-01-01",
    title: "Senior XR Developer",
    subtitle: "Tech Innovators Inc.",
    description: "Started new role focusing on enterprise VR solutions",
    type: "experience",
    company: "Tech Innovators Inc.",
    skills: ["React", "Three.js", "WebXR", "Unity"]
  },
  {
    id: "timeline-2",
    date: "2021-08-15", 
    title: "Unity Certified Developer",
    subtitle: "Unity Technologies",
    description: "Achieved Unity certification for advanced development skills",
    type: "certification",
    skills: ["Unity", "C#", "Game Development"]
  },
  {
    id: "timeline-3",
    date: "2020-03-01",
    title: "XR Developer", 
    subtitle: "Virtual Solutions Ltd.",
    description: "Joined VR development team to build training simulations",
    type: "experience",
    company: "Virtual Solutions Ltd.",
    skills: ["Unity", "C#", "Oculus SDK", "SteamVR"]
  },
  {
    id: "timeline-4",
    date: "2018-05-31",
    title: "Master of Science - Computer Science",
    subtitle: "University of Technology", 
    description: "Completed advanced degree specializing in Virtual Reality",
    type: "education",
    skills: ["Computer Graphics", "3D Rendering", "VR Research"]
  },
  {
    id: "timeline-5",
    date: "2018-06-01",
    title: "Frontend Developer",
    subtitle: "Digital Agency Pro",
    description: "Started career in web development with focus on 3D experiences",
    type: "experience", 
    company: "Digital Agency Pro",
    skills: ["JavaScript", "React", "Three.js", "WebGL"]
  }
];