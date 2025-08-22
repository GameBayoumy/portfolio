// LinkedIn Profile Types
export interface LinkedInProfile {
  personalInfo: PersonalInfo;
  currentPosition: Position;
  experience: Position[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
}

export interface PersonalInfo {
  name: string;
  headline: string;
  location: string;
  profileUrl: string;
  avatarUrl: string;
  summary: string;
  connectionCount: number;
  followerCount: number;
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  size?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, null if current
  location: string;
  description: string;
  skills: string[];
  companyLogo?: string;
  companySize?: string;
  industry?: string;
  achievements: string[];
  isCurrent?: boolean;
}

// Position interface matching the data structure used in the components
export interface Position {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  startDate: string;
  endDate?: string;
  duration: string;
  description: string;
  skills: string[];
  achievements: string[];
  isCurrentRole: boolean;
  companySize?: string;
  industry?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade?: string;
  activities?: string[];
  logo?: string;
  description?: string;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
  endorsements?: number;
  isTop?: boolean;
}

export type SkillCategory = 
  | 'Programming Languages'
  | 'XR/VR Development'
  | 'Game Development'
  | 'Web Development'
  | 'Mobile Development'
  | 'Cloud Technologies'
  | 'Databases'
  | 'DevOps'
  | 'Design Tools'
  | 'Project Management'
  | 'Soft Skills';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  role: string;
  achievements: string[];
  url?: string;
  githubUrl?: string;
  images?: string[];
  associatedWith?: string; // Company or organization
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Award' | 'Recognition' | 'Publication' | 'Speaking' | 'Milestone';
  issuer?: string;
  url?: string;
}

// Timeline visualization types
export interface TimelineItem {
  id: string;
  type: 'experience' | 'education' | 'certification' | 'project' | 'achievement';
  title: string;
  subtitle: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
  color: string;
  icon: string;
  details: Experience | Education | Certification | Project | Achievement;
}

export interface TimelineConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  itemHeight: number;
  colors: {
    experience: string;
    education: string;
    certification: string;
    project: string;
    achievement: string;
  };
}

// Professional stats
export interface ProfessionalStats {
  totalExperience: number; // in years
  companiesWorked: number;
  projectsCompleted: number;
  skillsAcquired: number;
  certificationsEarned: number;
  leadershipRoles: number;
}

// Professional stats
export interface LinkedInStats {
  totalExperience: number; // years
  totalPositions: number;
  totalEducation: number;
  totalSkills: number;
  totalCertifications: number;
  totalConnections: number;
  profileViews: number;
  skillEndorsements: number;
}

// Timeline Event for Professional Timeline
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'experience' | 'education' | 'certification' | 'achievement' | 'project' | 'volunteer';
  company?: string;
  logo?: string;
  skills?: string[];
  duration?: string;
}

// API response types (for future API integration)
export interface LinkedInApiResponse<T> {
  data: T;
  cached: boolean;
  timestamp: number;
  error?: string;
}

export interface LinkedInError {
  code: string;
  message: string;
  details?: any;
}

// New LinkedIn Experience interface for experience cards component
export interface LinkedInExperience {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  startDate: string;
  endDate?: string;
  duration: string;
  description: string;
  achievements: string[];
  skills: string[];
  technologies: string[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    impact?: string;
  }[];
  companySize?: string;
  industry?: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  isCurrentRole: boolean;
}