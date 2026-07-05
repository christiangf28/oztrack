import { DailyLog } from '@/types';
import { localDateStr, parseLocalDate } from '@/lib/dates';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
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
  id: string; emoji: string; title: string; desc: string;
  check: (logs: DailyLog[], streak: number) => boolean;
}[] = [
  { id: 'first_log',   emoji: '🌱', title: 'Primer paso',      desc: 'Tu primer registro del día',          check: (l) => l.length >= 1 },
  { id: 'streak_3',    emoji: '⚡', title: '3 días seguidos',   desc: 'Racha de 3 días consecutivos',        check: (_, s) => s >= 3 },
  { id: 'streak_7',    emoji: '🔥', title: 'Una semana entera', desc: 'Racha de 7 días consecutivos',        check: (_, s) => s >= 7 },
  { id: 'streak_14',   emoji: '💪', title: 'Dos semanas',       desc: 'Racha de 14 días consecutivos',       check: (_, s) => s >= 14 },
  { id: 'streak_30',   emoji: '🏆', title: 'Un mes completo',   desc: 'Racha de 30 días consecutivos',       check: (_, s) => s >= 30 },
  { id: 'hydration',   emoji: '💧', title: 'Súper hidratada/o', desc: '5 días bebiendo 2L o más de agua',    check: (l) => l.filter(x => x.water_ml >= 2000).length >= 5 },
  { id: 'mood_week',   emoji: '😊', title: 'Semana luminosa',   desc: 'Ánimo 4+ durante 7 días seguidos',    check: (l) => l.slice(0, 7).filter(x => x.mood >= 4).length >= 7 },
  { id: 'no_nausea',   emoji: '✅', title: 'Sin náuseas',       desc: '5 días con náuseas mínimas (1)',      check: (l) => l.filter(x => x.nausea === 1).length >= 5 },
  { id: 'explorer',    emoji: '📊', title: 'Constante',         desc: '30 registros totales',                check: (l) => l.length >= 30 },
  { id: 'weight_log',  emoji: '⚖️', title: 'Pesado/a',          desc: 'Registra tu peso 5 veces',            check: (l) => l.filter(x => x.weight).length >= 5 },
];

export function computeAchievements(logs: DailyLog[]): Achievement[] {
  const streak = calcStreak(logs);
  return DEFINITIONS.map(d => ({
    id: d.id,
    emoji: d.emoji,
    title: d.title,
    desc: d.desc,
    unlocked: d.check(logs, streak),
  }));
}
