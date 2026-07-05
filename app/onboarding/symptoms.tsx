import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { quizData, persistQuiz } from '@/lib/quiz';

export default function SymptomsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const SYMPTOMS = [
    { id: 'nausea',       emoji: '🤢', label: t('onboarding.symptoms.nausea') },
    { id: 'fatigue',      emoji: '😴', label: t('onboarding.symptoms.fatigue') },
    { id: 'appetite',     emoji: '🍽️', label: t('onboarding.symptoms.appetite') },
    { id: 'constipation', emoji: '😣', label: t('onboarding.symptoms.constipation') },
    { id: 'headaches',    emoji: '🤕', label: t('onboarding.symptoms.headaches') },
    { id: 'dizziness',    emoji: '💫', label: t('onboarding.symptoms.dizziness') },
  ];

  function toggleSymptom(id: string) {
    setNoneSelected(false);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function toggleNone() {
    if (!noneSelected) {
      setSelected([]);
      setShowOtherInput(false);
      setOtherText('');
    }
    setNoneSelected(prev => !prev);
  }

  function toggleOther() {
    setNoneSelected(false);
    setShowOtherInput(prev => !prev);
    if (showOtherInput) setOtherText('');
  }

  async function handleFinish() {
    setLoading(true);
    const finalSymptoms = noneSelected
      ? ['none']
      : [
          ...selected,
          ...(otherText.trim() ? [`other:${otherText.trim()}`] : []),
        ];

    quizData.symptoms = finalSymptoms;
    await persistQuiz();
    setLoading(false);
    router.push('/onboarding/struggles');
  }

  const count = noneSelected ? 0 : selected.length + (otherText.trim() ? 1 : 0);

  return (
    <OnboardingLayout
      step={5} totalSteps={6}
      emoji="🌸"
      title={t('onboarding.symptoms.title')}
      subtitle={t('onboarding.symptoms.subtitle')}
      footer={
        <View style={{ gap: 10 }}>
          <Button
            title={loading ? t('common.loading') : t('common.continue')}
            onPress={handleFinish}
            loading={loading}
          />
          <Button title={t('onboarding.symptoms.skip')} onPress={handleFinish} variant="ghost" size="sm" />
        </View>
      }
    >
      <View style={styles.grid}>
        {/* Síntomas principales */}
        {SYMPTOMS.map(s => {
          const active = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.chip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primaryPale },
              ]}
              onPress={() => toggleSymptom(s.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.chipEmoji}>{s.emoji}</Text>
              <Text style={[styles.chipLabel, { color: active ? colors.primary : colors.text.primary },
                active && { fontWeight: '600' }]}>
                {s.label}
              </Text>
              {active && <View style={[styles.chipDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}

        {/* Otros */}
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.surface, borderColor: colors.border },
            showOtherInput && { borderColor: colors.lavender, backgroundColor: colors.lavenderPale },
          ]}
          onPress={toggleOther}
          activeOpacity={0.75}
        >
          <Text style={styles.chipEmoji}>✏️</Text>
          <Text style={[styles.chipLabel, { color: showOtherInput ? colors.lavender : colors.text.primary },
            showOtherInput && { fontWeight: '600' }]}>
            {t('onboarding.symptoms.other')}
          </Text>
          {showOtherInput && <View style={[styles.chipDot, { backgroundColor: colors.lavender }]} />}
        </TouchableOpacity>

        {/* Ninguno */}
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: colors.surface, borderColor: colors.border },
            noneSelected && { borderColor: colors.sage, backgroundColor: colors.sagePale },
          ]}
          onPress={toggleNone}
          activeOpacity={0.75}
        >
          <Text style={styles.chipEmoji}>✅</Text>
          <Text style={[styles.chipLabel, { color: noneSelected ? colors.sage : colors.text.primary },
            noneSelected && { fontWeight: '600' }]}>
            {t('onboarding.symptoms.none')}
          </Text>
          {noneSelected && <View style={[styles.chipDot, { backgroundColor: colors.sage }]} />}
        </TouchableOpacity>
      </View>

      {/* Campo de texto para "Otros" */}
      {showOtherInput && (
        <View style={[styles.otherInput, { borderColor: colors.lavender, backgroundColor: colors.backgroundWarm }]}>
          <Ionicons name="create-outline" size={16} color={colors.lavender} />
          <TextInput
            style={[styles.otherTextField, { color: colors.text.primary }]}
            placeholder={t('onboarding.symptoms.otherPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={otherText}
            onChangeText={setOtherText}
            autoFocus
          />
        </View>
      )}

      {count > 0 && (
        <Text style={[styles.hint, { color: colors.text.muted }]}>
          {t('onboarding.symptoms.selectedHint', { count })}
        </Text>
      )}
      {noneSelected && (
        <Text style={[styles.hint, { color: colors.sage }]}>
          {t('onboarding.symptoms.noneHint')}
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
  otherInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, borderWidth: 1.5, borderRadius: radius.lg,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  otherTextField: { flex: 1, fontSize: 14 },
  hint: { ...typography.small, textAlign: 'center', marginTop: 16 },
});
