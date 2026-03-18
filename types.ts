export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'frontend' | 'backend' | 'design' | 'soft-skills' | 'tools' | 'other';
}

export interface PortfolioData {
  id?: number;
  fullName: string;
  headline: string;
  about: string;
  location: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

export interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  matchScore: number;
  reason: string;
  url?: string;
}

export interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  marketOutlook: string;
  jobRecommendations: JobRecommendation[];
}

export type UserRole = 'candidate' | 'employer' | 'administrator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // For mock auth only
}

export interface CandidateProfile {
  user: User;
  portfolio: PortfolioData | null;
  analysis: ResumeAnalysis | null;
  lastUpdated: string;
}

export type ViewMode = 'upload' | 'analyzing' | 'portfolio' | 'employer' | 'employer-dashboard' | 'admin-dashboard';