import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { radius } from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title, onPress, variant = 'primary', loading, disabled, style, size = 'lg',
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], isDisabled && styles.disabled, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={isDisabled ? ['#E0B8C2', '#D4A0B0'] : colors.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={[styles.text, styles.primaryText, styles[`${size}Text`]]}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }

  if (variant === 'sage') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], isDisabled && styles.disabled, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#9EC4B5', '#8BAF9E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={[styles.text, styles.primaryText, styles[`${size}Text`]]}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }

  const variantStyle = {
    secondary: { backgroundColor: colors.lavenderPale },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5 as const, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  }[variant as 'secondary' | 'outline' | 'ghost'] ?? {};

  const textStyle = {
    secondary: { color: colors.lavender },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
  }[variant as 'secondary' | 'outline' | 'ghost'] ?? {};

  return (
    <TouchableOpacity
      style={[styles.base, styles[size], variantStyle, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={colors.primary} />
        : <Text style={[styles.text, textStyle, styles[`${size}Text`]]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sm: { height: 40, paddingHorizontal: 20 },
  md: { height: 48, paddingHorizontal: 24 },
  lg: { height: 56, paddingHorizontal: 32 },

  disabled: { opacity: 0.55 },

  text: { fontWeight: '600', letterSpacing: 0.2 },
  primaryText: { color: '#FFFFFF' },

  smText: { fontSize: 14 },
  mdText: { fontSize: 15 },
  lgText: { fontSize: 16 },
});
