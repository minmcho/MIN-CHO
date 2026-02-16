
export enum View {
  DASHBOARD = 'dashboard',
  JOB_SEARCH = 'job_search',
  INTERVIEW_LAB = 'interview_lab',
  SKILL_BUILDER = 'skill_builder',
  RESUME_ANALYSIS = 'resume_analysis',
  JOURNAL = 'journal'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
}

export interface SkillNode {
  title: string;
  description: string;
  resources: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Roadmap {
  role: string;
  steps: SkillNode[];
}

export interface SkillDetailPlan {
  weeks: {
    title: string;
    topics: string[];
    objectives: string[];
  }[];
  projects: {
    name: string;
    description: string;
    techStack: string[];
  }[];
  interviewQuestions: string[];
}

export interface ResumeReport {
  score: number;
  technicalSkillsMatch: string[];
  missingKeywords: string[];
  structureFeedback: string;
  impactSuggestions: string[];
  depthAssessment: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  aiInsight?: string;
}
