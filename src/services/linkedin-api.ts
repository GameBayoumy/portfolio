import { LinkedInProfile, ProfessionalStats as LinkedInStats, TimelineEvent, LinkedInAPIResponse } from '../components/linkedin-visualizers/types';

// Mock LinkedIn data for development and demonstration
const mockLinkedInData = {
  profile: {
    personalInfo: {
      name: "Sharif Bayoumy",
      headline: "XR Developer & Computer Scientist",
      location: "Netherlands",
      summary: "Passionate XR developer with expertise in virtual and augmented reality technologies. Experienced in Unity, WebXR, Three.js, and cutting-edge spatial computing solutions. Dedicated to pushing the boundaries of immersive technology and creating innovative digital experiences.",
      connectionCount: 500,
      followerCount: 1200,
      industry: "Technology",
      website: "https://sharifbayoumy.com"
    },
    currentPosition: {
      id: "current-1",
      title: "Senior XR Developer",
      company: "Innovation Labs",
      location: "Netherlands",
      startDate: "2023-01-01",
      isCurrent: true,
      description: "Leading XR development initiatives and creating immersive experiences for enterprise clients.",
      achievements: [
        "Developed 5+ VR applications for enterprise training",
        "Implemented WebXR solutions with 99.9% uptime",
        "Led team of 6 developers in XR project delivery"
      ],
      skills: ["Unity", "WebXR", "Three.js", "C#", "JavaScript", "VR", "AR"],
      employmentType: "full-time" as const
    },
    experience: [
      {
        id: "exp-1",
        title: "XR Developer",
        company: "Tech Innovations BV",
        location: "Amsterdam, Netherlands",
        startDate: "2021-06-01",
        endDate: "2022-12-31",
        isCurrent: false,
        description: "Developed VR and AR applications for various industries including healthcare, education, and entertainment.",
        achievements: [
          "Built 10+ VR training modules for healthcare professionals",
          "Created AR product visualization tools increasing sales by 30%",
          "Optimized Unity applications reducing load times by 50%"
        ],
        skills: ["Unity", "C#", "ARCore", "ARKit", "Oculus SDK"],
        employmentType: "full-time" as const
      },
      {
        id: "exp-2",
        title: "Frontend Developer",
        company: "Digital Solutions",
        location: "Rotterdam, Netherlands",
        startDate: "2020-01-01",
        endDate: "2021-05-31",
        isCurrent: false,
        description: "Focused on creating interactive web experiences and 3D visualizations using modern web technologies.",
        achievements: [
          "Developed 3D product configurators using Three.js",
          "Implemented WebGL-based data visualizations",
          "Improved website performance by 40% through optimization"
        ],
        skills: ["JavaScript", "Three.js", "React", "WebGL", "TypeScript"],
        employmentType: "full-time" as const
      }
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of Technology",
        degree: "Master of Science",
        field: "Computer Science",
        startDate: "2018-09-01",
        endDate: "2020-08-31",
        description: "Specialized in Computer Graphics and Human-Computer Interaction"
      },
      {
        id: "edu-2",
        institution: "Technical College",
        degree: "Bachelor of Applied Science",
        field: "Software Engineering",
        startDate: "2015-09-01",
        endDate: "2018-07-31"
      }
    ],
    skills: [
      {
        id: "skill-1",
        name: "Unity",
        category: "technical" as const,
        level: "expert" as const,
        endorsements: 45,
        yearsOfExperience: 5
      },
      {
        id: "skill-2",
        name: "WebXR",
        category: "technical" as const,
        level: "advanced" as const,
        endorsements: 32,
        yearsOfExperience: 3
      },
      {
        id: "skill-3",
        name: "Three.js",
        category: "technical" as const,
        level: "expert" as const,
        endorsements: 38,
        yearsOfExperience: 4
      },
      {
        id: "skill-4",
        name: "C#",
        category: "technical" as const,
        level: "advanced" as const,
        endorsements: 41,
        yearsOfExperience: 5
      },
      {
        id: "skill-5",
        name: "JavaScript",
        category: "technical" as const,
        level: "expert" as const,
        endorsements: 50,
        yearsOfExperience: 6
      },
      {
        id: "skill-6",
        name: "Project Management",
        category: "professional" as const,
        level: "advanced" as const,
        endorsements: 28,
        yearsOfExperience: 3
      }
    ],
    certifications: [
      {
        id: "cert-1",
        name: "Unity Certified Developer",
        issuer: "Unity Technologies",
        issueDate: "2022-03-15",
        skills: ["Unity", "C#", "Game Development"]
      },
      {
        id: "cert-2",
        name: "Meta Quest Developer",
        issuer: "Meta",
        issueDate: "2023-01-20",
        skills: ["VR", "Oculus SDK", "Unity"]
      }
    ],
    projects: [
      {
        id: "proj-1",
        name: "VR Training Simulator",
        description: "Enterprise VR training platform for industrial safety protocols",
        startDate: "2023-03-01",
        endDate: "2023-08-31",
        status: "completed" as const,
        skills: ["Unity", "VR", "C#", "Networking"]
      },
      {
        id: "proj-2",
        name: "WebXR Portfolio",
        description: "Interactive 3D portfolio showcasing XR projects in the browser",
        startDate: "2023-10-01",
        status: "in-progress" as const,
        skills: ["WebXR", "Three.js", "JavaScript", "WebGL"]
      }
    ]
  },
  stats: {
    totalExperience: 4,
    totalPositions: 3,
    totalCompanies: 3,
    totalSkills: 25,
    totalEndorsements: 234,
    profileViews: 1500,
    searchAppearances: 85,
    postImpressions: 12000,
    connectionGrowth: 15,
    skillsRanking: {
      "Unity": 95,
      "WebXR": 88,
      "Three.js": 92,
      "JavaScript": 89
    },
    careerGrowthRate: 25,
    averageTenure: 18
  },
  timeline: [
    {
      id: "timeline-1",
      type: "experience" as const,
      date: "2023-01-01",
      title: "Senior XR Developer",
      subtitle: "Innovation Labs",
      description: "Promoted to senior role, leading XR development initiatives",
      company: "Innovation Labs",
      location: "Netherlands",
      skills: ["Unity", "WebXR", "Team Leadership"],
      importance: "high" as const,
      duration: 12
    },
    {
      id: "timeline-2",
      type: "certification" as const,
      date: "2023-01-20",
      title: "Meta Quest Developer Certification",
      subtitle: "Meta",
      description: "Achieved certification in VR development for Meta Quest platform",
      skills: ["VR", "Oculus SDK"],
      importance: "medium" as const
    },
    {
      id: "timeline-3",
      type: "project" as const,
      date: "2023-03-01",
      title: "VR Training Simulator Launch",
      subtitle: "Enterprise Project",
      description: "Successfully delivered VR training platform for industrial clients",
      skills: ["Unity", "VR", "C#"],
      importance: "high" as const,
      duration: 6
    },
    {
      id: "timeline-4",
      type: "experience" as const,
      date: "2021-06-01",
      title: "XR Developer",
      subtitle: "Tech Innovations BV",
      description: "Started specializing in XR development and immersive technologies",
      company: "Tech Innovations BV",
      location: "Amsterdam",
      skills: ["Unity", "ARCore", "ARKit"],
      importance: "high" as const,
      duration: 18
    },
    {
      id: "timeline-5",
      type: "education" as const,
      date: "2020-08-31",
      title: "Master's Degree Completed",
      subtitle: "University of Technology",
      description: "Graduated with M.Sc. in Computer Science, specializing in Computer Graphics",
      institution: "University of Technology",
      skills: ["Computer Graphics", "HCI", "Research"],
      importance: "critical" as const
    }
  ]
};

class LinkedInAPIService {
  private baseUrl = process.env.NEXT_PUBLIC_LINKEDIN_API_URL || '/api/linkedin';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<LinkedInAPIResponse<T>> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        let mockResponse: LinkedInAPIResponse<T>;
        
        switch (endpoint) {
          case '/profile':
            mockResponse = {
              data: mockLinkedInData.profile as T,
              success: true,
              lastUpdated: new Date().toISOString()
            };
            break;
          case '/stats':
            mockResponse = {
              data: mockLinkedInData.stats as T,
              success: true,
              lastUpdated: new Date().toISOString()
            };
            break;
          case '/timeline':
            mockResponse = {
              data: mockLinkedInData.timeline as T,
              success: true,
              lastUpdated: new Date().toISOString()
            };
            break;
          default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }

        this.cache.set(cacheKey, { data: mockResponse, timestamp: Date.now() });
        return mockResponse;
      }

      // Production API call
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('LinkedIn API fetch error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<LinkedInProfile> {
    const response = await this.fetchWithCache<LinkedInProfile>('/profile');
    return response.data;
  }

  async getStats(): Promise<LinkedInStats> {
    const response = await this.fetchWithCache<LinkedInStats>('/stats');
    return response.data;
  }

  async getTimeline(): Promise<TimelineEvent[]> {
    const response = await this.fetchWithCache<TimelineEvent[]>('/timeline');
    return response.data;
  }

  async getSkillsByCategory(): Promise<Record<string, any[]>> {
    const profile = await this.getProfile();
    const skillsByCategory: Record<string, any[]> = {};
    
    profile.skills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill);
    });

    return skillsByCategory;
  }

  async getTopSkills(limit: number = 10): Promise<any[]> {
    const profile = await this.getProfile();
    return profile.skills
      .sort((a, b) => b.endorsements - a.endorsements)
      .slice(0, limit);
  }

  async searchProfile(query: string): Promise<{
    positions: any[];
    skills: any[];
    achievements: any[];
  }> {
    const profile = await this.getProfile();
    const lowercaseQuery = query.toLowerCase();

    const positions = profile.experience.filter(exp =>
      exp.title.toLowerCase().includes(lowercaseQuery) ||
      exp.company.toLowerCase().includes(lowercaseQuery) ||
      exp.description.toLowerCase().includes(lowercaseQuery)
    );

    const skills = profile.skills.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery)
    );

    const achievements: string[] = [];
    profile.experience.forEach(exp => {
      exp.achievements.forEach(achievement => {
        if (achievement.toLowerCase().includes(lowercaseQuery)) {
          achievements.push(achievement);
        }
      });
    });

    return { positions, skills, achievements };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const LinkedInAPI = new LinkedInAPIService();