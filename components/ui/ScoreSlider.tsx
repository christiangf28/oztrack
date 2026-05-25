import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { radius } from './theme';

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color?: string;
  emoji?: string[];
  subtitle?: string;
}

const DEFAULT_EMOJI = ['😣', '😕', '😐', '🙂', '😄'];

export function ScoreSlider({
  label, value, onChange,
  color,
  emoji = DEFAULT_EMOJI,
  subtitle,
}: ScoreSliderProps) {
  const { colors } = useTheme();
  const dotColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.text.muted }]}>{subtitle}</Text>}
        </View>
        <Text style={styles.currentEmoji}>{emoji[value - 1]}</Text>
      </View>

      <View style={styles.track}>
        {[1, 2, 3, 4, 5].map(n => {
          const active = value === n;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              style={styles.btnWrapper}
              activeOpacity={0.7}
            >
              {active ? (
                <LinearGradient
                  colors={[dotColor, dotColor + 'CC']}
                  style={styles.btn}
                >
                  <Text style={styles.btnEmojiActive}>{emoji[n - 1]}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.btn, { backgroundColor: colors.backgroundWarm, borderColor: colors.border, borderWidth: 1.5 }]}>
                  <Text style={styles.btnEmoji}>{emoji[n - 1]}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 11, marginTop: 1 },
  currentEmoji: { fontSize: 26 },
  track: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  btnWrapper: { flex: 1 },
  btn: {
    height: 48, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  btnEmoji: { fontSize: 22 },
  btnEmojiActive: { fontSize: 22 },
});
