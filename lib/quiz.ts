import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUIZ_KEY = 'oztrack_quiz';

// Respuestas del quiz de onboarding (pre-auth). Se persisten en AsyncStorage
// para sobrevivir reinicios y se vuelcan a Supabase al crear la cuenta.
export const quizData: Record<string, any> = {};

export async function persistQuiz() {
  await AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(quizData));
}

/** Carga el quiz guardado. Devuelve true si el quiz está completo. */
export async function loadQuiz(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(QUIZ_KEY);
    if (!raw) return false;
    Object.assign(quizData, JSON.parse(raw));
    return quizData.complete === true;
  } catch {
    return false;
  }
}

export async function clearQuiz() {
  Object.keys(quizData).forEach(k => delete quizData[k]);
  await AsyncStorage.removeItem(QUIZ_KEY);
}

/** Crea el perfil en Supabase a partir del quiz. Devuelve el error o null. */
export async function saveProfileFromQuiz(userId: string, email: string) {
  const { error } = await supabase.from('users').upsert({
    id: userId,
    email,
    medication: quizData.medication ?? 'other',
    start_date: new Date().toISOString(),
    goals: quizData.goals ?? 'other',
    symptoms: quizData.symptoms ?? [],
    struggles: quizData.struggles ?? [],
    gender: quizData.gender ?? null,
    age_range: quizData.ageRange ?? null,
  });
  if (!error) await clearQuiz();
  return error;
}
