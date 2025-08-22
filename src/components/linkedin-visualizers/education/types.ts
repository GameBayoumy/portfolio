export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors: string[];
  description: string;
  location: string;
  logo?: string;
  relevantCoursework: string[];
  projects: EducationProject[];
  achievements: string[];
  activities: string[];
  isCompleted: boolean;
  degreeType: 'Bachelor' | 'Master' | 'PhD' | 'Certificate' | 'Diploma' | 'Associate';
  institutionType: 'University' | 'College' | 'Institute' | 'Academy' | 'School' | 'Online Platform';
  accreditation?: string;
  website?: string;
}

export interface EducationProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  type: 'Research' | 'Capstone' | 'Thesis' | 'Course Project' | 'Independent Study';
  duration: string;
  outcomes?: string[];
  links?: {
    github?: string;
    demo?: string;
    publication?: string;
  };
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  description: string;
  logo?: string;
  isExpired: boolean;
  category: 'Technical' | 'Professional' | 'Academic' | 'Industry' | 'Vendor';
}

export interface AcademicAchievement {
  id: string;
  title: string;
  type: 'Award' | 'Honor' | 'Scholarship' | 'Recognition' | 'Publication' | 'Competition';
  description: string;
  date: string;
  institution?: string;
  category: string;
  significance: 'High' | 'Medium' | 'Low';
}

export interface EducationTimeline {
  educationEntries: EducationEntry[];
  certifications: Certification[];
  achievements: AcademicAchievement[];
}

export interface EducationStats {
  totalEducationYears: number;
  totalCertifications: number;
  activeCertifications: number;
  totalAchievements: number;
  currentEducationLevel: string;
  fieldsOfStudy: string[];
  institutionsAttended: number;
  averageGPA?: number;
  researchProjects: number;
  publicationsCount: number;
}