export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: {
    start: string;
    end: string | null; // null for current position
  };
  location: string;
  companyLogo?: string;
  companyWebsite?: string;
  description: string;
  achievements: string[];
  technologies: string[];
  skillsGained: string[];
  projectHighlights: ProjectHighlight[];
  keyMetrics?: KeyMetric[];
}

export interface ProjectHighlight {
  name: string;
  description: string;
  technologies: string[];
  impact?: string;
  link?: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  description?: string;
}

export interface SkillProgression {
  skill: string;
  level: number; // 1-5 scale
  category: 'technical' | 'soft' | 'leadership' | 'domain';
}

export interface FilterOptions {
  company?: string;
  technology?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  skillCategory?: string;
}