import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { radius } from './theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'rose' | 'sage' | 'gradient';
  shadow?: 'sm' | 'md' | 'lg';
}

export function Card({ children, style, variant = 'default', shadow = 'md' }: CardProps) {
  const { colors } = useTheme();

  const bg =
    variant === 'rose' ? colors.surfaceRose :
    variant === 'sage' ? colors.sagePale :
    colors.surface;

  if (variant === 'gradient') {
    return (
      <View style={[styles.base, colors.shadow[shadow], style]}>
        <LinearGradient
          colors={colors.gradients.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientInner}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: bg }, colors.shadow[shadow], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius['2xl'],
    padding: 20,
  },
  gradientInner: {
    borderRadius: radius['2xl'],
    padding: 20,
  },
});
