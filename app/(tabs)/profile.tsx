import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Share, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOWEL_KEY = 'oztrack_bowel_tracker_enabled';
const AVATAR_KEY = 'oztrack_avatar';
const AVATAR_EMOJIS = [
  '🌸','🌺','🌻','🌼','🌷','🌹','💐','🍀',
  '🦋','🐝','🌈','⭐','✨','💫','🌙','☀️',
  '💪','🧘','💚','💙','💜','🩷','❤️','🎯',
  '🌿','🍃','🌱','🪷','🫀','🧬','💊','🐾',
];
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/components/ui/ThemeContext';
import { Card } from '@/components/ui/Card';
import { typography, radius } from '@/components/ui/theme';
import { UserProfile } from '@/types';

const MED_LABELS: Record<string, string> = {
  ozempic: 'Ozempic', wegovy: 'Wegovy', mounjaro: 'Mounjaro',
  zepbound: 'Zepbound', rybelsus: 'Rybelsus', other: 'Otro',
};
const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Control de peso', diabetes: 'Control de diabetes', other: 'Salud general',
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { colors, isDark, mode, setMode } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bowelEnabled, setBowelEnabled] = useState(false);
  const [editField, setEditField] = useState<'medication' | 'goals' | 'avatar' | null>(null);
  const [avatar, setAvatar] = useState<{ type: 'emoji'; value: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(BOWEL_KEY).then(v => setBowelEnabled(v === 'true'));
    AsyncStorage.getItem(AVATAR_KEY).then(v => { if (v) setAvatar(JSON.parse(v)); });
  }, []);

  function toggleBowel(v: boolean) {
    setBowelEnabled(v);
    AsyncStorage.setItem(BOWEL_KEY, v ? 'true' : 'false');
  }

  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (!user) return;
    supabase.from('users').select('*').eq('id', user.id).single()
      .then(({ data, error }) => {
        if (data) setProfile(data as UserProfile);
        else if (error) Alert.alert('Error al cargar perfil', error.message);
      });
  }, [user]);

  const initial = user?.email?.[0].toUpperCase() ?? '?';

  async function exportCSV() {
    if (!user) return;
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (!logs?.length) {
      Alert.alert('Sin datos', 'Aún no tienes registros para exportar.');
      return;
    }
    const headers = 'Fecha,Náuseas,Fatiga,Ánimo,Apetito,Agua (ml),Peso (kg),Visitas al baño,Notas';
    const rows = (logs as any[]).map(l =>
      `${l.date},${l.nausea},${l.fatigue},${l.mood},${l.appetite ?? ''},${l.water_ml},${l.weight ?? ''},${l.bowel_movements ?? ''},"${String(l.meal_notes ?? '').replace(/"/g, '""')}"`
    );
    try {
      await Share.share({ message: [headers, ...rows].join('\n'), title: 'Oztrack — Mis registros' });
    } catch {}
  }

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás segura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); router.replace('/(auth)/login'); },
      },
    ]);
  }

  function pickEmoji(emoji: string) {
    const next = { type: 'emoji' as const, value: emoji };
    setAvatar(next);
    AsyncStorage.setItem(AVATAR_KEY, JSON.stringify(next));
    setEditField(null);
  }

  function removeAvatar() {
    setAvatar(null);
    AsyncStorage.removeItem(AVATAR_KEY);
    setEditField(null);
  }

  async function handleUpdateProfile(field: 'medication' | 'goals', value: string) {
    if (!user || !profile) return;
    const { error } = await supabase.from('users').update({ [field]: value }).eq('id', user.id);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar el cambio. Intenta de nuevo.');
      return;
    }
    setProfile({ ...profile, [field]: value });
    setEditField(null);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Se eliminarán permanentemente tu cuenta y todos tus datos de salud. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: () => Alert.alert(
            '¿Segura?',
            'Esta es tu última oportunidad. Todo será eliminado definitivamente.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Sí, eliminar todo', style: 'destructive',
                onPress: async () => {
                  try {
                    if (!user) return;
                    await supabase.from('daily_logs').delete().eq('user_id', user.id);
                    await supabase.from('users').delete().eq('id', user.id);
                    await supabase.rpc('delete_user');
                    await AsyncStorage.clear();
                    router.replace('/welcome');
                  } catch {
                    Alert.alert('Error', 'No se pudo eliminar la cuenta. Escríbenos a privacy@oztrack.app');
                  }
                },
              },
            ],
          ),
        },
      ],
    );
  }

  const themeOptions: { label: string; value: 'light' | 'dark' | 'system'; icon: any }[] = [
    { label: 'Claro', value: 'light', icon: 'sunny-outline' },
    { label: 'Oscuro', value: 'dark', icon: 'moon-outline' },
    { label: 'Sistema', value: 'system', icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <LinearGradient
          colors={isDark ? ['#2D1520', '#1F1318', colors.background] : ['#FDE8ED', '#FAD9E3', colors.background]}
          style={styles.hero}
        >
          <TouchableOpacity onPress={() => setEditField('avatar')} activeOpacity={0.8}>
            <LinearGradient colors={colors.gradients.button} style={styles.avatar}>
              {avatar?.type === 'emoji'
                ? <Text style={styles.avatarEmoji}>{avatar.value}</Text>
                : <Text style={styles.avatarInitial}>{initial}</Text>
              }
            </LinearGradient>
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.email, { color: colors.text.secondary }]}>{user?.email}</Text>
          {isPremium && (
            <LinearGradient colors={colors.gradients.premium} style={styles.premiumBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.premiumText}>Premium</Text>
            </LinearGradient>
          )}
        </LinearGradient>

        <View style={styles.content}>

          {/* Perfil */}
          {profile && (
            <Card style={styles.card}>
              <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>MI PERFIL</Text>
              <EditableInfoRow icon="medical" color={colors.primary} label="Medicamento" value={MED_LABELS[profile.medication] ?? profile.medication} colors={colors} onPress={() => setEditField('medication')} />
              <EditableInfoRow icon="flag" color={colors.sage} label="Objetivo" value={GOAL_LABELS[profile.goals] ?? profile.goals} colors={colors} onPress={() => setEditField('goals')} />
              <InfoRow icon="calendar" color={colors.lavender} label="Miembro desde" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '—'} colors={colors} last />
            </Card>
          )}

          {/* Suscripción */}
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>SUSCRIPCIÓN</Text>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/paywall')} activeOpacity={0.7}>
              <LinearGradient colors={isPremium ? colors.gradients.premium : [colors.border, colors.borderLight]} style={styles.menuIconBox}>
                <Ionicons name={isPremium ? 'star' : 'star-outline'} size={18} color={isPremium ? '#fff' : colors.text.muted} />
              </LinearGradient>
              <View style={styles.menuTextBlock}>
                <Text style={[styles.menuLabel, { color: colors.text.primary }]}>{isPremium ? 'Premium activo' : 'Actualizar a Premium'}</Text>
                <Text style={[styles.menuDetail, { color: colors.text.muted }]}>{isPremium ? 'Acceso completo' : '7 días gratis · $9.99/mes'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          </Card>

          {/* Tema */}
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>APARIENCIA</Text>
            <View style={[styles.themeToggle, { backgroundColor: colors.backgroundWarm, borderColor: colors.border }]}>
              {themeOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.themeBtn,
                    mode === opt.value && { backgroundColor: colors.surface, ...colors.shadow.sm },
                  ]}
                  onPress={() => setMode(opt.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={mode === opt.value ? colors.primary : colors.text.muted}
                  />
                  <Text style={[
                    styles.themeBtnText,
                    { color: mode === opt.value ? colors.primary : colors.text.muted },
                    mode === opt.value && { fontWeight: '700' },
                  ]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Ajustes */}
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>AJUSTES</Text>
            <MenuItem icon="notifications-outline" color={colors.primary} label="Notificaciones" detail="Recordatorio diario y día de inyección" onPress={() => router.push('/notifications')} colors={colors} />
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
              { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
              <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage + '18' }}>
                <Text style={{ fontSize: 18 }}>🚽</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.bodyMed, color: colors.text.primary }}>Tránsito intestinal</Text>
                <Text style={{ ...typography.small, color: colors.text.muted, marginTop: 1 }}>Registrar visitas diarias al baño</Text>
              </View>
              <Switch
                value={bowelEnabled}
                onValueChange={toggleBowel}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={bowelEnabled ? colors.primary : colors.backgroundWarm}
              />
            </View>
            <MenuItem icon="download-outline" color="#5BA8D0" label="Exportar mis datos" detail="CSV con todos tus registros" onPress={exportCSV} colors={colors} />
            <MenuItem icon="globe-outline" color={colors.sage} label="Idioma" detail="Español" onPress={() => Alert.alert('Idioma', 'Actualmente disponible solo en español.\n\nInglés próximamente 🌍')} colors={colors} />
            <MenuItem icon="document-text-outline" color={colors.lavender} label="Política de Privacidad" onPress={() => router.push('/legal/privacy')} colors={colors} />
            <MenuItem icon="shield-checkmark-outline" color="#E8926A" label="Términos de Servicio" onPress={() => router.push('/legal/terms')} colors={colors} last />
          </Card>

          {/* Cerrar sesión */}
          <TouchableOpacity
            style={[styles.signOutRow, { backgroundColor: colors.errorPale }]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={[styles.signOutIcon, { backgroundColor: colors.error + '18' }]}>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            </View>
            <Text style={[styles.signOutText, { color: colors.error }]}>Cerrar sesión</Text>
          </TouchableOpacity>

          {/* Eliminar cuenta */}
          <TouchableOpacity
            style={[styles.deleteRow, { borderColor: colors.error + '40' }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.deleteText, { color: colors.error }]}>Eliminar mi cuenta y datos</Text>
          </TouchableOpacity>

          <Text style={[styles.version, { color: colors.text.muted }]}>Oztrack v1.0 · hecho con 🌸</Text>

          {/* Links legales */}
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={[styles.legalLink, { color: colors.text.muted }]}>Política de Privacidad</Text>
            </TouchableOpacity>
            <Text style={[styles.legalSep, { color: colors.text.muted }]}>·</Text>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={[styles.legalLink, { color: colors.text.muted }]}>Términos de Servicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={editField !== null} transparent animationType="slide" onRequestClose={() => setEditField(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditField(null)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {editField === 'avatar' ? 'Foto de perfil' : editField === 'medication' ? 'Medicamento' : 'Objetivo'}
            </Text>
            {editField === 'avatar' ? (
              <View>
                <Text style={[{ fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.text.muted, marginBottom: 4 }]}>EMOJI</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {AVATAR_EMOJIS.map(e => (
                    <TouchableOpacity key={e} onPress={() => pickEmoji(e)}
                      style={[styles.emojiBtn, avatar?.value === e && { borderColor: colors.primary, borderWidth: 2 }]}>
                      <Text style={{ fontSize: 24 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {avatar && (
                  <TouchableOpacity style={[styles.modalOption, { marginTop: 12 }]} onPress={removeAvatar}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.modalOptionText, { color: colors.error, flex: 1, marginLeft: 12 }]}>Eliminar foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : editField === 'medication'
              ? Object.entries(MED_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.modalOption, profile?.medication === key && { backgroundColor: colors.primaryLight + '30' }]}
                    onPress={() => handleUpdateProfile('medication', key)}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text.primary }, profile?.medication === key && { color: colors.primary, fontWeight: '700' }]}>{label}</Text>
                    {profile?.medication === key && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                ))
              : Object.entries(GOAL_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.modalOption, profile?.goals === key && { backgroundColor: colors.primaryLight + '30' }]}
                    onPress={() => handleUpdateProfile('goals', key)}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text.primary }, profile?.goals === key && { color: colors.primary, fontWeight: '700' }]}>{label}</Text>
                    {profile?.goals === key && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function EditableInfoRow({ icon, color, label, value, colors, onPress }: any) {
  return (
    <TouchableOpacity
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
        { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '18' }}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.text.muted, fontWeight: '500', marginBottom: 2 }}>{label}</Text>
        <Text style={{ ...typography.bodyMed, color: colors.text.primary }}>{value}</Text>
      </View>
      <Ionicons name="create-outline" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

function InfoRow({ icon, color, label, value, colors, last }: any) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
      !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '18' }}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.text.muted, fontWeight: '500', marginBottom: 2 }}>{label}</Text>
        <Text style={{ ...typography.bodyMed, color: colors.text.primary }}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, color, label, detail, onPress, colors, last }: any) {
  return (
    <TouchableOpacity
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
        !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: color + '18' }}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.bodyMed, color: colors.text.primary }}>{label}</Text>
        {detail && <Text style={{ ...typography.small, color: colors.text.muted, marginTop: 1 }}>{detail}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingBottom: 48 },
    hero: {
      paddingTop: 16, paddingBottom: 32,
      alignItems: 'center', gap: 8,
      borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    },
    avatar: {
      width: 84, height: 84, borderRadius: 42,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 36, fontWeight: '900', color: '#fff' },
    email: { ...typography.bodyMed },
    premiumBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 5,
    },
    premiumText: { fontSize: 12, fontWeight: '700', color: '#fff' },

    content: { padding: 16, gap: 14 },
    card: { gap: 0 },
    sectionLabel: {
      fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14,
    },

    themeToggle: {
      flexDirection: 'row', borderRadius: radius.xl,
      borderWidth: 1.5, padding: 4, gap: 4,
    },
    themeBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 8, borderRadius: radius.lg,
    },
    themeBtnText: { fontSize: 13 },

    menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    menuIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuTextBlock: { flex: 1 },
    menuLabel: { ...typography.bodyMed },
    menuDetail: { ...typography.small, marginTop: 1 },

    signOutRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: radius.xl, padding: 16,
    },
    signOutIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    signOutText: { fontSize: 15, fontWeight: '600' },

    deleteRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderRadius: radius.xl, paddingVertical: 12, borderWidth: 1,
    },
    deleteText: { fontSize: 13, fontWeight: '500' },

    version: { ...typography.caption, textAlign: 'center', marginTop: 4 },

    legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, paddingBottom: 8 },
    legalLink: { fontSize: 12, textDecorationLine: 'underline' },
    legalSep: { fontSize: 12 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 4 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
    modalOptionText: { fontSize: 15 },

    avatarPhoto: { width: 84, height: 84, borderRadius: 42 },
    avatarEmoji: { fontSize: 44 },
    avatarEditBadge: { position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    emojiBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'transparent' },
  });
}
