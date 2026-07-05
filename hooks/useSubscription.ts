import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
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

  // Sin setLoading(true): en re-checks (focus, evento de RC) no queremos
  // parpadeo de spinner; el estado solo se actualiza si cambió.
  const refresh = useCallback(async () => {
    const v = await evaluate();
    setIsPremium(v);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // RevenueCat emite este evento tras compras, restores y renovaciones:
    // sin él, isPremium quedaba congelado hasta remontar la pantalla.
    if (!RC_CONFIGURED) return;
    const listener = () => { refresh(); };
    try {
      Purchases.addCustomerInfoUpdateListener(listener);
    } catch {
      // Purchases.configure() aún no corrió (carrera en el arranque); el
      // evaluate() inicial ya cubre este montaje.
      return;
    }
    return () => { Purchases.removeCustomerInfoUpdateListener(listener); };
  }, [refresh]);

  return { isPremium, loading, refresh };
}
