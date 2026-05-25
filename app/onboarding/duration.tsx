import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { colors } from '@/components/ui/colors';
import { radius, typography } from '@/components/ui/theme';
import { onboardingData } from './medication';

const DURATIONS = [
  { id: '0', label: 'Acabo de empezar', detail: 'Menos de 1 mes', emoji: '🌱' },
  { id: '1-3', label: '1 a 3 meses', detail: 'Fase de adaptación', emoji: '🌿' },
  { id: '3-6', label: '3 a 6 meses', detail: 'Encontrando el ritmo', emoji: '🌸' },
  { id: '6-12', label: '6 a 12 meses', detail: 'Con experiencia', emoji: '🌺' },
  { id: '12+', label: 'Más de un año', detail: 'Con mucha experiencia', emoji: '⭐' },
];

export default function DurationScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingLayout
      step={3} totalSteps={5}
      emoji="📅"
      title="¿Cuánto tiempo llevas?"
      subtitle="Nos ayuda a entender mejor tu experiencia"
      footer={
        <Button
          title="Continuar"
          onPress={() => { onboardingData.duration = selected; router.push('/onboarding/goals'); }}
          disabled={!selected}
        />
      }
    >
      <View style={styles.list}>
        {DURATIONS.map(d => {
          const active = selected === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelected(d.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{d.emoji}</Text>
              <View style={styles.textBlock}>
                <Text style={[styles.label, active && styles.labelActive]}>{d.label}</Text>
                <Text style={styles.detail}>{d.detail}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: 16, borderWidth: 1.5, borderColor: colors.border,
    ...colors.shadow.sm,
  },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primaryPale },
  emoji: { fontSize: 26 },
  textBlock: { flex: 1 },
  label: { ...typography.bodyMed, color: colors.text.primary },
  labelActive: { color: colors.primaryDark, fontWeight: '700' },
  detail: { ...typography.small, color: colors.text.muted, marginTop: 1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
