export type Medication = 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'rybelsus' | 'other';
export type Goal = 'weight_loss' | 'diabetes' | 'other';
export type MessageRole = 'user' | 'assistant';

export interface UserProfile {
  id: string;
  email: string;
  medication: Medication;
  start_date: string;
  goals: Goal;
  created_at?: string;
  gender?: string;
  age_range?: string;
}

export interface DailyLog {
  id?: string;
  user_id: string;
  date: string;
  nausea: number;
  fatigue: number;
  appetite: number;
  mood: number;
  weight?: number;
  water_ml: number;
  meal_notes?: string;
  bowel_movements?: number;
}

export interface ChatMessage {
  id?: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at?: string;
}

export interface SubscriptionStatus {
  user_id: string;
  rc_customer_id: string;
  is_active: boolean;
  plan: 'monthly' | 'annual' | null;
  trial_ends_at: string | null;
}
