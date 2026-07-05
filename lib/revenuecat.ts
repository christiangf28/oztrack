import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// Identifier EXACTO del entitlement en el dashboard de RevenueCat.
// ⚠️ Si se renombra en el dashboard, actualizar acá también — deben coincidir
// letra por letra o ninguna compra desbloquea la app.
export const ENTITLEMENT_ID = 'Semmly Pro';

const apiKey =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

export const RC_CONFIGURED = !!apiKey && apiKey !== 'REPLACE_ME';

let initialized = false;

export function initRevenueCat(userId?: string) {
  if (!RC_CONFIGURED || initialized) return;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: apiKey!, appUserID: userId });
  initialized = true;
}

/** Vincula la compra anónima (o el dispositivo) con el usuario registrado. */
export async function logInRevenueCat(userId: string) {
  if (!RC_CONFIGURED || !initialized) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // no bloquea el registro; el entitlement se resuelve en el próximo check
  }
}

export async function checkSubscription(): Promise<boolean> {
  if (!RC_CONFIGURED || !initialized) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
