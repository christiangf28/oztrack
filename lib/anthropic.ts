import { supabase } from './supabase';

export class CoachDailyLimitError extends Error {}

export async function askCoach(
  messages: { role: 'user' | 'assistant'; content: string }[],
  lang?: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ content: string; error?: string }>('coach', {
    body: { messages, lang: lang?.startsWith('es') ? 'es' : 'en' },
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 429) throw new CoachDailyLimitError();
    throw error;
  }
  return data?.content ?? '';
}
