import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { typography, radius } from '@/components/ui/theme';

const FEATURES = [
  { emoji: '🤖', title: 'Sema Coach IA', detail: 'Orientación personalizada 24/7 sobre tu GLP-1', colorKey: 'primary' as const },
  { emoji: '💡', title: 'Perspectivas inteligentes', detail: 'Descubre tus patrones: agua, síntomas, energía', colorKey: 'sage' as const },
  { emoji: '📊', title: 'Tendencias avanzadas', detail: 'Gráficos detallados de las últimas 4 semanas', colorKey: 'lavender' as const },
  { emoji: '🔔', title: 'Recordatorios personalizados', detail: 'Alertas de hidratación y registro diario', colorKey: null },
];

export default function PaywallScreen() {
  const { colors, isDark } = useTheme();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    Purchases.getOfferings()
      .then(o => {
        const pkgs = o.current?.availablePackages ?? [];
        setPackages(pkgs);
        setSelected(pkgs.find(p => p.packageType === 'ANNUAL')?.identifier ?? pkgs[0]?.identifier ?? 'annual');
        setLoading(false);
      })
      .catch(() => { setSelected('annual'); setLoading(false); });
  }, []);

  async function handlePurchase() {
    const pkg = packages.find(p => p.identifier === selected);
    if (!pkg) {
      Alert.alert('Próximamente', 'Las compras estarán disponibles en la versión final de la app.');
      return;
    }
    setPurchasing(true);
    try {
      await Purchases.purchasePackage(pkg);
      Alert.alert('🎉 ¡Bienvenida a Premium!', 'Ahora tienes acceso completo a Oztrack.');
      router.back();
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Error', e.message);
    } finally { setPurchasing(false); }
  }

  async function handleRestore() {
    if (!packages.length) {
      Alert.alert('No disponible', 'Restaurar compras estará disponible en la versión final.');
      return;
    }
    setPurchasing(true);
    try {
      const info = await Purchases.restorePurchases();
      if (Object.keys(info.entitlements.active).length > 0) {
        Alert.alert('✅ Compras restauradas');
        router.back();
      } else {
        Alert.alert('Sin compras activas', 'No encontramos compras anteriores asociadas a tu cuenta.');
      }
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setPurchasing(false); }
  }

  const heroColors = isDark
    ? ['#2D1520', '#3A1D28', colors.background]
    : ['#FDE8ED', '#F5CFD9', colors.background];

  const accentOrange = '#E8926A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Hero */}
        <LinearGradient colors={heroColors as string[]} style={styles.heroSection}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <View style={[styles.closeCircle, { backgroundColor: colors.surface + 'CC' }]}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <LinearGradient colors={colors.gradients.button as string[]} style={[styles.heroIcon, colors.shadow.lg as any]}>
            <Text style={styles.heroEmoji}>✨</Text>
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>Oztrack Premium</Text>
          <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>
            Todo lo que necesitas para tu camino GLP-1
          </Text>
          <View style={[styles.trialBanner, { backgroundColor: colors.primaryPale }]}>
            <Ionicons name="gift-outline" size={16} color={colors.primary} />
            <Text style={[styles.trialText, { color: colors.primary }]}>Pruébala 7 días sin límites · Sin compromisos</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Features */}
          <View style={styles.featuresList}>
            {FEATURES.map(f => {
              const color = f.colorKey ? colors[f.colorKey] : accentOrange;
              return (
                <View key={f.title} style={[styles.featureRow, { backgroundColor: colors.surface }, colors.shadow.sm as any]}>
                  <View style={[styles.featureIcon, { backgroundColor: color + '18' }]}>
                    <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  </View>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{f.title}</Text>
                    <Text style={[styles.featureDetail, { color: colors.text.secondary }]}>{f.detail}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={color} />
                </View>
              );
            })}
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
                        label={isAnnual ? 'Anual' : 'Mensual'}
                        price={pkg.product.priceString}
                        note={isAnnual ? '≈ $5/mes' : undefined}
                        active={active}
                        best={isAnnual}
                        onPress={() => setSelected(pkg.identifier)}
                        colors={colors}
                      />
                    );
                  })}
                </View>
              )
              : (
                <View style={styles.plans}>
                  <PlanCard label="Anual" price="$59.99/año" note="≈ $5/mes" active={selected === 'annual'} best onPress={() => setSelected('annual')} colors={colors} />
                  <PlanCard label="Mensual" price="$9.99/mes" active={selected === 'monthly'} onPress={() => setSelected('monthly')} colors={colors} />
                </View>
              )
          }

          {/* CTA */}
          <Button
            title={purchasing ? 'Procesando...' : 'Iniciar prueba gratuita de 7 días'}
            onPress={handlePurchase}
            loading={purchasing}
          />

          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: colors.text.muted }]}>Restaurar compras anteriores</Text>
          </TouchableOpacity>

          {/* Legal */}
          <View style={styles.legalRow}>
            <Text style={[styles.legalBase, { color: colors.text.muted }]}>Cancela cuando quieras · Renovación automática{'\n'}</Text>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={[styles.legalLink, { color: colors.text.muted }]}>Términos</Text>
            </TouchableOpacity>
            <Text style={[styles.legalBase, { color: colors.text.muted }]}> · </Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={[styles.legalLink, { color: colors.text.muted }]}>Privacidad</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ label, price, note, active, best, onPress, colors }: {
  label: string; price: string; note?: string;
  active: boolean; best?: boolean; onPress: () => void; colors: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {best && (
        <LinearGradient colors={[colors.success, '#4EA88A']} style={styles.savingsBadge}>
          <Text style={styles.savingsText}>MEJOR VALOR · AHORRA 50%</Text>
        </LinearGradient>
      )}
      <LinearGradient
        colors={active ? colors.gradients.heroSoft as string[] : [colors.surface, colors.surface]}
        style={[
          styles.planCard,
          { borderColor: active ? colors.primary : colors.border },
          best && styles.planAnnual,
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
  closeBtn: { position: 'absolute', top: 16, right: 20 },
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
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  legalBase: { ...typography.caption, textAlign: 'center', lineHeight: 20 },
  legalLink: { ...typography.caption, textDecorationLine: 'underline', lineHeight: 20 },
});
