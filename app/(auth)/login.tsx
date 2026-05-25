import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/components/ui/ThemeContext';
import { typography, radius } from '@/components/ui/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) { setError('Por favor completa todos los campos'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace('/');
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={['#F9D4DF', '#F2B5C5', '#E8A0B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💊</Text>
            </View>
            <Text style={styles.appName}>oztrack</Text>
            <Text style={styles.tagline}>Tu compañera en el camino GLP-1</Text>
            <View style={styles.decor1} />
            <View style={styles.decor2} />
          </LinearGradient>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>Bienvenida de nuevo</Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
              Inicia sesión para continuar tu seguimiento
            </Text>

            {!SUPABASE_CONFIGURED && (
              <View style={[styles.warnBanner, { backgroundColor: colors.warningPale, borderColor: colors.warning + '40' }]}>
                <Ionicons name="construct-outline" size={16} color={colors.warning} />
                <Text style={styles.warnText}>
                  Agrega tus claves de Supabase en el archivo <Text style={{ fontWeight: '700' }}>.env</Text> para continuar.
                </Text>
              </View>
            )}

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.errorPale }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="tu@correo.com"
              icon="mail-outline"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureToggle
              placeholder="••••••••"
              icon="lock-closed-outline"
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.text.muted }]}>o continúa con</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleGoogle}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.googleText, { color: colors.text.primary }]}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Regístrate gratis</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1 },

  hero: {
    paddingTop: 64, paddingBottom: 48,
    alignItems: 'center',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    overflow: 'hidden', position: 'relative',
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1, marginBottom: 6 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  decor1: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  decor2: {
    position: 'absolute', bottom: -20, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  form: { padding: 28, paddingTop: 32 },
  formTitle: { ...typography.h2, marginBottom: 4 },
  formSubtitle: { ...typography.body, marginBottom: 24 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: radius.md, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, flex: 1 },

  warnBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1,
  },
  warnText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '500' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, marginHorizontal: 14 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: radius.full, gap: 10,
    borderWidth: 1.5,
  },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 32, paddingTop: 8 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
