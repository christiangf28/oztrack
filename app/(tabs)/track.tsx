import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useGender, g } from '@/hooks/useGender';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { typography, radius } from '@/components/ui/theme';

const BOWEL_KEY = 'oztrack_bowel_tracker_enabled';

const QUICK_WATER = [
  { label: '+250ml', ml: 250 },
  { label: '+500ml', ml: 500 },
  { label: '+1L', ml: 1000 },
  { label: '+1.5L', ml: 1500 },
];

export default function TrackScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState({ nausea: 3, fatigue: 3, mood: 3 });
  const [appetite, setAppetite] = useState<1 | 3 | 5>(3);
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterCustom, setWaterCustom] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const [bowelCount, setBowelCount] = useState(0);
  const [bowelEnabled, setBowelEnabled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(BOWEL_KEY).then(v => setBowelEnabled(v === 'true'));
    }, [])
  );

  const gender = useGender();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return t('track.greetingMorning');
    if (h < 18) return t('track.greetingAfternoon');
    return t('track.greetingEvening');
  }

  function setScore(key: keyof typeof scores) {
    return (v: number) => setScores(prev => ({ ...prev, [key]: v }));
  }

  function addWater(ml: number) {
    setWaterTotal(prev => prev + ml);
  }

  function addCustomWater() {
    const ml = parseInt(waterCustom, 10);
    if (!isNaN(ml) && ml > 0) {
      setWaterTotal(prev => prev + ml);
      setWaterCustom('');
    }
  }

  function waterLabel(ml: number) {
    if (ml === 0) return '0 ml';
    return ml >= 1000 ? `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L` : `${ml}ml`;
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const weightKg = weight
      ? weightUnit === 'lb'
        ? parseFloat(weight) / 2.205
        : parseFloat(weight)
      : null;

    const { error } = await supabase.from('daily_logs').upsert({
      user_id: user.id,
      date: today,
      ...scores,
      appetite,
      weight: weightKg,
      water_ml: waterTotal,
      meal_notes: mealNotes || null,
      bowel_movements: bowelEnabled ? bowelCount : 0,
    }, { onConflict: 'user_id,date' });

    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert(`✅ ${t('track.saved')}`, g(gender, t('track.savedBodyFemale'), t('track.savedBodyMale'), t('track.savedBodyNeutral')));
  }

  const dateLocale = i18n.language.startsWith('es') ? 'es-ES' : 'en-US';
  const today = new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);
  const waterPercent = Math.min(waterTotal / 2000, 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>

        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#2D1520', '#1F1318', colors.background] : ['#FDE8ED', '#FAD9E3', colors.background]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.text.primary }]}>{getGreeting()} 🌸</Text>
              <Text style={[styles.date, { color: colors.text.secondary }]}>{todayCap}</Text>
            </View>
            <View style={[styles.pillBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.pillBadgeText, { color: colors.primary }]}>💊 {t('track.todayBadge')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Síntomas */}
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{t('track.howFeeling')}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.text.muted }]}>{t('track.tapToSelect')}</Text>

            <View style={{ marginTop: 20 }}>
              <ScoreSlider
                label={t('track.nausea')}
                value={scores.nausea}
                onChange={setScore('nausea')}
                color={colors.symptom.nausea}
                emoji={['😊', '🙂', '😐', '🤢', '🤮']}
                subtitle={t('track.nauseaScale')}
              />
              <ScoreSlider
                label={t('track.fatigue')}
                value={scores.fatigue}
                onChange={setScore('fatigue')}
                color={colors.symptom.fatigue}
                emoji={['⚡', '🙂', '😐', '😕', '😴']}
                subtitle={t('track.fatigueScale')}
              />

              {/* Apetito — 3 opciones */}
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.cardTitle, { color: colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 12 }]}>
                  {t('track.appetite')}
                </Text>
                <View style={styles.appetiteRow}>
                  {([
                    { value: 1, label: t('track.appetiteLow'), emoji: '😔' },
                    { value: 3, label: t('track.appetiteNormal'), emoji: '😊' },
                    { value: 5, label: t('track.appetiteHigh'), emoji: '🤤' },
                  ] as const).map(opt => {
                    const active = appetite === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setAppetite(opt.value)}
                        style={[styles.appetiteBtn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border },
                          active && { borderColor: colors.symptom.appetite, backgroundColor: colors.symptom.appetite + '15' }]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.appetiteEmoji}>{opt.emoji}</Text>
                        <Text style={[styles.appetiteLabel, { color: active ? colors.symptom.appetite : colors.text.secondary },
                          active && { fontWeight: '700' }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <ScoreSlider
                label={t('track.mood')}
                value={scores.mood}
                onChange={setScore('mood')}
                color={colors.symptom.mood}
                emoji={['😢', '😕', '😐', '🙂', '😄']}
                subtitle={t('track.moodScale')}
              />
            </View>
          </Card>

          {/* Agua acumulativa */}
          <Card style={styles.card}>
            <View style={styles.waterHeader}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>💧 {t('track.water')}</Text>
              <Text style={[styles.waterTotal, { color: '#5BA8D0' }]}>{waterLabel(waterTotal)}</Text>
            </View>

            {/* Barra de progreso */}
            <View style={[styles.waterBar, { backgroundColor: colors.border }]}>
              <View style={[styles.waterBarFill, { width: `${waterPercent * 100}%` }]} />
            </View>
            <Text style={[styles.waterMeta, { color: colors.text.muted }]}>{t('track.waterGoal')}</Text>

            {/* Quick add */}
            <View style={styles.waterChips}>
              {QUICK_WATER.map(({ label, ml }) => (
                <TouchableOpacity
                  key={ml}
                  onPress={() => addWater(ml)}
                  activeOpacity={0.75}
                  style={[styles.waterChip, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}
                >
                  <Text style={[styles.waterChipText, { color: colors.text.secondary }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input manual */}
            <View style={styles.waterInputRow}>
              <TextInput
                style={[styles.waterInput, {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundWarm,
                  color: colors.text.primary,
                }]}
                value={waterCustom}
                onChangeText={setWaterCustom}
                keyboardType="numeric"
                placeholder={t('track.waterPlaceholder')}
                placeholderTextColor={colors.text.muted}
                returnKeyType="done"
                onSubmitEditing={addCustomWater}
              />
              <TouchableOpacity
                onPress={addCustomWater}
                style={[styles.waterAddBtn, { backgroundColor: '#5BA8D0' }]}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {waterTotal > 0 && (
              <TouchableOpacity onPress={() => setWaterTotal(0)} style={styles.waterReset}>
                <Text style={[styles.waterResetText, { color: colors.text.muted }]}>{t('track.waterReset')}</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Peso */}
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>⚖️ {t('track.weight')}</Text>
            <View style={styles.weightRow}>
              <TextInput
                style={[styles.weightInput, {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundWarm,
                  color: colors.text.primary,
                }]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder={weightUnit === 'kg' ? t('track.weightPlaceholderKg') : t('track.weightPlaceholderLb')}
                placeholderTextColor={colors.text.muted}
              />
              {/* Toggle kg/lb */}
              <View style={[styles.unitToggle, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}>
                {(['kg', 'lb'] as const).map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setWeightUnit(u)}
                    style={[
                      styles.unitBtn,
                      weightUnit === u && { backgroundColor: colors.sage },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.unitBtnText,
                      { color: weightUnit === u ? '#fff' : colors.text.muted },
                    ]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Notas */}
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>🍽️ {t('track.mealNotes')}</Text>
            <TextInput
              style={[styles.textarea, {
                borderColor: colors.border,
                backgroundColor: colors.backgroundWarm,
                color: colors.text.primary,
              }]}
              value={mealNotes}
              onChangeText={setMealNotes}
              multiline
              numberOfLines={4}
              placeholder={t('track.mealNotesPlaceholder')}
              placeholderTextColor={colors.text.muted}
              textAlignVertical="top"
            />
          </Card>

          {/* Tránsito intestinal */}
          {bowelEnabled && (
            <Card style={styles.card}>
              <View style={styles.bowelHeader}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>🚽 {t('track.bowel')}</Text>
                <Text style={[styles.bowelCount, { color: colors.primary }]}>{bowelCount}x</Text>
              </View>
              <View style={styles.bowelRow}>
                <TouchableOpacity
                  onPress={() => setBowelCount(c => Math.max(0, c - 1))}
                  style={[styles.bowelBtn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                <View style={styles.bowelCountBar}>
                  {[0, 1, 2, 3, 4].map(n => (
                    <TouchableOpacity key={n} onPress={() => setBowelCount(n)}
                      style={[styles.bowelDot, { backgroundColor: n < bowelCount ? colors.primary : colors.border },
                        n === bowelCount - 1 && { backgroundColor: colors.primary }]} />
                  ))}
                  <Text style={[styles.bowelPlus, { color: bowelCount >= 5 ? colors.primary : colors.text.muted }]}>5+</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBowelCount(c => Math.min(10, c + 1))}
                  style={[styles.bowelBtn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}
                >
                  <Ionicons name="add" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <Button title={t('track.save')} onPress={handleSave} loading={saving} />
          <Text style={[styles.saveTip, { color: colors.text.muted }]}>{t('track.saveTip')}</Text>

        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingBottom: 48 },

    header: {
      paddingHorizontal: 22, paddingTop: 16, paddingBottom: 28,
      borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    greeting: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
    date: { ...typography.body },
    pillBadge: {
      borderRadius: radius.full,
      paddingHorizontal: 14, paddingVertical: 7,
    },
    pillBadgeText: { fontSize: 13, fontWeight: '600' },

    content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
    card: {},

    cardTitle: { ...typography.h4 },
    cardSubtitle: { ...typography.caption, marginTop: 2 },

    waterHeader: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 12,
    },
    waterTotal: { fontSize: 20, fontWeight: '800' },
    waterBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
    waterBarFill: {
      height: '100%', borderRadius: 4,
      backgroundColor: '#5BA8D0',
    },
    waterMeta: { fontSize: 11, marginBottom: 14 },
    waterChips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    waterChip: {
      flex: 1, height: 40, borderRadius: radius.lg,
      borderWidth: 1.5,
      alignItems: 'center', justifyContent: 'center',
    },
    waterChipText: { fontSize: 13, fontWeight: '600' },
    waterInputRow: { flexDirection: 'row', gap: 10 },
    waterInput: {
      flex: 1, height: 48, borderRadius: radius.lg,
      borderWidth: 1.5,
      paddingHorizontal: 14, fontSize: 15,
    },
    waterAddBtn: {
      width: 48, height: 48, borderRadius: radius.lg,
      alignItems: 'center', justifyContent: 'center',
    },
    waterReset: { marginTop: 8, alignSelf: 'center' },
    waterResetText: { fontSize: 12 },

    weightRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    weightInput: {
      flex: 1, height: 52, borderRadius: radius.lg,
      borderWidth: 1.5,
      paddingHorizontal: 16, fontSize: 18, fontWeight: '700',
    },
    unitToggle: {
      flexDirection: 'row', borderRadius: radius.lg,
      borderWidth: 1.5, overflow: 'hidden',
    },
    unitBtn: {
      width: 44, height: 52,
      alignItems: 'center', justifyContent: 'center',
    },
    unitBtnText: { fontSize: 14, fontWeight: '700' },

    textarea: {
      borderWidth: 1.5, borderRadius: radius.lg,
      padding: 14, fontSize: 14,
      minHeight: 90, marginTop: 10,
    },
    saveTip: { ...typography.small, textAlign: 'center' },

    appetiteRow: { flexDirection: 'row', gap: 10 },
    appetiteBtn: {
      flex: 1, height: 72, borderRadius: radius.xl, borderWidth: 1.5,
      alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    appetiteEmoji: { fontSize: 26 },
    appetiteLabel: { fontSize: 13 },

    bowelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    bowelCount: { fontSize: 22, fontWeight: '800' },
    bowelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bowelBtn: {
      width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
      alignItems: 'center', justifyContent: 'center',
    },
    bowelCountBar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    bowelDot: { width: 12, height: 12, borderRadius: 6 },
    bowelPlus: { fontSize: 13, fontWeight: '700' },
  });
}
