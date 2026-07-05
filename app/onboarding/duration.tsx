import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { colors } from '@/components/ui/colors';
import { radius, typography } from '@/components/ui/theme';
import { quizData } from '@/lib/quiz';

export default function DurationScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const DURATIONS = [
    { id: '0', label: t('onboarding.duration.justStarted'), detail: t('onboarding.duration.justStartedDetail'), emoji: '🌱' },
    { id: '1-3', label: t('onboarding.duration.oneToThree'), detail: t('onboarding.duration.oneToThreeDetail'), emoji: '🌿' },
    { id: '3-6', label: t('onboarding.duration.threeToSix'), detail: t('onboarding.duration.threeToSixDetail'), emoji: '🌸' },
    { id: '6-12', label: t('onboarding.duration.sixToTwelve'), detail: t('onboarding.duration.sixToTwelveDetail'), emoji: '🌺' },
    { id: '12+', label: t('onboarding.duration.overYear'), detail: t('onboarding.duration.overYearDetail'), emoji: '⭐' },
  ];

  return (
    <OnboardingLayout
      step={3} totalSteps={6}
      emoji="📅"
      title={t('onboarding.duration.title')}
      subtitle={t('onboarding.duration.subtitle')}
      footer={
        <Button
          title={t('common.continue')}
          onPress={() => { quizData.duration = selected; router.push('/onboarding/goals'); }}
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
