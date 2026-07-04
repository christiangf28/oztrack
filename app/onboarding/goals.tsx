import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { quizData } from '@/lib/quiz';
import { Goal } from '@/types';

const GOALS: {
  id: Goal; emoji: string; label: string; detail: string;
  gradient: [string, string]; accentColor: 'primary' | 'sage' | 'lavender';
}[] = [
  {
    id: 'weight_loss', emoji: '⚖️',
    label: 'Control de Peso',
    detail: 'Seguimiento de progreso y hábitos saludables',
    gradient: ['#FDE8ED', '#F5C6D3'],
    accentColor: 'primary',
  },
  {
    id: 'diabetes', emoji: '🩺',
    label: 'Control de Diabetes',
    detail: 'Monitoreo de bienestar y síntomas diarios',
    gradient: ['#EDF4F1', '#D5EAE3'],
    accentColor: 'sage',
  },
  {
    id: 'other', emoji: '🌿',
    label: 'Salud General',
    detail: 'Bienestar y seguimiento personalizado',
    gradient: ['#F2EFF9', '#E5DFF5'],
    accentColor: 'lavender',
  },
];

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Goal | null>(null);

  return (
    <OnboardingLayout
      step={4} totalSteps={6}
      emoji="🎯"
      title="¿Cuál es tu objetivo?"
      subtitle="Personalizamos tu experiencia en función de tu meta"
      footer={
        <Button
          title="Continuar"
          onPress={() => { quizData.goals = selected; router.push('/onboarding/symptoms'); }}
          disabled={!selected}
        />
      }
    >
      <View style={styles.list}>
        {GOALS.map(g => {
          const active = selected === g.id;
          const accent = colors[g.accentColor];
          return (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, ...colors.shadow.sm },
                active && { borderColor: accent, ...colors.shadow.md },
              ]}
              onPress={() => setSelected(g.id)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={g.gradient} style={styles.iconBox}>
                <Text style={styles.emoji}>{g.emoji}</Text>
              </LinearGradient>
              <View style={styles.textBlock}>
                <Text style={[styles.label, { color: active ? accent : colors.text.primary }]}>{g.label}</Text>
                <Text style={[styles.detail, { color: colors.text.secondary }]}>{g.detail}</Text>
              </View>
              {active && (
                <View style={[styles.activeDot, { backgroundColor: accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: radius['2xl'], padding: 18, borderWidth: 2,
  },
  iconBox: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  textBlock: { flex: 1 },
  label: { ...typography.h4, marginBottom: 4 },
  detail: { ...typography.small, lineHeight: 18 },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
});
