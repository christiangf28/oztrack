import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ui/ThemeContext';
import { typography, radius } from '@/components/ui/theme';

export default function DisclaimerScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header decorativo */}
      <LinearGradient
        colors={[colors.primaryPale, colors.surfaceRose, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.iconWrap}>
          <LinearGradient colors={['#F2B5C5', '#D4748F']} style={styles.iconGradient}>
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('onboarding.disclaimer.title')}</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{t('onboarding.disclaimer.subtitle')}</Text>
      </LinearGradient>

      {/* Contenido */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DisclaimerItem
          icon="information-circle"
          color={colors.primary}
          title={t('onboarding.disclaimer.item1Title')}
          text={t('onboarding.disclaimer.item1Text')}
          colors={colors}
        />
        <DisclaimerItem
          icon="medkit"
          color={colors.sage}
          title={t('onboarding.disclaimer.item2Title')}
          text={t('onboarding.disclaimer.item2Text')}
          colors={colors}
        />
        <DisclaimerItem
          icon="lock-closed"
          color={colors.lavender}
          title={t('onboarding.disclaimer.item3Title')}
          text={t('onboarding.disclaimer.item3Text')}
          colors={colors}
        />
        <DisclaimerItem
          icon="chatbubble-ellipses"
          color="#E8926A"
          title={t('onboarding.disclaimer.item4Title')}
          text={t('onboarding.disclaimer.item4Text')}
          colors={colors}
        />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setChecked(v => !v)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            { borderColor: colors.border },
            checked && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}>
            {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.checkLabel, { color: colors.text.primary }]}>
            {t('onboarding.disclaimer.checkLabel')}
          </Text>
        </TouchableOpacity>

        <Button
          title={t('onboarding.disclaimer.accept')}
          onPress={() => router.push('/onboarding/medication')}
          disabled={!checked}
        />
      </View>
    </SafeAreaView>
  );
}

function DisclaimerItem({
  icon, color, title, text, colors,
}: {
  icon: string; color: string; title: string; text: string; colors: any;
}) {
  return (
    <View style={[styles.item, { backgroundColor: colors.surface }]}>
      <View style={[styles.itemIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text.primary }]}>{title}</Text>
        <Text style={[styles.itemText, { color: colors.text.secondary }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerGradient: {
    paddingTop: 40, paddingBottom: 28,
    alignItems: 'center', paddingHorizontal: 24,
  },
  iconWrap: { marginBottom: 16 },
  iconGradient: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.h2, textAlign: 'center', marginBottom: 4 },
  subtitle: { ...typography.body },

  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16 },

  item: {
    flexDirection: 'row', gap: 14,
    borderRadius: radius.xl,
    padding: 16,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1 },
  itemTitle: { ...typography.h4, marginBottom: 4 },
  itemText: { ...typography.small, lineHeight: 19 },

  footer: { padding: 24, gap: 16, borderTopWidth: StyleSheet.hairlineWidth },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
});
