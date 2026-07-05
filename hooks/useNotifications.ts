import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PREFS_KEY = 'oztrack_notif_prefs';
const DAILY_ID = 'oztrack_daily';
const INJECTION_ID = 'oztrack_injection';
const WEEKLY_SUMMARY_ID = 'oztrack_weekly_summary';

export interface NotifPrefs {
  dailyEnabled: boolean;
  dailyHour: number;
  dailyMinute: number;
  injectionEnabled: boolean;
  injectionDay: number; // 1=Dom, 2=Lun ... 7=Sáb (expo-notifications weekday)
  injectionHour: number;
  injectionMinute: number;
  weeklyEnabled: boolean; // resumen dominical 10AM
}

const DEFAULT_PREFS: NotifPrefs = {
  dailyEnabled: false,
  dailyHour: 9,
  dailyMinute: 0,
  injectionEnabled: false,
  injectionDay: 2, // Lunes
  injectionHour: 9,
  injectionMinute: 0,
  weeklyEnabled: false,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotifPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Milli',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function loadNotifPrefs(): Promise<NotifPrefs> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  if (!raw) return DEFAULT_PREFS;
  return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
}

export async function saveAndSchedule(prefs: NotifPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));

  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(INJECTION_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID).catch(() => {});

  if (prefs.dailyEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: '¿Cómo te sientes hoy? 🌸',
        body: 'Registra tus síntomas y mantén tu racha activa.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prefs.dailyHour,
        minute: prefs.dailyMinute,
      },
    });
  }

  if (prefs.injectionEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: INJECTION_ID,
      content: {
        title: '💉 Hoy es tu día de dosis',
        body: 'Recuerda aplicar tu medicación GLP-1 y registrarlo.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: prefs.injectionDay,
        hour: prefs.injectionHour,
        minute: prefs.injectionMinute,
      },
    });
  }

  if (prefs.weeklyEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_SUMMARY_ID,
      content: {
        title: '📊 Tu resumen semanal está listo',
        body: 'Revisa cómo fue tu semana y celebra tu progreso.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // domingo
        hour: 10,
        minute: 0,
      },
    });
  }
}

export function useNotifications() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifPrefs().then(p => { setPrefs(p); setLoading(false); });
  }, []);

  return { prefs, setPrefs, loading };
}
