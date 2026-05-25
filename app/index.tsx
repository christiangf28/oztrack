import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/components/ui/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SHOWN_KEY = 'oztrack_welcome_shown';

export default function Index() {
  const { session, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [welcomeShown, setWelcomeShown] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SHOWN_KEY).then(val => {
      setWelcomeShown(val === 'true');
    });
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

  const ready = !loading && welcomeShown !== null && (!session || onboarded !== null);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!welcomeShown) return <Redirect href="/welcome" />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!onboarded) return <Redirect href="/onboarding/disclaimer" />;
  return <Redirect href="/(tabs)/track" />;
}
