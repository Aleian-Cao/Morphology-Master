export enum PartType {
  PREFIX = 'PREFIX',
  ROOT = 'ROOT',
  SUFFIX = 'SUFFIX'
}

export interface WordPart {
  text: string;
  type: PartType;
  meaning: string;
  meaning_vi?: string; // Vietnamese meaning
}

export interface DissectionTarget {
  word: string;
  parts: WordPart[];
  translation: string; // Vietnamese translation of the whole word
}

export interface RichDerivative {
  word: string;
  definition: string;
  definition_vi: string;
  example: string;
  example_vi: string;
}

export interface Lesson {
  id: string;
  title: string;
  root: string;
  tier: number;
  category: string;
  // AI-Generated Content
  meaning?: string;
  meaning_vi?: string;
  phonetic?: string;
  etymology?: string;
  etymology_vi?: string;
  funFact?: string;
  funFact_vi?: string;
  metaphor?: string;
  metaphor_vi?: string;
  
  // Phase 2: Now a list of words to dissect
  dissectionPack?: DissectionTarget[]; 
  
  // Phase 3
  richDerivatives?: RichDerivative[]; 
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Tier {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

export interface TierAssessmentResult {
  tierId: number;
  score: number;
  passed: boolean;
  feedback: string;
  date: string;
  missedMorphemes?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface SRSRecord {
  morpheme: string;
  meaning_vi: string;
  type: PartType;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

export interface WeaknessRecord {
  morpheme: string;
  type: PartType;
  mistakeCount: number;
  lastMistakeDate: string;
}

export interface UserProgress {
  xp: number;
  completedLessons: string[];
  unlockedTiers: number[];
  garden: {
    trees: number;
    level: number;
  };
  assessments: TierAssessmentResult[];
  achievements?: Achievement[];
  srs?: Record<string, SRSRecord>;
  weaknesses?: Record<string, WeaknessRecord>;
}

export interface User {
  username: string;
  progress: UserProgress;
  uid?: string;
  isPro?: boolean;
  proExpiresAt?: string;
  customApiKey?: string;
  email?: string;
}

export interface DrillQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  explanation_vi?: string;
  morphemeTracked?: string;
}

export interface RemediationPlan {
  analysis: string; // What went wrong
  reviewPoints: string[]; // Bullet points to review
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  GARDEN = 'GARDEN',
  ASSESSMENT = 'ASSESSMENT',
  ANALYZER = 'ANALYZER',
  UPGRADE = 'UPGRADE',
  WORD_TREE = 'WORD_TREE',
  PUZZLES = 'PUZZLES',
  PROFILE = 'PROFILE',
  FLASHCARDS = 'FLASHCARDS',
  REVIEW = 'REVIEW'
}

export interface MorphologyAnalysis {
  word: string;
  phonetic: string;
  meaning_vi: string;
  explanation_vi?: string;
  parts: WordPart[];
  synonyms: string[];
  morphologicalRelatives: string[];
}

export interface AppConfig {
  baseFeatures: string[];
  proFeatures: string[];
}