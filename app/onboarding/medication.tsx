import { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { quizData } from '@/lib/quiz';
import { Medication } from '@/types';

const MEDICATIONS: { id: Medication; label: string; detailKey: string; emoji: string }[] = [
  { id: 'ozempic',    label: 'Ozempic',   detailKey: 'semaglutide',     emoji: '💉' },
  { id: 'wegovy',     label: 'Wegovy',    detailKey: 'semaglutide',     emoji: '💉' },
  { id: 'mounjaro',   label: 'Mounjaro',  detailKey: 'tirzepatide',     emoji: '💉' },
  { id: 'zepbound',   label: 'Zepbound',  detailKey: 'tirzepatide',     emoji: '💉' },
  { id: 'rybelsus',   label: 'Rybelsus',  detailKey: 'oralSemaglutide', emoji: '💊' },
  { id: 'saxenda',    label: 'Saxenda',   detailKey: 'liraglutide',     emoji: '💉' },
  { id: 'victoza',    label: 'Victoza',   detailKey: 'liraglutide',     emoji: '💉' },
  { id: 'trulicity',  label: 'Trulicity', detailKey: 'dulaglutide',     emoji: '💉' },
  { id: 'compounded', label: '', detailKey: 'compoundedDetail', emoji: '🧪' },
  { id: 'other',      label: '', detailKey: 'otherDetail',      emoji: '🌿' },
];

export default function MedicationScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Medication | null>(null);

  return (
    <OnboardingLayout
      step={1} totalSteps={6}
      emoji="💊"
      title={t('onboarding.medication.title')}
      subtitle={t('onboarding.medication.subtitle')}
      showBack={false}
      footer={
        <Button
          title={t('common.continue')}
          onPress={() => { quizData.medication = selected; router.push('/onboarding/demographics'); }}
          disabled={!selected}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {MEDICATIONS.map(med => {
            const active = selected === med.id;
            const label = med.label || t(`onboarding.medication.meds.${med.id}`);
            return (
              <TouchableOpacity
                key={med.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  active && { borderColor: colors.primary, backgroundColor: colors.primaryPale },
                ]}
                onPress={() => setSelected(med.id)}
                activeOpacity={0.75}
              >
                <View style={[
                  styles.emojiBox,
                  { backgroundColor: colors.backgroundWarm },
                  active && { backgroundColor: colors.primary + '20' },
                ]}>
                  <Text style={styles.emoji}>{med.emoji}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.medName, { color: active ? colors.primary : colors.text.primary }]}>{label}</Text>
                  <Text style={[styles.medDetail, { color: colors.text.muted }]}>{t(`onboarding.medication.meds.${med.detailKey}`)}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: radius.xl, padding: 14, borderWidth: 1.5,
  },
  emojiBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  cardText: { flex: 1 },
  medName: { ...typography.h4 },
  medDetail: { ...typography.small, marginTop: 2 },
});
