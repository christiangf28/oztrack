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
import { supabase } from '@/lib/supabase';
import { loadQuiz, saveProfileFromQuiz } from '@/lib/quiz';
import { logInRevenueCat } from '@/lib/revenuecat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/components/ui/ThemeContext';
import { typography, radius } from '@/components/ui/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!email || !password || !confirm) { setError(t('auth.fillAllFields')); return; }
    if (password !== confirm) { setError(t('auth.passwordMismatch')); return; }
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return; }
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    const user = data.user;
    if (user) {
      // Vincula el usuario con RevenueCat y vuelca el quiz al perfil.
      await logInRevenueCat(user.id);
      const quizComplete = await loadQuiz();
      if (quizComplete) {
        const profileError = await saveProfileFromQuiz(user.id, email);
        setLoading(false);
        if (profileError) {
          // La cuenta ya existe pero el perfil no se guardó (ej. red).
          // El quiz sigue persistido: la pantalla de resumen reintenta el
          // guardado con la sesión ya activa.
          router.replace('/onboarding/value');
          return;
        }
        router.replace('/paywall');
        return;
      }
    }
    setLoading(false);
    router.replace('/onboarding/disclaimer');
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
          bounces={false}
        >
          {/* Header */}
          <LinearGradient
            colors={['#F9D4DF', '#F2B5C5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.decor1} />
            <View style={styles.decor2} />
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>💊</Text>
              </View>
              <View>
                <Text style={styles.appName}>Semmly</Text>
                <Text style={styles.tagline}>{t('auth.tagline')}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>{t('auth.registerTitle')}</Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>{t('auth.registerSubtitle')}</Text>

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.errorPale }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder={t('auth.emailPlaceholder')}
              icon="mail-outline"
            />
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureToggle
              placeholder={t('auth.passwordPlaceholder')}
              icon="lock-closed-outline"
            />
            <Input
              label={t('auth.confirmPassword')}
              value={confirm}
              onChangeText={setConfirm}
              secureToggle
              placeholder="••••••••"
              icon="shield-checkmark-outline"
            />

            <Button title={t('auth.createAccountBtn')} onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>{t('auth.hasAccount')} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>{t('auth.signIn')}</Text>
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
    paddingTop: 52, paddingBottom: 32, paddingHorizontal: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', position: 'relative',
  },
  decor1: {
    position: 'absolute', top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  decor2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: 1 },

  form: { padding: 28, paddingTop: 28 },
  formTitle: { ...typography.h2, marginBottom: 4 },
  formSubtitle: { ...typography.body, marginBottom: 24 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: radius.md, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, flex: 1 },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 32, paddingTop: 8 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
