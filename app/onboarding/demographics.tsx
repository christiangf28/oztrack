import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { onboardingData } from './medication';
import { Gender } from '@/types';

const GENDERS: { id: Gender; emoji: string; label: string }[] = [
  { id: 'female',      emoji: '🙋‍♀️', label: 'Mujer' },
  { id: 'male',        emoji: '🙋‍♂️', label: 'Hombre' },
  { id: 'prefer_not',  emoji: '🤷',   label: 'Prefiero no decir' },
];

const AGE_RANGES = ['18–25', '26–35', '36–45', '46–55', '55+'];

export default function DemographicsScreen() {
  const { colors } = useTheme();
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);

  function handleNext() {
    onboardingData.gender = gender;
    onboardingData.ageRange = ageRange;
    router.push('/onboarding/duration');
  }

  return (
    <OnboardingLayout
      step={2} totalSteps={5}
      emoji="👤"
      title="Cuéntanos sobre ti"
      subtitle="Nos ayuda a personalizar tu experiencia"
      footer={
        <View style={{ gap: 10 }}>
          <Button title="Continuar" onPress={handleNext} disabled={!gender} />
          <Button title="Omitir" onPress={handleNext} variant="ghost" size="sm" />
        </View>
      }
    >
      {/* Género */}
      <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>GÉNERO</Text>
      <View style={styles.genderRow}>
        {GENDERS.map(g => {
          const active = gender === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGender(g.id)}
              activeOpacity={0.75}
              style={[
                styles.genderBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primaryPale },
              ]}
            >
              <Text style={styles.genderEmoji}>{g.emoji}</Text>
              <Text style={[styles.genderLabel, { color: active ? colors.primary : colors.text.secondary },
                active && { fontWeight: '700' }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rango de edad */}
      <Text style={[styles.sectionLabel, { color: colors.text.muted, marginTop: 28 }]}>EDAD</Text>
      <View style={styles.ageGrid}>
        {AGE_RANGES.map(range => {
          const active = ageRange === range;
          return (
            <TouchableOpacity
              key={range}
              onPress={() => setAgeRange(range)}
              activeOpacity={0.75}
              style={[
                styles.ageBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primaryPale },
              ]}
            >
              <Text style={[styles.ageLabel, { color: active ? colors.primary : colors.text.primary },
                active && { fontWeight: '700' }]}>
                {range}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12,
  },
  genderRow: { gap: 10 },
  genderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radius.xl, padding: 16, borderWidth: 2,
  },
  genderEmoji: { fontSize: 24 },
  genderLabel: { ...typography.bodyMed },

  ageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ageBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: radius.full, borderWidth: 2,
  },
  ageLabel: { fontSize: 15, fontWeight: '600' },
});
