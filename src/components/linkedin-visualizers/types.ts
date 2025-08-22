// LinkedIn Profile Types

export interface PersonalInfo {
  name: string;
  headline: string;
  location: string;
  summary: string;
  connectionCount: number;
  followerCount: number;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  industry?: string;
  website?: string;
}

export interface ExperiencePosition {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  skills: string[];
  companySize?: string;
  companyIndustry?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  activities?: string[];
  description?: string;
  logo?: string;
  honors?: string[];
}

export interface SkillData {
  id: string;
  name: string;
  category: 'technical' | 'professional' | 'language' | 'certification';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements: number;
  yearsOfExperience?: number;
  certifications?: string[];
  projects?: string[];
  lastUsed?: string;
}

export interface CertificationData {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url?: string;
  skills: string[];
  collaborators?: string[];
  status: 'completed' | 'in-progress' | 'planned';
}

export interface ProfessionalStats {
  totalExperience: number; // years
  totalPositions: number;
  totalCompanies: number;
  totalSkills: number;
  totalEndorsements: number;
  profileViews: number;
  searchAppearances: number;
  postImpressions: number;
  connectionGrowth: number;
  industryRanking?: number;
  skillsRanking: Record<string, number>;
  careerGrowthRate: number;
  averageTenure: number; // months
}

export interface TimelineEvent {
  id: string;
  type: 'experience' | 'education' | 'certification' | 'achievement' | 'project' | 'volunteer';
  date: string;
  title: string;
  subtitle: string;
  description: string;
  company?: string;
  institution?: string;
  location?: string;
  skills?: string[];
  achievements?: string[];
  duration?: number; // months
  impact?: string;
  category?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface LinkedInProfile {
  personalInfo: PersonalInfo;
  currentPosition?: ExperiencePosition;
  experience: ExperiencePosition[];
  education: EducationEntry[];
  skills: SkillData[];
  certifications: CertificationData[];
  projects: ProjectData[];
  volunteerWork?: TimelineEvent[];
  languages?: Array<{
    name: string;
    proficiency: 'elementary' | 'limited' | 'professional' | 'full-professional' | 'native';
  }>;
  recommendations?: Array<{
    id: string;
    recommender: string;
    relationship: string;
    text: string;
    date: string;
  }>;
}

// API Response Types
export interface LinkedInAPIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  lastUpdated: string;
}

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  type?: TimelineEvent['type'][];
  skills?: string[];
  companies?: string[];
  importance?: TimelineEvent['importance'][];
}

// Component Props Types
export interface LinkedInVisualizerProps {
  profile?: LinkedInProfile;
  stats?: ProfessionalStats;
  timeline?: TimelineEvent[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export interface ExperienceCardProps {
  position: ExperiencePosition;
  index: number;
  onSkillClick?: (skill: string) => void;
  showDetails?: boolean;
}

export interface TimelineProps {
  data: TimelineEvent[];
  height?: number;
  interactive?: boolean;
  filters?: SearchFilters;
  onEventClick?: (event: TimelineEvent) => void;
  onFilterChange?: (filters: SearchFilters) => void;
}

export interface SkillsVisualizationProps {
  skills: SkillData[];
  showEndorsements?: boolean;
  interactive?: boolean;
  groupByCategory?: boolean;
  onSkillSelect?: (skill: SkillData) => void;
}

// Utility Types
export type SkillCategory = SkillData['category'];
export type ExperienceType = ExperiencePosition['employmentType'];
export type TimelineEventType = TimelineEvent['type'];
export type SkillLevel = SkillData['level'];
export type ImportanceLevel = TimelineEvent['importance'];

// Mock Data Flags
export interface LinkedInDataFlags {
  useMockData: boolean;
  enableRealTimeUpdates: boolean;
  cacheDuration: number; // minutes
  mockApiDelay: number; // milliseconds
}