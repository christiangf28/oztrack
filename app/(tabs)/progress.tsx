import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/components/ui/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { typography, radius } from '@/components/ui/theme';
import { DailyLog } from '@/types';
import { computeAchievements } from '@/hooks/useAchievements';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 64;
const CHART_H = 120;
const PAD = { top: 10, bottom: 24, left: 4, right: 4 };
const CAL_CELL_SIZE = Math.floor((SCREEN_W - 64) / 7);

type Period = 7 | 14 | 30;

// ─── Line chart ──────────────────────────────────────────────────────────────

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  return points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
  }, '');
}

function toPoints(values: number[], w: number, h: number): { x: number; y: number }[] {
  if (values.length < 2) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;
  return values.map((v, i) => ({
    x: PAD.left + (i / (values.length - 1)) * innerW,
    y: PAD.top + (1 - (v - min) / range) * innerH,
  }));
}

interface LineChartProps {
  values: number[];
  color: string;
  gradientId: string;
  labels?: string[];
  showDots?: boolean;
}

function LineChart({ values, color, gradientId, labels, showDots = true }: LineChartProps) {
  if (values.length < 2) return null;
  const pts = toPoints(values, CHART_W, CHART_H);
  const linePath = buildPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${CHART_H - PAD.bottom} L ${pts[0].x},${CHART_H - PAD.bottom} Z`;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0.02" />
        </SvgGradient>
      </Defs>
      <Line
        x1={PAD.left} y1={CHART_H - PAD.bottom}
        x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom}
        stroke={color} strokeOpacity={0.15} strokeWidth={1}
      />
      <Path d={areaPath} fill={`url(#${gradientId})`} />
      <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
      ))}
      {labels && labels.map((l, i) => {
        const x = PAD.left + (i / (labels.length - 1)) * (CHART_W - PAD.left - PAD.right);
        return (
          <SvgText key={i} x={x} y={CHART_H - 4} fontSize={9} textAnchor="middle" fill={color} fillOpacity={0.55}>
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcStreak(logs: DailyLog[]): number {
  if (!logs.length) return 0;
  let streak = 0;
  let current = new Date().toISOString().split('T')[0];
  for (const log of logs) {
    if (log.date === current) {
      streak++;
      const d = new Date(current); d.setDate(d.getDate() - 1);
      current = d.toISOString().split('T')[0];
    } else break;
  }
  return streak;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10;
}

function dayLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr);
  if (period <= 7) return d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function generateInsights(logs: DailyLog[], colors: any) {
  if (logs.length < 4) return [{ icon: '📝', text: 'Sigue registrando para generar perspectivas.', color: colors.primary }];
  const results: { icon: string; text: string; color: string }[] = [];
  const recent = logs.slice(0, 7);

  const avgNausea = avg(recent.map(l => l.nausea));
  if (avgNausea < 2.5) results.push({ icon: '✅', text: 'Tus náuseas han sido bajas esta semana — señal de buena adaptación.', color: colors.success });

  const highWater = logs.filter(l => l.water_ml >= 2000);
  if (highWater.length > 0) {
    const lowNausea = highWater.filter(l => l.nausea <= 2).length / highWater.length;
    if (lowNausea > 0.6) results.push({ icon: '💧', text: 'Las náuseas fueron más bajas los días que bebiste más agua.', color: '#5BA8D0' });
  }

  const avgFatigue = avg(recent.map(l => l.fatigue));
  if (avgFatigue <= 2.5) results.push({ icon: '⚡', text: 'Tu nivel de fatiga ha sido bajo esta semana. ¡Excelente!', color: colors.symptom.fatigue });

  const moodTrend = recent.length >= 4
    ? avg(recent.slice(0, 3).map(l => l.mood)) - avg(recent.slice(-3).map(l => l.mood))
    : 0;
  if (moodTrend > 0.5) results.push({ icon: '📈', text: 'Tu estado de ánimo ha mejorado en los últimos días.', color: colors.symptom.mood });

  return results.length ? results : [{ icon: '📈', text: 'Sigue registrando para generar más perspectivas personalizadas.', color: colors.primary }];
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

function MonthCalendar({ logs, colors }: { logs: DailyLog[]; colors: any }) {
  const [offset, setOffset] = useState(0);

  const today = new Date();
  const ref = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  const year = ref.getFullYear();
  const month = ref.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const logDates = useMemo(() => new Set(logs.map(l => l.date)), [logs]);
  const todayStr = today.toISOString().split('T')[0];

  const startDow = (firstDay.getDay() + 6) % 7; // 0=Lun
  const cells: ({ day: number; dateStr: string; hasLog: boolean; isToday: boolean } | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, hasLog: logDates.has(dateStr), isToday: dateStr === todayStr });
  }

  const monthLabel = firstDay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <View>
      <View style={styles.calNav}>
        <TouchableOpacity onPress={() => setOffset(o => o + 1)} style={styles.calNavBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.calMonthLabel, { color: colors.text.primary }]}>
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </Text>
        <TouchableOpacity
          onPress={() => setOffset(o => Math.max(0, o - 1))}
          style={styles.calNavBtn}
          disabled={offset === 0}
        >
          <Ionicons name="chevron-forward" size={18} color={offset === 0 ? colors.border : colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calDowRow}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <Text key={d} style={[styles.calDow, { color: colors.text.muted }]}>{d}</Text>
        ))}
      </View>

      <View style={styles.calGrid}>
        {cells.map((cell, i) => (
          <View key={i} style={styles.calCell}>
            {cell && (
              <View style={[
                styles.calDayCircle,
                cell.hasLog && { backgroundColor: colors.primary },
                !cell.hasLog && cell.isToday && { borderWidth: 1.5, borderColor: colors.primary },
              ]}>
                <Text style={[
                  styles.calDayText,
                  { color: cell.hasLog ? '#fff' : cell.isToday ? colors.primary : colors.text.secondary },
                  (cell.hasLog || cell.isToday) && { fontWeight: '700' as const },
                ]}>
                  {cell.day}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Achievements Grid ────────────────────────────────────────────────────────

function AchievementsGrid({ logs, colors }: { logs: DailyLog[]; colors: any }) {
  const achievements = useMemo(() => computeAchievements(logs), [logs]);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View>
      <Text style={[styles.achieveSubtitle, { color: colors.text.muted }]}>
        {unlockedCount}/{achievements.length} desbloqueados
      </Text>
      <View style={styles.achieveGrid}>
        {achievements.map(a => (
          <View
            key={a.id}
            style={[
              styles.achieveCard,
              {
                backgroundColor: a.unlocked ? colors.primaryPale : colors.backgroundWarm,
                borderColor: a.unlocked ? colors.primary + '40' : colors.border,
                opacity: a.unlocked ? 1 : 0.55,
              },
            ]}
          >
            {a.unlocked && (
              <View style={[styles.achieveCheck, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={9} color="#fff" />
              </View>
            )}
            <Text style={styles.achieveEmoji}>{a.emoji}</Text>
            <Text style={[styles.achieveTitle, { color: a.unlocked ? colors.text.primary : colors.text.muted }]}>
              {a.title}
            </Text>
            <Text style={[styles.achieveDesc, { color: colors.text.muted }]}>{a.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(7);

  useEffect(() => {
    if (!user) return;
    supabase.from('daily_logs').select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false }).limit(365)
      .then(({ data }) => {
        if (data) setLogs(data as DailyLog[]);
        setLoading(false);
      });
  }, [user]);

  const periodLogs = useMemo(() => logs.slice(0, period).reverse(), [logs, period]);
  const streak = useMemo(() => calcStreak(logs), [logs]);
  const insights = useMemo(() => generateInsights(logs, colors), [logs, colors]);

  const weightLogs = useMemo(() => periodLogs.filter(l => l.weight != null && l.weight! > 0), [periodLogs]);
  const weightDelta = weightLogs.length >= 2
    ? Math.round((weightLogs[weightLogs.length - 1].weight! - weightLogs[0].weight!) * 10) / 10
    : null;

  const moodValues = periodLogs.map(l => l.mood);
  const fatigueValues = periodLogs.map(l => l.fatigue);
  const nauseaValues = periodLogs.map(l => l.nausea);
  const weightValues = weightLogs.map(l => l.weight!);
  const chartLabels = periodLogs.map(l => dayLabel(l.date, period));
  const avgMood = avg(moodValues);
  const avgWater = logs.length ? Math.round(avg(logs.slice(0, period).map(l => l.water_ml))) : 0;

  async function shareProgress() {
    const emoji = streak >= 14 ? '🏆' : streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱';
    const lines = [
      `${emoji} Mi progreso en Semmly`,
      '',
      `🔥 Racha actual: ${streak} día${streak !== 1 ? 's' : ''} consecutivo${streak !== 1 ? 's' : ''}`,
      `📝 Total registros: ${logs.length}`,
    ];
    if (avgMood) lines.push(`😊 Ánimo promedio (7d): ${avgMood}/5`);
    lines.push('', '¡Siguiendo mi journey GLP-1 con Semmly! 💪');
    try { await Share.share({ message: lines.join('\n') }); } catch {}
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#2D1520', '#1F1318', colors.background] : ['#FDE8ED', '#FAD9E3', colors.background]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.text.primary }]}>Tu Progreso</Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {logs.length} registros en total
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {logs.length > 0 && (
                <TouchableOpacity
                  onPress={shareProgress}
                  style={[styles.shareBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
              <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {([7, 14, 30] as Period[]).map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={[styles.periodBtn, period === p && { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.periodText, { color: period === p ? '#fff' : colors.text.muted }]}>
                      {p}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Streak */}
          <LinearGradient
            colors={(streak >= 7 ? ['#E8926A', '#D4748F'] : streak >= 3 ? ['#D4748F', '#B85C75'] : colors.gradients.button as [string, string, ...string[]]) as [string, string]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.streakCard}
          >
            <View>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakLabel}>días consecutivos</Text>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.streakEmoji}>
                {streak >= 14 ? '🏆' : streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱'}
              </Text>
              <Text style={styles.streakDesc}>
                {streak >= 14 ? '¡Increíble constancia!' : streak >= 7 ? '¡Una semana seguida!' : streak >= 3 ? 'Vas muy bien' : 'Empieza tu racha'}
              </Text>
            </View>
            <View style={styles.streakDecor} />
          </LinearGradient>

          {/* Calendario mensual */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Calendario</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                <Text style={{ fontSize: 11, color: colors.text.muted }}>= registrado</Text>
              </View>
            </View>
            <MonthCalendar logs={logs} colors={colors} />
          </Card>

          {/* Stats rápidas */}
          <View style={styles.statsRow}>
            <StatCard label="Ánimo medio" value={avgMood || '—'} unit="/5" color={colors.symptom.mood} emoji="😊" colors={colors} />
            <StatCard label="Agua diaria" value={avgWater ? `${Math.round(avgWater / 100) / 10}L` : '—'} unit="media" color="#5BA8D0" emoji="💧" colors={colors} />
            <StatCard label="Registros" value={logs.length} unit="total" color={colors.primary} emoji="📝" colors={colors} />
          </View>

          {/* Síntomas */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Síntomas</Text>
              <View style={styles.legendRow}>
                <LegendDot color={colors.symptom.mood} label="Ánimo" colors={colors} />
                <LegendDot color={colors.symptom.nausea} label="Náuseas" colors={colors} />
              </View>
            </View>
            {periodLogs.length < 2
              ? <EmptyState colors={colors} />
              : (
                <View>
                  <View style={{ position: 'relative' }}>
                    <LineChart values={moodValues} color={colors.symptom.mood} gradientId="mood" labels={chartLabels} showDots={period <= 14} />
                    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                      <LineChart values={nauseaValues.map(v => 6 - v)} color={colors.symptom.nausea} gradientId="nausea" labels={chartLabels} showDots={period <= 14} />
                    </View>
                  </View>
                  <View style={styles.scaleRow}>
                    <Text style={[styles.yLabel, { color: colors.text.muted }]}>● 5</Text>
                    <Text style={[styles.yLabel, { color: colors.text.muted }]}>● 1</Text>
                  </View>
                </View>
              )
            }
          </Card>

          {/* Fatiga */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Fatiga</Text>
              <View style={[styles.trendPill, {
                backgroundColor: avg(fatigueValues.slice(-3)) < avg(fatigueValues.slice(0, 3)) ? colors.successPale : colors.primaryPale,
              }]}>
                <Ionicons
                  name={avg(fatigueValues.slice(-3)) < avg(fatigueValues.slice(0, 3)) ? 'trending-down' : 'trending-up'}
                  size={13}
                  color={avg(fatigueValues.slice(-3)) < avg(fatigueValues.slice(0, 3)) ? colors.success : colors.primary}
                />
                <Text style={[styles.trendText, {
                  color: avg(fatigueValues.slice(-3)) < avg(fatigueValues.slice(0, 3)) ? colors.success : colors.primary,
                }]}>
                  {avg(fatigueValues.slice(-3)) < avg(fatigueValues.slice(0, 3)) ? 'Bajando' : 'Subiendo'}
                </Text>
              </View>
            </View>
            {periodLogs.length < 2
              ? <EmptyState colors={colors} />
              : <LineChart values={fatigueValues.map(v => 6 - v)} color={colors.symptom.fatigue} gradientId="fatigue" labels={chartLabels} showDots={period <= 14} />
            }
          </Card>

          {/* Peso */}
          {weightLogs.length >= 2 && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Peso</Text>
                {weightDelta !== null && (
                  <View style={[styles.trendPill, { backgroundColor: weightDelta < 0 ? colors.successPale : colors.primaryPale }]}>
                    <Ionicons name={weightDelta < 0 ? 'trending-down' : 'trending-up'} size={13} color={weightDelta < 0 ? colors.success : colors.primary} />
                    <Text style={[styles.trendText, { color: weightDelta < 0 ? colors.success : colors.primary }]}>
                      {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                    </Text>
                  </View>
                )}
              </View>
              <LineChart values={weightValues} color={colors.sage} gradientId="weight" labels={weightLogs.map(l => dayLabel(l.date, period))} showDots />
              <View style={styles.weightRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.weightVal, { color: colors.text.primary }]}>{weightLogs[0].weight} kg</Text>
                  <Text style={[styles.weightLbl, { color: colors.text.muted }]}>inicio período</Text>
                </View>
                <View style={[styles.weightArrow, { backgroundColor: colors.sagePale }]}>
                  <Ionicons name="arrow-forward" size={14} color={colors.sage} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.weightVal, { color: colors.text.primary }]}>{weightLogs[weightLogs.length - 1].weight} kg</Text>
                  <Text style={[styles.weightLbl, { color: colors.text.muted }]}>ahora</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Perspectivas */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Perspectivas</Text>
              {!isPremium && (
                <View style={[styles.lockPill, { backgroundColor: colors.lavenderPale }]}>
                  <Ionicons name="lock-closed" size={11} color={colors.lavender} />
                  <Text style={[styles.lockText, { color: colors.lavender }]}>Premium</Text>
                </View>
              )}
            </View>
            {isPremium
              ? insights.map((ins, i) => (
                <View key={i} style={[styles.insightItem, i < insights.length - 1 && {
                  borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12, marginBottom: 12,
                }]}>
                  <View style={[styles.insightIcon, { backgroundColor: ins.color + '20' }]}>
                    <Text style={{ fontSize: 18 }}>{ins.icon}</Text>
                  </View>
                  <Text style={[styles.insightText, { color: colors.text.primary }]}>{ins.text}</Text>
                </View>
              ))
              : (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={[{ textAlign: 'center', ...typography.body, lineHeight: 22 }, { color: colors.text.secondary }]}>
                    Desbloquea Premium para ver perspectivas personalizadas basadas en tus patrones
                  </Text>
                  <Button title="Desbloquear" onPress={() => router.push('/paywall')} variant="outline" size="sm" style={{ marginTop: 14 }} />
                </View>
              )
            }
          </Card>

          {/* Logros */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Logros</Text>
              <Text style={{ fontSize: 18 }}>🏅</Text>
            </View>
            <AchievementsGrid logs={logs} colors={colors} />
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color, emoji, colors }: { label: string; value: any; unit: string; color: string; emoji: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: color + '30' }]}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.text.muted, fontWeight: '500' }}>{unit}</Text>
      <Text style={{ fontSize: 10, color: colors.text.muted, textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function LegendDot({ color, label, colors }: { color: string; label: string; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 11, color: colors.text.muted }}>{label}</Text>
    </View>
  );
}

function EmptyState({ colors }: { colors: any }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
      <Text style={{ fontSize: 13, color: colors.text.muted, textAlign: 'center', lineHeight: 20 }}>
        Registra al menos 2 días para ver tus tendencias
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: 2 },

  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },

  periodSelector: {
    flexDirection: 'row', borderRadius: radius.full,
    borderWidth: 1, overflow: 'hidden', padding: 2,
  },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  periodText: { fontSize: 12, fontWeight: '700' },

  content: { padding: 16, gap: 14 },

  streakCard: {
    borderRadius: radius['2xl'], padding: 24,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden', position: 'relative',
  },
  streakNum: { fontSize: 52, fontWeight: '900', color: '#fff', lineHeight: 56 },
  streakLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  streakRight: { marginLeft: 'auto', alignItems: 'flex-end', gap: 4 },
  streakEmoji: { fontSize: 40 },
  streakDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  streakDecor: {
    position: 'absolute', right: -30, top: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: radius.xl, padding: 12, alignItems: 'center', borderWidth: 1.5 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { ...typography.h4 },
  legendRow: { flexDirection: 'row', gap: 12 },

  trendPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  trendText: { fontSize: 11, fontWeight: '700' },

  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  yLabel: { fontSize: 9, fontWeight: '600' },

  weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 },
  weightVal: { fontSize: 15, fontWeight: '700' },
  weightLbl: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  weightArrow: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  lockPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  lockText: { fontSize: 10, fontWeight: '700' },

  insightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  insightIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, ...typography.small },

  // Calendar
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calNavBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  calMonthLabel: { ...typography.bodyMed },
  calDowRow: { flexDirection: 'row', marginBottom: 4 },
  calDow: { width: CAL_CELL_SIZE, textAlign: 'center', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: CAL_CELL_SIZE, height: CAL_CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  calDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  calDayText: { fontSize: 12 },

  // Achievements
  achieveSubtitle: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: {
    width: '47%', borderRadius: radius.lg, borderWidth: 1.5,
    padding: 12, alignItems: 'center', gap: 5, position: 'relative',
  },
  achieveCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  achieveEmoji: { fontSize: 26 },
  achieveTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  achieveDesc: { fontSize: 9, textAlign: 'center', lineHeight: 13 },
});
