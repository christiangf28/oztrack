export type Medication = 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'rybelsus' | 'other';
export type Goal = 'weight_loss' | 'diabetes' | 'other';
export type Gender = 'female' | 'male' | 'prefer_not';

export interface ChatMessage {
  id?: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface DailyLog {
  id?: string;
  user_id: string;
  date: string;
  nausea: number;
  fatigue: number;
  appetite: number;
  mood: number;
  energy: number;
  weight?: number | null;
  water_ml: number;
  meal_notes?: string | null;
  bowel_movements?: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  medication: string;
  start_date: string;
  goals: string;
  symptoms: string[];
  gender?: Gender;
  age_range?: string;
  created_at?: string;
}
