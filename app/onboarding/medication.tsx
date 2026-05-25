import { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { Medication } from '@/types';

const MEDICATIONS: { id: Medication; label: string; detail: string; emoji: string }[] = [
  { id: 'ozempic', label: 'Ozempic', detail: 'Semaglutida · Novo Nordisk', emoji: '💉' },
  { id: 'wegovy', label: 'Wegovy', detail: 'Semaglutida · Novo Nordisk', emoji: '💉' },
  { id: 'mounjaro', label: 'Mounjaro', detail: 'Tirzepatida · Eli Lilly', emoji: '💉' },
  { id: 'zepbound', label: 'Zepbound', detail: 'Tirzepatida · Eli Lilly', emoji: '💉' },
  { id: 'rybelsus', label: 'Rybelsus', detail: 'Semaglutida oral · Novo Nordisk', emoji: '💊' },
  { id: 'other', label: 'Otro medicamento', detail: 'No aparece en la lista', emoji: '🌿' },
];

export let onboardingData: Record<string, any> = {};

export default function MedicationScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Medication | null>(null);

  return (
    <OnboardingLayout
      step={1} totalSteps={5}
      emoji="💊"
      title="¿Qué medicamento tomas?"
      subtitle="Esto nos ayuda a personalizar tu experiencia"
      showBack={false}
      footer={
        <Button
          title="Continuar"
          onPress={() => { onboardingData.medication = selected; router.push('/onboarding/demographics'); }}
          disabled={!selected}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {MEDICATIONS.map(med => {
            const active = selected === med.id;
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
                  <Text style={[styles.medName, { color: active ? colors.primary : colors.text.primary }]}>{med.label}</Text>
                  <Text style={[styles.medDetail, { color: colors.text.muted }]}>{med.detail}</Text>
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
