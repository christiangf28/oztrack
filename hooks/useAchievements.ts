import { DailyLog } from '@/types';
import { localDateStr, parseLocalDate } from '@/lib/dates';

// title/desc se resuelven en la UI con t(`achievements.${id}.title|desc`)
// para que reaccionen al cambio de idioma.
export interface Achievement {
  id: string;
  emoji: string;
  unlocked: boolean;
}

/** Racha de días consecutivos con registro, contando desde hoy (fecha local). */
export function calcStreak(logs: DailyLog[]): number {
  if (!logs.length) return 0;
  let streak = 0;
  let current = localDateStr();
  for (const log of logs) {
    if (log.date === current) {
      streak++;
      const d = parseLocalDate(current); d.setDate(d.getDate() - 1);
      current = localDateStr(d);
    } else break;
  }
  return streak;
}

const DEFINITIONS: {
  id: string; emoji: string;
  check: (logs: DailyLog[], streak: number) => boolean;
}[] = [
  { id: 'first_log',   emoji: '🌱', check: (l) => l.length >= 1 },
  { id: 'streak_3',    emoji: '⚡', check: (_, s) => s >= 3 },
  { id: 'streak_7',    emoji: '🔥', check: (_, s) => s >= 7 },
  { id: 'streak_14',   emoji: '💪', check: (_, s) => s >= 14 },
  { id: 'streak_30',   emoji: '🏆', check: (_, s) => s >= 30 },
  { id: 'hydration',   emoji: '💧', check: (l) => l.filter(x => x.water_ml >= 2000).length >= 5 },
  { id: 'mood_week',   emoji: '😊', check: (l) => l.slice(0, 7).filter(x => x.mood >= 4).length >= 7 },
  { id: 'no_nausea',   emoji: '✅', check: (l) => l.filter(x => x.nausea === 1).length >= 5 },
  { id: 'explorer',    emoji: '📊', check: (l) => l.length >= 30 },
  { id: 'weight_log',  emoji: '⚖️', check: (l) => l.filter(x => x.weight).length >= 5 },
];

export function computeAchievements(logs: DailyLog[]): Achievement[] {
  const streak = calcStreak(logs);
  return DEFINITIONS.map(d => ({
    id: d.id,
    emoji: d.emoji,
    unlocked: d.check(logs, streak),
  }));
}
