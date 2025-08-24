import { ReactNode } from 'react';

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  imageUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  screenshots?: string[];
  achievements?: string[];
  teamSize?: number;
  duration?: string;
  startDate: Date;
  endDate?: Date;
  xrFeatures?: XRFeatures;
}

export type ProjectCategory = 
  | 'xr' 
  | 'game' 
  | 'web' 
  | 'mobile' 
  | 'ai' 
  | 'tool' 
  | 'research';

export type ProjectStatus = 
  | 'completed' 
  | 'in-progress' 
  | 'prototype' 
  | 'concept';

// XR specific types
export interface XRFeatures {
  platform: XRPlatform[];
  trackingType: XRTrackingType[];
  interactions: XRInteraction[];
  deviceSupport: XRDevice[];
  performanceLevel: PerformanceLevel;
}

export type XRPlatform = 
  | 'webxr' 
  | 'unity' 
  | 'unreal' 
  | 'native-vr' 
  | 'native-ar';

export type XRTrackingType = 
  | '6dof' 
  | '3dof' 
  | 'eye-tracking' 
  | 'hand-tracking' 
  | 'body-tracking' 
  | 'object-tracking';

export type XRInteraction = 
  | 'gaze' 
  | 'gesture' 
  | 'voice' 
  | 'haptic' 
  | 'controller' 
  | 'touch';

export type XRDevice = 
  | 'quest' 
  | 'vive' 
  | 'index' 
  | 'pico' 
  | 'hololens' 
  | 'magic-leap' 
  | 'mobile-ar' 
  | 'web-browser';

export type PerformanceLevel = 'low' | 'medium' | 'high' | 'ultra';

// Skill types
export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  yearsOfExperience: number;
  projects?: string[]; // Project IDs
  certifications?: string[];
  icon?: string;
  description?: string;
}

export type SkillCategory = 
  | 'xr-development' 
  | 'programming' 
  | '3d-graphics' 
  | 'game-engines' 
  | 'web-development' 
  | 'ai-ml' 
  | 'tools' 
  | 'soft-skills';

export type SkillProficiency = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert';

// Experience types
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  type: EmploymentType;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  projects?: string[]; // Project IDs
  companyUrl?: string;
  companyLogo?: string;
}

export type EmploymentType = 
  | 'full-time' 
  | 'part-time' 
  | 'contract' 
  | 'freelance' 
  | 'internship';

// Education types
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  coursework?: string[];
  achievements?: string[];
  thesis?: {
    title: string;
    description: string;
    url?: string;
  };
}

// Contact types
export interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  timezone: string;
  availability: AvailabilityStatus;
  social: SocialLinks;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  portfolio?: string;
  resume?: string;
}

export type AvailabilityStatus = 
  | 'available' 
  | 'busy' 
  | 'not-available';

// UI Component types
export interface ComponentProps {
  children?: ReactNode;
  className?: string;
}

// 3D Scene types
export interface Scene3DProps {
  performanceMode?: PerformanceLevel;
  enablePostProcessing?: boolean;
  enableShadows?: boolean;
  backgroundColor?: string;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
}

export interface VRHeadsetModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  interactive?: boolean;
  animationSpeed?: number;
  glowIntensity?: number;
}

export interface ParticleSystemProps {
  count?: number;
  spread?: number;
  speed?: number;
  size?: number;
  color?: string;
  opacity?: number;
  animationSpeed?: number;
}

// Animation types
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
  autoplay?: boolean;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType?: ProjectCategory;
  budget?: BudgetRange;
  timeline?: TimelineRange;
}

export type BudgetRange = 
  | 'under-5k' 
  | '5k-15k' 
  | '15k-50k' 
  | '50k-plus' 
  | 'discuss';

export type TimelineRange = 
  | 'asap' 
  | '1-3-months' 
  | '3-6-months' 
  | '6-12-months' 
  | 'long-term';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: ReactNode;
  description?: string;
  external?: boolean;
}

// SEO types
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structured?: any; // JSON-LD structured data
}

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  triangles: number;
  drawCalls: number;
}

// Visualizer configuration types
export interface VisualizerConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  category: 'particles' | 'geometry' | 'models' | 'effects';
  complexity: 'low' | 'medium' | 'high';
  requiredFeatures: string[];
  thumbnail: string;
  demoProps: Record<string, any>;
}

// Error types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}