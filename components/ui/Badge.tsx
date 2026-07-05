import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'sage' | 'premium' | 'success' | 'warning';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const { colors } = useTheme();

  if (variant === 'premium') {
    return (
      <LinearGradient colors={colors.gradients.premium} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.base, style]}>
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    );
  }

  const bg = {
    primary: colors.primaryPale,
    sage: colors.sagePale,
    success: colors.successPale,
    warning: colors.warningPale,
  }[variant];
  const fg = {
    primary: colors.primary,
    sage: colors.sage,
    success: colors.success,
    warning: colors.warning,
  }[variant];

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});
