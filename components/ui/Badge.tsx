import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'sage' | 'premium' | 'success' | 'warning';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  if (variant === 'premium') {
    return (
      <LinearGradient colors={colors.gradients.premium} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.base, style]}>
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  primary: { backgroundColor: colors.primaryPale },
  sage: { backgroundColor: colors.sagePale },
  success: { backgroundColor: colors.successPale },
  warning: { backgroundColor: colors.warningPale },
  text: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  primaryText: { color: colors.primary },
  sageText: { color: colors.sage },
  successText: { color: colors.success },
  warningText: { color: colors.warning },
});
