import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { typography, radius } from '@/components/ui/theme';
import { useNotifications, saveAndSchedule, requestNotifPermission, NotifPrefs } from '@/hooks/useNotifications';

// Weekday expo-notifications: 1=Dom, 2=Lun, 3=Mar, 4=Mié, 5=Jue, 6=Vie, 7=Sáb
const DAYS = [
  { label: 'D', name: 'Dom', value: 1 },
  { label: 'L', name: 'Lun', value: 2 },
  { label: 'M', name: 'Mar', value: 3 },
  { label: 'X', name: 'Mié', value: 4 },
  { label: 'J', name: 'Jue', value: 5 },
  { label: 'V', name: 'Vie', value: 6 },
  { label: 'S', name: 'Sáb', value: 7 },
];

function formatHour(h: number): string {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function TimePicker({ selected, onChange, colors }: { selected: number; onChange: (h: number) => void; colors: any }) {
  const [text, setText] = useState(formatHour(selected));

  useEffect(() => { setText(formatHour(selected)); }, [selected]);

  function parseHour(raw: string): number | null {
    const clean = raw.trim().toUpperCase().replace(/\s+/g, '');
    let m = clean.match(/^(\d{1,2})(?::\d{2})?$/);
    if (m) { const h = parseInt(m[1]); if (h >= 0 && h <= 23) return h; }
    m = clean.match(/^(\d{1,2})(?::\d{2})?(AM|PM)$/);
    if (m) {
      let h = parseInt(m[1]);
      if (m[2] === 'PM' && h < 12) h += 12;
      if (m[2] === 'AM' && h === 12) h = 0;
      if (h >= 0 && h <= 23) return h;
    }
    return null;
  }

  function commit() {
    const h = parseHour(text);
    if (h !== null) { onChange(h); setText(formatHour(h)); }
    else setText(formatHour(selected));
  }

  function step(delta: number) {
    const h = Math.max(0, Math.min(23, selected + delta));
    onChange(h);
    setText(formatHour(h));
  }

  return (
    <View style={styles.timeRow}>
      <TouchableOpacity onPress={() => step(-1)} style={[styles.timeBtn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}>
        <Ionicons name="remove" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
      <TextInput
        style={[styles.timeInput, { backgroundColor: colors.backgroundWarm, borderColor: colors.primary, color: colors.text.primary }]}
        value={text}
        onChangeText={setText}
        onBlur={commit}
        onSubmitEditing={commit}
        returnKeyType="done"
        textAlign="center"
        placeholder="8:00 AM"
        placeholderTextColor={colors.text.muted}
      />
      <TouchableOpacity onPress={() => step(1)} style={[styles.timeBtn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}>
        <Ionicons name="add" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

function DayPicker({ selected, onChange, colors }: { selected: number; onChange: (d: number) => void; colors: any }) {
  return (
    <View style={styles.dayRow}>
      {DAYS.map(d => {
        const active = selected === d.value;
        return (
          <TouchableOpacity key={d.value} onPress={() => onChange(d.value)} activeOpacity={0.7} style={{ alignItems: 'center', gap: 4 }}>
            {active ? (
              <LinearGradient colors={colors.gradients.button as string[]} style={styles.dayPill}>
                <Text style={styles.dayTextActive}>{d.label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.dayPill, { backgroundColor: colors.backgroundWarm, borderWidth: 1.5, borderColor: colors.border }]}>
                <Text style={[styles.dayText, { color: colors.text.secondary }]}>{d.label}</Text>
              </View>
            )}
            <Text style={{ fontSize: 9, color: active ? colors.primary : colors.text.muted, fontWeight: '600' }}>
              {d.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { prefs: saved, loading } = useNotifications();
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  const current: NotifPrefs = prefs ?? saved;

  function update(partial: Partial<NotifPrefs>) {
    setPrefs(prev => ({ ...(prev ?? saved), ...partial }));
  }

  async function handleSave() {
    setSaving(true);
    const granted = await requestNotifPermission();
    if (!granted) {
      Alert.alert(
        'Permisos necesarios',
        'Activa las notificaciones en Ajustes para recibir recordatorios.',
        [{ text: 'Entendido' }]
      );
      setSaving(false);
      return;
    }
    await saveAndSchedule(current);
    setSaving(false);
    Alert.alert('✅ Guardado', 'Tus recordatorios están configurados.', [
      { text: 'Listo', onPress: () => router.back() },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Notificaciones</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>

          {/* Recordatorio diario */}
          <Card>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryPale }]}>
                <Text style={styles.iconEmoji}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recordatorio diario</Text>
                <Text style={[styles.sectionDetail, { color: colors.text.secondary }]}>
                  Avísame de registrar mis síntomas
                </Text>
              </View>
              <Switch
                value={current.dailyEnabled}
                onValueChange={v => update({ dailyEnabled: v })}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={current.dailyEnabled ? colors.primary : colors.backgroundWarm}
              />
            </View>

            {current.dailyEnabled && (
              <View style={[styles.pickerSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.pickerLabel, { color: colors.text.muted }]}>Hora del recordatorio</Text>
                <TimePicker
                  selected={current.dailyHour}
                  onChange={h => update({ dailyHour: h })}
                  colors={colors}
                />
              </View>
            )}
          </Card>

          {/* Día de inyección */}
          <Card>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.sagePale }]}>
                <Text style={styles.iconEmoji}>💉</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Día de inyección</Text>
                <Text style={[styles.sectionDetail, { color: colors.text.secondary }]}>
                  Recuerda aplicar tu dosis semanal
                </Text>
              </View>
              <Switch
                value={current.injectionEnabled}
                onValueChange={v => update({ injectionEnabled: v })}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={current.injectionEnabled ? colors.primary : colors.backgroundWarm}
              />
            </View>

            {current.injectionEnabled && (
              <View style={[styles.pickerSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.pickerLabel, { color: colors.text.muted }]}>Día de la semana</Text>
                <DayPicker
                  selected={current.injectionDay}
                  onChange={d => update({ injectionDay: d })}
                  colors={colors}
                />
                <Text style={[styles.pickerLabel, { color: colors.text.muted, marginTop: 16 }]}>Hora</Text>
                <TimePicker
                  selected={current.injectionHour}
                  onChange={h => update({ injectionHour: h })}
                  colors={colors}
                />
              </View>
            )}
          </Card>

          {/* Resumen semanal */}
          <Card>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.lavenderPale }]}>
                <Text style={styles.iconEmoji}>📊</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Resumen semanal</Text>
                <Text style={[styles.sectionDetail, { color: colors.text.secondary }]}>
                  Cada domingo a las 10:00 AM
                </Text>
              </View>
              <Switch
                value={current.weeklyEnabled}
                onValueChange={v => update({ weeklyEnabled: v })}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={current.weeklyEnabled ? colors.primary : colors.backgroundWarm}
              />
            </View>
          </Card>

          {/* Info */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryPale, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              Las notificaciones solo se envían si la app está instalada. Puedes desactivarlas en cualquier momento desde aquí o desde los ajustes del sistema.
            </Text>
          </View>

          <Button
            title={saving ? 'Guardando...' : 'Guardar cambios'}
            onPress={handleSave}
            loading={saving}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h4 },

  content: { padding: 16, gap: 14 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 22 },
  sectionTitle: { ...typography.bodyMed, marginBottom: 2 },
  sectionDetail: { ...typography.small },

  pickerSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  pickerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  timeInput: { flex: 1, height: 52, borderWidth: 2, borderRadius: radius.lg, fontSize: 18, fontWeight: '700' },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayPill: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '600' },
  dayTextActive: { fontSize: 14, fontWeight: '700', color: '#fff' },

  infoBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    borderRadius: radius.lg, padding: 14, borderWidth: 1,
  },
  infoText: { ...typography.small, flex: 1, lineHeight: 18 },
});
