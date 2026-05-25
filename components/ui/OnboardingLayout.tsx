import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { typography } from './theme';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  emoji: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
}

export function OnboardingLayout({
  step, totalSteps, emoji, title, subtitle,
  children, footer, showBack = true,
}: OnboardingLayoutProps) {
  const { colors } = useTheme();
  const progress = step / totalSteps;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.stepText, { color: colors.text.muted }]}>{step}/{totalSteps}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primaryPale, colors.surfaceRose]}
          style={styles.emojiCircle}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </LinearGradient>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>}
      </View>

      {/* Contenido scrollable */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Footer con botón */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, gap: 12,
  },
  backBtn: { padding: 4 },
  progressBar: {
    flex: 1, height: 6,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
  },
  stepText: { fontSize: 12, fontWeight: '600', minWidth: 28 },

  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  emojiCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: { fontSize: 38 },
  title: { ...typography.h2, textAlign: 'center', marginBottom: 6 },
  subtitle: { ...typography.body, textAlign: 'center', lineHeight: 22 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 12 },
  footer: { padding: 24, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
