export type TaskStatus = 'in_progress' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MarkerType = 'highlight' | 'suspicious' | 'note';
export type ThemeMode = 'terminal' | 'paper';

export interface Marker {
  id: string;
  startIndex: number;
  endIndex: number;
  type: MarkerType;
  color?: string;
  comment?: string;
}

export interface CipherTask {
  id: string;
  title: string;
  ciphertext: string;
  plaintextAnswer: string;
  source: string;
  difficulty: Difficulty;
  status: TaskStatus;
  substitutionMap: Record<string, string>;
  markers: Marker[];
  notes: string;
  hint: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  category: string;
  description: string;
}

export interface AppSettings {
  crtEffect: boolean;
  soundEnabled: boolean;
  theme: ThemeMode;
}

export interface FrequencyResult {
  char: string;
  count: number;
  percentage: number;
}

export interface PatternResult {
  pattern: string;
  count: number;
  positions: number[];
}

export interface ValidationResult {
  isCorrect: boolean;
  errorIndices: number[];
  correctCount: number;
  totalCount: number;
  accuracy: number;
}
