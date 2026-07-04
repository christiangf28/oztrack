import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { quizData, persistQuiz } from '@/lib/quiz';
import { Struggle } from '@/types';

const STRUGGLES: { id: Struggle; emoji: string }[] = [
  { id: 'side_effects',   emoji: '🤢' },
  { id: 'food_noise',     emoji: '🍔' },
  { id: 'consistency',    emoji: '📅' },
  { id: 'plateaus',       emoji: '📉' },
  { id: 'motivation',     emoji: '💪' },
  { id: 'injection_days', emoji: '💉' },
];

export default function StrugglesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Struggle[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(id: Struggle) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    setLoading(true);
    quizData.struggles = selected;
    await persistQuiz();
    setLoading(false);
    router.push('/onboarding/value');
  }

  return (
    <OnboardingLayout
      step={6} totalSteps={6}
      emoji="🧗"
      title={t('onboarding.struggles.title')}
      subtitle={t('onboarding.struggles.subtitle')}
      footer={
        <View style={{ gap: 10 }}>
          <Button
            title={t('common.continue')}
            onPress={handleContinue}
            loading={loading}
            disabled={selected.length === 0}
          />
          <Button title={t('common.skip')} onPress={handleContinue} variant="ghost" size="sm" />
        </View>
      }
    >
      <View style={styles.grid}>
        {STRUGGLES.map(s => {
          const active = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.chip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primaryPale },
              ]}
              onPress={() => toggle(s.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.chipEmoji}>{s.emoji}</Text>
              <Text style={[
                styles.chipLabel,
                { color: active ? colors.primary : colors.text.primary },
                active && { fontWeight: '600' },
              ]}>
                {t(`onboarding.struggles.options.${s.id}`)}
              </Text>
              {active && <View style={[styles.chipDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected.length > 0 && (
        <Text style={[styles.hint, { color: colors.text.muted }]}>
          {t('onboarding.struggles.hint', { count: selected.length })}
        </Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: radius.full,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontSize: 14 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  hint: { ...typography.small, textAlign: 'center', marginTop: 16 },
});
