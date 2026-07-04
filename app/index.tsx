import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { loadQuiz } from '@/lib/quiz';
import { colors } from '@/components/ui/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SHOWN_KEY = 'oztrack_welcome_shown';

export default function Index() {
  const { session, loading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [welcomeShown, setWelcomeShown] = useState<boolean | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SHOWN_KEY).then(val => {
      setWelcomeShown(val === 'true');
    });
    loadQuiz().then(setQuizComplete);
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setOnboarded(!!data));
  }, [session]);

  const ready =
    !loading && welcomeShown !== null && quizComplete !== null &&
    (!session || (onboarded !== null && !subLoading));

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!welcomeShown) return <Redirect href="/welcome" />;

  // Sin sesión: el quiz va primero (pre-auth); si ya lo terminó, a crear cuenta.
  if (!session) {
    if (!quizComplete) return <Redirect href="/onboarding/disclaimer" />;
    return <Redirect href="/(auth)/register" />;
  }

  // Con sesión pero sin perfil (ej. entró por login sin haber hecho el quiz).
  if (!onboarded) return <Redirect href="/onboarding/disclaimer" />;

  // Hard paywall: sin suscripción activa no hay acceso a la app.
  if (!isPremium) return <Redirect href="/paywall" />;

  return <Redirect href="/(tabs)/track" />;
}
