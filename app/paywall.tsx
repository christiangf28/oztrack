import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { RC_CONFIGURED, ENTITLEMENT_ID } from '@/lib/revenuecat';
import { Sentry } from '@/lib/sentry';
import { DEV_PREMIUM_KEY } from '@/hooks/useSubscription';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { typography, radius } from '@/components/ui/theme';

const FEATURE_KEYS = [
  { key: 'coach',     emoji: '🤖', colorKey: 'primary' as const },
  { key: 'insights',  emoji: '💡', colorKey: 'sage' as const },
  { key: 'trends',    emoji: '📊', colorKey: 'lavender' as const },
  { key: 'reminders', emoji: '🔔', colorKey: null },
];

export default function PaywallScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  // Hard paywall por defecto; ?dismissable=1 solo cuando se abre desde Profile.
  const { dismissable } = useLocalSearchParams<{ dismissable?: string }>();
  const canClose = dismissable === '1';

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string>('annual');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!RC_CONFIGURED) { setLoading(false); return; }
    Purchases.getOfferings()
      .then(o => {
        const pkgs = o.current?.availablePackages ?? [];
        setPackages(pkgs);
        setSelected(pkgs.find(p => p.packageType === 'ANNUAL')?.identifier ?? pkgs[0]?.identifier ?? 'annual');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedPkg = packages.find(p => p.identifier === selected);
  const annualSelected = selectedPkg ? selectedPkg.packageType === 'ANNUAL' : selected === 'annual';

  function unlock() {
    router.replace('/(tabs)/track');
  }

  async function handlePurchase() {
    const pkg = selectedPkg;
    if (!pkg) {
      Alert.alert(t('paywall.unavailableTitle'), t('paywall.unavailableBody'));
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        unlock();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Sentry.captureException(e);
        Alert.alert(t('common.error'), e.message);
      }
    } finally { setPurchasing(false); }
  }

  async function handleRestore() {
    if (!RC_CONFIGURED) {
      Alert.alert(t('paywall.unavailableTitle'), t('paywall.unavailableBody'));
      return;
    }
    setPurchasing(true);
    try {
      const info = await Purchases.restorePurchases();
      if (info.entitlements.active[ENTITLEMENT_ID]) {
        unlock();
      } else {
        Alert.alert(t('paywall.noRestoreTitle'), t('paywall.noRestoreBody'));
      }
    } catch (e: any) {
      Sentry.captureException(e);
      Alert.alert(t('common.error'), e.message);
    }
    finally { setPurchasing(false); }
  }

  async function handleDevContinue() {
    await AsyncStorage.setItem(DEV_PREMIUM_KEY, 'true');
    unlock();
  }

  const heroColors = isDark
    ? ['#2D1520', '#3A1D28', colors.background]
    : ['#FDE8ED', '#F5CFD9', colors.background];

  const accentOrange = '#E8926A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Hero */}
        <LinearGradient colors={heroColors as [string, string, ...string[]]} style={styles.heroSection}>
          {canClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <View style={[styles.closeCircle, { backgroundColor: colors.surface + 'CC' }]}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </View>
            </TouchableOpacity>
          )}

          <LinearGradient colors={colors.gradients.button as [string, string, ...string[]]} style={[styles.heroIcon, colors.shadow.lg as any]}>
            <Text style={styles.heroEmoji}>✨</Text>
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>{t('paywall.title')}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>{t('paywall.subtitle')}</Text>
          {annualSelected && (
            <View style={[styles.trialBanner, { backgroundColor: colors.primaryPale }]}>
              <Ionicons name="gift-outline" size={16} color={colors.primary} />
              <Text style={[styles.trialText, { color: colors.primary }]}>{t('paywall.trialBanner')}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>

          {/* Features */}
          <View style={styles.featuresList}>
            {FEATURE_KEYS.map(f => {
              const color = f.colorKey ? colors[f.colorKey] : accentOrange;
              return (
                <View key={f.key} style={[styles.featureRow, { backgroundColor: colors.surface }, colors.shadow.sm as any]}>
                  <View style={[styles.featureIcon, { backgroundColor: color + '18' }]}>
                    <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  </View>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{t(`paywall.features.${f.key}.title`)}</Text>
                    <Text style={[styles.featureDetail, { color: colors.text.secondary }]}>{t(`paywall.features.${f.key}.detail`)}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={color} />
                </View>
              );
            })}
          </View>

          {/* Social proof (placeholder hasta tener reviews reales) */}
          <View style={[styles.socialProof, { backgroundColor: colors.surface }, colors.shadow.sm as any]}>
            <Text style={styles.socialStars}>★★★★★</Text>
            <Text style={[styles.socialText, { color: colors.text.secondary }]}>{t('paywall.socialProof')}</Text>
          </View>

          {/* Planes */}
          {loading
            ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
            : packages.length > 0
              ? (
                <View style={styles.plans}>
                  {packages.map(pkg => {
                    const isAnnual = pkg.packageType === 'ANNUAL';
                    const active = selected === pkg.identifier;
                    return (
                      <PlanCard
                        key={pkg.identifier}
                        label={isAnnual ? t('paywall.annual') : t('paywall.monthly')}
                        price={pkg.product.priceString + (isAnnual ? t('paywall.perYear') : t('paywall.perMonth'))}
                        note={isAnnual ? t('paywall.annualNote') : undefined}
                        badge={isAnnual ? t('paywall.annualBadge') : undefined}
                        active={active}
                        onPress={() => setSelected(pkg.identifier)}
                        colors={colors}
                      />
                    );
                  })}
                </View>
              )
              : (
                <View style={styles.plans}>
                  <PlanCard label={t('paywall.annual')} price={'$59.99' + t('paywall.perYear')} note={t('paywall.annualNote')} badge={t('paywall.annualBadge')} active={selected === 'annual'} onPress={() => setSelected('annual')} colors={colors} />
                  <PlanCard label={t('paywall.monthly')} price={'$9.99' + t('paywall.perMonth')} active={selected === 'monthly'} onPress={() => setSelected('monthly')} colors={colors} />
                </View>
              )
          }

          {/* CTA */}
          <Button
            title={purchasing
              ? t('common.loading')
              : annualSelected ? t('paywall.ctaTrial') : t('paywall.ctaMonthly')}
            onPress={handlePurchase}
            loading={purchasing}
          />

          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: colors.text.muted }]}>{t('paywall.restore')}</Text>
          </TouchableOpacity>

          {__DEV__ && !RC_CONFIGURED && (
            <Button title="Continue (dev — RC sin configurar)" onPress={handleDevContinue} variant="ghost" size="sm" />
          )}

          {/* Legal: renovación automática (requisito de tienda) */}
          <View style={styles.legalRow}>
            <Text style={[styles.legalBase, { color: colors.text.muted }]}>{t('paywall.autoRenew')}</Text>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={() => router.push('/legal/terms')}>
                <Text style={[styles.legalLink, { color: colors.text.muted }]}>{t('paywall.terms')}</Text>
              </TouchableOpacity>
              <Text style={[styles.legalBase, { color: colors.text.muted }]}> · </Text>
              <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
                <Text style={[styles.legalLink, { color: colors.text.muted }]}>{t('paywall.privacy')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ label, price, note, badge, active, onPress, colors }: {
  label: string; price: string; note?: string; badge?: string;
  active: boolean; onPress: () => void; colors: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {badge && (
        <LinearGradient colors={[colors.success, '#4EA88A']} style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{badge}</Text>
        </LinearGradient>
      )}
      <LinearGradient
        colors={active ? colors.gradients.heroSoft as [string, string, ...string[]] : [colors.surface, colors.surface]}
        style={[
          styles.planCard,
          { borderColor: active ? colors.primary : colors.border },
          !!badge && styles.planAnnual,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.planName, { color: active ? colors.primaryDark : colors.text.secondary }]}>{label}</Text>
          {note && <Text style={[styles.planNote, { color: colors.text.muted }]}>{note}</Text>}
        </View>
        <Text style={[styles.planPrice, { color: active ? colors.primary : colors.text.primary }]}>{price}</Text>
        <View style={[styles.planRadio, { borderColor: active ? colors.primary : colors.border }]}>
          {active && <View style={[styles.planRadioDot, { backgroundColor: colors.primary }]} />}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center', paddingTop: 56, paddingBottom: 36,
    paddingHorizontal: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 16, right: 20, zIndex: 1 },
  closeCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroEmoji: { fontSize: 38 },
  heroTitle: { ...typography.h1, textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { ...typography.body, textAlign: 'center', marginBottom: 20 },
  trialBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: radius.full, paddingHorizontal: 18, paddingVertical: 10,
  },
  trialText: { fontSize: 13, fontWeight: '600' },

  content: { padding: 20, gap: 20 },

  featuresList: { gap: 10 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: radius.xl, padding: 14,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureEmoji: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { ...typography.h4, marginBottom: 2 },
  featureDetail: { ...typography.small },

  socialProof: {
    borderRadius: radius.xl, padding: 14, alignItems: 'center', gap: 4,
  },
  socialStars: { fontSize: 16, color: '#F5B942', letterSpacing: 2 },
  socialText: { ...typography.small, textAlign: 'center' },

  plans: { gap: 12 },
  savingsBadge: {
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingVertical: 6, alignItems: 'center',
  },
  savingsText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: radius.xl, padding: 18, borderWidth: 2,
  },
  planAnnual: { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  planName: { ...typography.h4 },
  planNote: { ...typography.small, marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: '800' },
  planRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  planRadioDot: { width: 10, height: 10, borderRadius: 5 },

  restoreBtn: { alignItems: 'center', marginTop: -8 },
  restoreText: { fontSize: 13, textDecorationLine: 'underline' },
  legalRow: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  legalLinksRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  legalBase: { ...typography.caption, textAlign: 'center', lineHeight: 20 },
  legalLink: { ...typography.caption, textDecorationLine: 'underline', lineHeight: 20 },
});
