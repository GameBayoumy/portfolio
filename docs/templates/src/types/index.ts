import type { ReactNode } from 'react';
import type { Vector3 } from 'three';

// Common types
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[];
  technologies: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured?: boolean;
  demoUrl?: string;
  codeUrl?: string;
  videoUrl?: string;
  modelUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  metrics?: ProjectMetrics;
}

export type ProjectCategory = 
  | 'webxr'
  | 'ar'
  | 'vr'
  | 'web3d'
  | 'game'
  | 'visualization'
  | 'other';

export type ProjectStatus = 
  | 'concept'
  | 'in-progress'
  | 'completed'
  | 'published'
  | 'archived';

export interface ProjectMetrics {
  views?: number;
  likes?: number;
  downloads?: number;
  stars?: number;
}

// Skill types
export interface Skill {
  name: string;
  level: number; // 0-100
  category: SkillCategory;
  icon?: string;
  description?: string;
}

export type SkillCategory = 
  | 'frontend'
  | 'backend'
  | '3d'
  | 'xr'
  | 'tools'
  | 'languages'
  | 'frameworks';

// Experience types
export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  technologies: string[];
  achievements?: string[];
}

// Education types
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  description?: string;
  achievements?: string[];
}

// Contact types
export interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  socialMedia: SocialMedia[];
  availability: AvailabilityStatus;
}

export interface SocialMedia {
  platform: string;
  url: string;
  username: string;
  icon?: string;
}

export type AvailabilityStatus = 
  | 'available'
  | 'busy'
  | 'not-available';

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType?: ProjectCategory;
  budget?: string;
  timeline?: string;
}

// 3D and XR types
export interface Scene3D {
  camera?: {
    position: Vector3;
    target: Vector3;
  };
  lighting?: {
    ambient: number;
    directional: {
      intensity: number;
      position: Vector3;
    };
  };
  environment?: string;
}

export interface XRCapabilities {
  ar: boolean;
  vr: boolean;
  handTracking?: boolean;
  eyeTracking?: boolean;
  spatialMapping?: boolean;
}

// Performance types
export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  geometries: number;
  textures: number;
  triangles: number;
  memory: {
    used: number;
    limit: number;
  };
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

// Animation types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
  autoplay?: boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// API response types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Intersection Observer types
export interface IntersectionConfig {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

// Viewport types
export interface ViewportSize {
  width: number;
  height: number;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Event types
export interface CustomEvent<T = any> {
  type: string;
  detail: T;
  timestamp: number;
}

// File types
export interface FileUpload {
  file: File;
  preview?: string;
  status: LoadingState;
  progress?: number;
  error?: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'skill' | 'experience';
  relevance: number;
  url?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'default' | 'destructive';
}

// Modal types
export interface ModalProps extends BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Component state types
export interface ComponentState<T = any> {
  data?: T;
  loading: boolean;
  error?: string;
  initialized: boolean;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  SITE_URL: string;
  API_BASE_URL: string;
  ENABLE_ANALYTICS: boolean;
  ENABLE_XR_MODE: boolean;
  DEBUG_MODE: boolean;
}