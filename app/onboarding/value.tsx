import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { typography, radius } from '@/components/ui/theme';
import { quizData, persistQuiz, saveProfileFromQuiz } from '@/lib/quiz';
import { supabase } from '@/lib/supabase';

const MED_LABELS: Record<string, string> = {
  ozempic: 'Ozempic', wegovy: 'Wegovy', mounjaro: 'Mounjaro',
  zepbound: 'Zepbound', rybelsus: 'Rybelsus', saxenda: 'Saxenda',
  victoza: 'Victoza', trulicity: 'Trulicity',
};

export default function ValueScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const medLabel = MED_LABELS[quizData.medication] ?? t(`onboarding.medication.meds.${quizData.medication ?? 'other'}`);
  const goalLabel = quizData.goals ? t(`onboarding.goals.${quizData.goals === 'weight_loss' ? 'weightLoss' : quizData.goals}`) : null;
  const struggles: string[] = quizData.struggles ?? [];
  const symptoms: string[] = (quizData.symptoms ?? []).filter((s: string) => s !== 'none');

  const rows = [
    { icon: 'medkit-outline' as const, label: t('onboarding.value.medication'), value: medLabel },
    goalLabel && { icon: 'flag-outline' as const, label: t('onboarding.value.goal'), value: goalLabel },
    symptoms.length > 0 && {
      icon: 'pulse-outline' as const,
      label: t('onboarding.value.symptoms'),
      value: t('onboarding.value.symptomsCount', { count: symptoms.length }),
    },
    struggles.length > 0 && {
      icon: 'heart-outline' as const,
      label: t('onboarding.value.focus'),
      value: struggles.map(s => t(`onboarding.struggles.options.${s}`)).join(' · '),
    },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  async function handleContinue() {
    setLoading(true);
    quizData.complete = true;
    await persistQuiz();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profileError = await saveProfileFromQuiz(session.user.id, session.user.email ?? '');
      setLoading(false);
      if (profileError) {
        // Sin perfil no se puede avanzar; el usuario reintenta desde acá.
        Alert.alert(t('common.error'), t('common.tryAgain'));
        return;
      }
      router.replace('/paywall');
    } else {
      router.replace('/(auth)/register');
      setLoading(false);
    }
  }

  const heroColors = isDark
    ? ['#2D1520', '#3A1D28', colors.background]
    : ['#FDE8ED', '#F5CFD9', colors.background];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={heroColors as [string, string, ...string[]]} style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.surface + 'CC' }]}>
            <Text style={styles.heroEmoji}>🎉</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>{t('onboarding.value.title')}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>{t('onboarding.value.subtitle')}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }, colors.shadow.sm as any]}>
            {rows.map((row, i) => (
              <View key={row.label} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.borderLight ?? colors.border }]}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primaryPale }]}>
                  <Ionicons name={row.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text.muted }]}>{row.label}</Text>
                  <Text style={[styles.rowValue, { color: colors.text.primary }]}>{row.value}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={colors.success ?? colors.sage} />
              </View>
            ))}
          </View>

          <Text style={[styles.note, { color: colors.text.secondary }]}>{t('onboarding.value.note')}</Text>

          <Button
            title={loading ? t('common.loading') : t('onboarding.value.cta')}
            onPress={handleContinue}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center', paddingTop: 48, paddingBottom: 36,
    paddingHorizontal: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroEmoji: { fontSize: 38 },
  heroTitle: { ...typography.h1, textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { ...typography.body, textAlign: 'center' },
  content: { padding: 20, gap: 20 },
  summaryCard: { borderRadius: radius.xl, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { ...typography.small },
  rowValue: { ...typography.h4, marginTop: 1 },
  note: { ...typography.small, textAlign: 'center', paddingHorizontal: 12 },
});
