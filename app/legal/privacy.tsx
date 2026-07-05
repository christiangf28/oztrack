import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/ui/ThemeContext';

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('legal.privacy.title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updated, { color: colors.text.muted }]}>{t('legal.privacy.updated')}</Text>
        <Section title={t('legal.privacy.whatWeCollectTitle')} colors={colors}>
          {t('legal.privacy.whatWeCollectBody')}
        </Section>
        <Section title={t('legal.privacy.howWeUseTitle')} colors={colors}>
          {t('legal.privacy.howWeUseBody')}
        </Section>
        <Section title={t('legal.privacy.aiCoachTitle')} colors={colors}>
          {t('legal.privacy.aiCoachBody')}
        </Section>
        <Section title={t('legal.privacy.retentionTitle')} colors={colors}>
          {t('legal.privacy.retentionBody')}
        </Section>
        <Section title={t('legal.privacy.contactTitle')} colors={colors}>
          {t('legal.privacy.contactBody')}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, colors }: { title: string; children: string; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.text.secondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 60 },
  updated: { fontSize: 12, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
});
