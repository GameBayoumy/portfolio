import { LinkedInProfile } from '../types/linkedin';
import { siteConfig } from '@/config/site';

export const linkedInProfile: LinkedInProfile = {
  personalInfo: {
    name: "Sharif Bayoumy",
    headline: "XR Developer | Virtual Reality Specialist | Immersive Technology Innovator",
    location: "San Francisco Bay Area, California",
    profileUrl: siteConfig.linkedinUrl,
    avatarUrl: "/images/profile-avatar.jpg",
    summary: "Passionate XR Developer with 6+ years of experience creating immersive virtual and augmented reality experiences. Specialized in Unity development, WebXR technologies, and cutting-edge spatial computing solutions. Led multiple VR projects from concept to deployment, with expertise in performance optimization and cross-platform compatibility.",
    connectionCount: 1247,
    followerCount: 892
  },
  
  currentPosition: {
    id: "current-xr-dev",
    title: "Senior XR Developer",
    company: "ImmersiveTech Solutions",
    companyLogo: "/images/companies/immersivetech.png",
    location: "San Francisco, CA",
    startDate: "2022-03",
    duration: "2 years 6 months",
    description: "Leading development of enterprise VR training solutions and consumer AR applications. Architecting scalable WebXR platforms and implementing advanced haptic feedback systems.",
    skills: ["Unity 3D", "C#", "WebXR", "OpenXR", "Oculus SDK", "SteamVR", "Three.js", "React"],
    achievements: [
      "Delivered 5 major VR training modules, reducing training time by 40%",
      "Optimized rendering pipeline achieving 90+ FPS on Quest 2",
      "Led team of 4 developers in agile sprint methodology",
      "Implemented cross-platform compatibility across 6 VR headsets"
    ],
    isCurrentRole: true,
    companySize: "51-200",
    industry: "Virtual Reality Technology"
  },

  experience: [
    {
      id: "xr-dev-metaverse",
      title: "XR Developer",
      company: "MetaVerse Dynamics",
      companyLogo: "/images/companies/metaverse-dynamics.png",
      location: "Remote",
      startDate: "2020-08",
      endDate: "2022-02",
      duration: "1 year 7 months",
      description: "Developed immersive social VR experiences and multiplayer environments. Focused on real-time networking, avatar systems, and spatial audio implementation.",
      skills: ["Unity 3D", "Photon Networking", "Mirror Networking", "Blender", "Oculus SDK", "WebRTC"],
      achievements: [
        "Built multiplayer VR social platform supporting 50+ concurrent users",
        "Implemented custom avatar system with full-body tracking",
        "Reduced network latency by 35% through optimization techniques",
        "Collaborated with UI/UX team on spatial interface design"
      ],
      isCurrentRole: false,
      companySize: "11-50",
      industry: "Social VR Platforms"
    },
    
    {
      id: "unity-dev-gameforge",
      title: "Unity Developer",
      company: "GameForge Studios",
      companyLogo: "/images/companies/gameforge.png",
      location: "Los Angeles, CA",
      startDate: "2019-01",
      endDate: "2020-07",
      duration: "1 year 7 months",
      description: "Developed mobile and PC games using Unity. Specialized in 3D graphics programming, shader development, and performance optimization for various platforms.",
      skills: ["Unity 3D", "C#", "HLSL", "Mobile Optimization", "Asset Store Publishing", "Git"],
      achievements: [
        "Released 3 mobile games with 500K+ combined downloads",
        "Created reusable asset packages generating $10K+ revenue",
        "Mentored 2 junior developers in Unity best practices",
        "Implemented custom rendering pipeline for mobile devices"
      ],
      isCurrentRole: false,
      companySize: "11-50",
      industry: "Game Development"
    },
    
    {
      id: "web-dev-techstart",
      title: "Full Stack Developer",
      company: "TechStart Solutions",
      companyLogo: "/images/companies/techstart.png",
      location: "Austin, TX",
      startDate: "2017-06",
      endDate: "2018-12",
      duration: "1 year 7 months",
      description: "Built responsive web applications using modern JavaScript frameworks. Gained experience in React, Node.js, and cloud deployment that later proved valuable in WebXR development.",
      skills: ["React", "Node.js", "JavaScript", "TypeScript", "MongoDB", "AWS", "Three.js"],
      achievements: [
        "Developed 8 client web applications with 99.9% uptime",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Built interactive 3D web experiences using Three.js",
        "Optimized database queries improving load times by 45%"
      ],
      isCurrentRole: false,
      companySize: "11-50",
      industry: "Web Development"
    }
  ],

  education: [
    {
      id: "cs-degree",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2013-08",
      endDate: "2017-05",
      grade: "3.7 GPA",
      activities: ["VR Research Lab", "Game Development Club", "ACM Chapter"],
      description: "Specialized in computer graphics, artificial intelligence, and human-computer interaction. Senior project focused on VR accessibility interfaces."
    },
    {
      id: "vr-certification",
      institution: "Stanford University",
      degree: "Certificate Program",
      field: "Virtual Reality Development",
      startDate: "2018-01",
      endDate: "2018-06",
      description: "Intensive program covering advanced VR concepts, spatial computing, and immersive design principles."
    }
  ],

  skills: [
    { name: "Unity 3D", category: "XR/VR Development", proficiency: "Expert", endorsements: 47, yearsOfExperience: 6 },
    { name: "C#", category: "Programming Languages", proficiency: "Expert", endorsements: 42, yearsOfExperience: 6 },
    { name: "WebXR", category: "XR/VR Development", proficiency: "Advanced", endorsements: 23, yearsOfExperience: 3 },
    { name: "Oculus SDK", category: "XR/VR Development", proficiency: "Expert", endorsements: 31, yearsOfExperience: 4 },
    { name: "SteamVR", category: "XR/VR Development", proficiency: "Advanced", endorsements: 28, yearsOfExperience: 4 },
    { name: "Three.js", category: "Web Development", proficiency: "Advanced", endorsements: 19, yearsOfExperience: 4 },
    { name: "React", category: "Web Development", proficiency: "Advanced", endorsements: 35, yearsOfExperience: 5 },
    { name: "OpenXR", category: "XR/VR Development", proficiency: "Intermediate", endorsements: 15, yearsOfExperience: 2 },
    { name: "Blender", category: "Design Tools", proficiency: "Intermediate", endorsements: 12, yearsOfExperience: 3 },
    { name: "HLSL", category: "Programming Languages", proficiency: "Intermediate", endorsements: 18, yearsOfExperience: 3 },
    { name: "Team Leadership", category: "Soft Skills", proficiency: "Advanced", endorsements: 22, yearsOfExperience: 3 },
    { name: "Agile Methodology", category: "Project Management", proficiency: "Advanced", endorsements: 28, yearsOfExperience: 4 },
    { name: "Performance Optimization", category: "XR/VR Development", proficiency: "Advanced", endorsements: 25, yearsOfExperience: 4 },
    { name: "Cross-Platform Development", category: "XR/VR Development", proficiency: "Advanced", endorsements: 20, yearsOfExperience: 4 }
  ],

  certifications: [
    {
      id: "unity-certified",
      name: "Unity Certified Expert: Programmer",
      issuer: "Unity Technologies",
      issueDate: "2021-03",
      credentialUrl: "https://certification.unity.com/"
    },
    {
      id: "oculus-dev",
      name: "Oculus Developer Certification",
      issuer: "Meta (Oculus)",
      issueDate: "2020-11",
      credentialUrl: "https://developer.oculus.com/"
    },
    {
      id: "aws-solutions",
      name: "AWS Solutions Architect Associate",
      issuer: "Amazon Web Services",
      issueDate: "2019-08",
      expirationDate: "2025-08",
      credentialUrl: "https://aws.amazon.com/certification/"
    }
  ],

  achievements: [
    {
      id: "vr-award-2023",
      title: "Best Enterprise VR Solution",
      description: "Won industry award for innovative VR training platform that reduced workplace accidents by 60%",
      date: "2023-09",
      type: "Award",
      issuer: "VR Industry Association"
    },
    {
      id: "webxr-talk",
      title: "Speaker: 'The Future of WebXR' at VR Dev Conference",
      description: "Keynote presentation on WebXR adoption trends and technical challenges",
      date: "2023-03",
      type: "Speaking",
      issuer: "VR Developers Conference",
      url: "https://vrdevcon.com/speakers/sharif-bayoumy"
    },
    {
      id: "open-source-vr",
      title: "Open Source VR Toolkit Contributor",
      description: "Core contributor to popular open-source VR development framework with 2K+ GitHub stars",
      date: "2022-06",
      type: "Recognition",
      url: "https://github.com/vr-toolkit/core"
    },
    {
      id: "vr-paper",
      title: "Research Paper: 'Haptic Feedback in Educational VR'",
      description: "Co-authored research paper published in Journal of Virtual Reality Education",
      date: "2022-01",
      type: "Publication",
      issuer: "Journal of VR Education",
      url: "https://jvre.org/papers/haptic-feedback-education"
    }
  ]
};