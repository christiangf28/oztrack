import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { radius, typography } from '@/components/ui/theme';
import { quizData, persistQuiz } from '@/lib/quiz';

const SYMPTOMS = [
  { id: 'nausea',       emoji: '🤢', label: 'Náuseas' },
  { id: 'fatigue',      emoji: '😴', label: 'Fatiga' },
  { id: 'appetite',     emoji: '🍽️', label: 'Cambios de apetito' },
  { id: 'constipation', emoji: '😣', label: 'Estreñimiento' },
  { id: 'headaches',    emoji: '🤕', label: 'Dolor de cabeza' },
  { id: 'dizziness',    emoji: '💫', label: 'Mareos' },
];

export default function SymptomsScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const hasSelection = noneSelected || selected.length > 0 || otherText.trim().length > 0;
  const count = noneSelected ? 0 : selected.length + (otherText.trim() ? 1 : 0);

  return (
    <OnboardingLayout
      step={5} totalSteps={6}
      emoji="🌸"
      title="¿Qué síntomas experimentas?"
      subtitle="Opcional · Selecciona todos los que apliquen"
      footer={
        <View style={{ gap: 10 }}>
          <Button
            title={loading ? 'Guardando...' : 'Continuar'}
            onPress={handleFinish}
            loading={loading}
          />
          <Button title="Omitir por ahora" onPress={handleFinish} variant="ghost" size="sm" />
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
            Otros
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
            Ninguno
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
            placeholder="¿Qué otro síntoma tienes?"
            placeholderTextColor={colors.text.muted}
            value={otherText}
            onChangeText={setOtherText}
            autoFocus
          />
        </View>
      )}

      {count > 0 && (
        <Text style={[styles.hint, { color: colors.text.muted }]}>
          {count} síntoma{count > 1 ? 's' : ''} seleccionado{count > 1 ? 's' : ''}
        </Text>
      )}
      {noneSelected && (
        <Text style={[styles.hint, { color: colors.sage }]}>
          ¡Genial! Sin síntomas por ahora 🌟
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
