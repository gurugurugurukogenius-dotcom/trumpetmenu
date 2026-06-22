export type SkillLevelRating = 'success' | 'needs_improvement' | 'fail';

export interface PracticeMenuDef {
  id: string;
  name: string;
  category: 'tone' | 'flexibility' | 'technique' | 'articulation' | 'range' | 'custom';
  description: string;
  purpose: string;
  tips: string;
  subItems?: string[]; // Nested checklist sub-items (e.g., specific variations)
}

export interface RoutineItem {
  id: string; // Unique transient ID for customized list item sorting/adding/removing
  menuId: string;
  targetMinutes: number; // Ignored in UI now but kept for model compatibility
  recommendedTempoMin?: number;
  recommendedTempoMax?: number;
  selectedSubItems?: string[]; // Which sub-items are included in this checklist
}

export interface RoutineTemplate {
  id: string;
  name: string;
  durationLabel: string;
  durationMinutes: number;
  description: string;
  items: RoutineItem[];
}

export interface PracticeLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // Unix timestamp
  menuId: string;
  menuName: string;
  tempo: number; // BPM
  rating: SkillLevelRating; // 'success' | 'needs_improvement' | 'fail'
  notes: string; // 改善メモ
  durationMinutes: number; // 実際に行った時間
  completedSubItems?: string[]; // Completed sub-items of the menu
}
