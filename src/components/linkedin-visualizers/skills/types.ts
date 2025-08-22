// LinkedIn Skills Visualization Types

export interface Skill {
  name: string;
  category: SkillCategory;
  level: number; // 1-5 (1 = Beginner, 5 = Expert)
  endorsements: number;
  yearsOfExperience: number;
  lastUsed: string; // ISO date string
  certifications?: string[];
  projects?: string[];
  trending?: boolean;
  industryDemand?: 'low' | 'medium' | 'high' | 'critical';
}

export type SkillCategory = 
  | 'Technical Skills'
  | 'XR/VR Specific'
  | 'Programming Languages'
  | 'Frameworks & Libraries'
  | 'Tools & Platforms'
  | 'Soft Skills'
  | 'Leadership'
  | 'Design & Creative';

export interface SkillTimeline {
  skill: string;
  startDate: string;
  milestones: Array<{
    date: string;
    event: string;
    type: 'certification' | 'project' | 'promotion' | 'training';
    description?: string;
  }>;
}

export interface Endorsement {
  skill: string;
  endorserName: string;
  endorserTitle: string;
  relationship: 'colleague' | 'manager' | 'client' | 'peer';
  date: string;
  context?: string;
}

export interface SkillsData {
  skills: Skill[];
  timelines: SkillTimeline[];
  endorsements: Endorsement[];
  summary: {
    totalSkills: number;
    totalEndorsements: number;
    expertLevelSkills: number;
    trendingSkills: number;
    averageExperience: number;
  };
}

export interface SkillsVisualizationProps {
  data: SkillsData;
}

// LinkedIn Professional Colors
export const LINKEDIN_COLORS = {
  primary: '#0077B5',
  secondary: '#005885',
  accent: '#00A0DC',
  light: '#4F9CDB',
  background: '#F3F6F8',
  text: '#000000',
  secondaryText: '#666666',
  border: '#D9D9D9',
  hover: '#E6F3FF',
  success: '#057642',
  warning: '#B24020',
  info: '#0077B5'
} as const;

// Skill Level Colors
export const SKILL_LEVEL_COLORS = {
  1: '#E1E5E9', // Beginner - Light gray
  2: '#4F9CDB', // Intermediate - Light blue
  3: '#0077B5', // Proficient - LinkedIn blue
  4: '#005885', // Advanced - Darker blue
  5: '#003F5C'  // Expert - Deep blue
} as const;

// Category Colors
export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  'Technical Skills': '#0077B5',
  'XR/VR Specific': '#00A0DC',
  'Programming Languages': '#4F9CDB',
  'Frameworks & Libraries': '#005885',
  'Tools & Platforms': '#057642',
  'Soft Skills': '#B24020',
  'Leadership': '#8B5CF6',
  'Design & Creative': '#EC4899'
} as const;