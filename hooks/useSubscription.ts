import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkSubscription, RC_CONFIGURED } from '@/lib/revenuecat';

// Solo en __DEV__ o builds con EXPO_PUBLIC_QA_UNLOCK=true (perfil "preview"
// de EAS, nunca en "production"): el paywall permite marcar este flag para
// navegar la app sin depender de RevenueCat/Play Billing. Quitar el env var
// del perfil preview antes de repartir builds a testers reales.
export const QA_UNLOCK = process.env.EXPO_PUBLIC_QA_UNLOCK === 'true';
export const DEV_PREMIUM_KEY = 'oztrack_dev_premium';

async function evaluate(): Promise<boolean> {
  if (__DEV__ || QA_UNLOCK) {
    const dev = await AsyncStorage.getItem(DEV_PREMIUM_KEY);
    if (dev === 'true') return true;
  }
  if (!RC_CONFIGURED) return false;
  return checkSubscription();
}

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluate().then(v => {
      setIsPremium(v);
      setLoading(false);
    });
  }, []);

  const refresh = async () => {
    setLoading(true);
    const v = await evaluate();
    setIsPremium(v);
    setLoading(false);
  };

  return { isPremium, loading, refresh };
}
