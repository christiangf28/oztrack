import { useEffect, useState } from 'react';
import { checkSubscription } from '@/lib/revenuecat';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const RC_CONFIGURED = RC_IOS_KEY !== 'REPLACE_ME' && RC_IOS_KEY !== '' &&
                      RC_ANDROID_KEY !== 'REPLACE_ME' && RC_ANDROID_KEY !== '';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(!RC_CONFIGURED);
  const [loading, setLoading] = useState(RC_CONFIGURED);

  useEffect(() => {
    if (!RC_CONFIGURED) return;
    checkSubscription().then(active => {
      setIsPremium(active);
      setLoading(false);
    });
  }, []);

  const refresh = async () => {
    if (!RC_CONFIGURED) return;
    setLoading(true);
    const active = await checkSubscription();
    setIsPremium(active);
    setLoading(false);
  };

  return { isPremium, loading, refresh };
}
