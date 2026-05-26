import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ui/ThemeContext';

const { width } = Dimensions.get('window');

const WELCOME_SHOWN_KEY = 'oztrack_welcome_shown';

const slides = [
  {
    id: '1',
    emoji: '✨',
    title: 'Tu cuerpo está cambiando.',
    subtitle: 'Acompáñalo.',
    body: 'El seguimiento diario hace la diferencia entre esforzarse y progresar con GLP-1.',
    gradientKey: 'heroSoft' as const,
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Síntomas, peso,\nbienestar.',
    subtitle: 'Todo en un lugar.',
    body: 'Registra cómo te sientes cada día y descubre tus patrones semana a semana.',
    gradientKey: 'sage' as const,
  },
  {
    id: '3',
    emoji: '🤖',
    title: 'Tu Coach IA,\nsiempre contigo.',
    subtitle: 'A cualquier hora.',
    body: 'Resuelve dudas, ajusta tu rutina y mantente motivada con apoyo personalizado.',
    gradientKey: 'heroSoft' as const,
  },
  {
    id: '4',
    emoji: '🌸',
    title: 'Miles de personas\nya en camino.',
    subtitle: '¿Te unes?',
    body: 'Pruébala 7 días sin límites. Sin compromisos. Resultados reales.',
    gradientKey: 'heroSoft' as const,
    isCta: true,
  },
];

function Slide({ item, index, scrollX }: { item: typeof slides[0]; index: number; scrollX: SharedValue<number> }) {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [24, 0, 24], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }, { scale }] };
  });

  const gradient = colors.gradients[item.gradientKey] as [string, string, ...string[]];

  return (
    <View style={[styles.slide, { width }]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <Animated.View style={[styles.slideContent, animatedStyle]}>
        <View style={[styles.emojiContainer, { backgroundColor: colors.surface + 'CC' }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>{item.subtitle}</Text>
        <Text style={[styles.body, { color: colors.text.secondary }]}>{item.body}</Text>
      </Animated.View>
    </View>
  );
}

function Dots({ count, activeIndex, colors }: { count: number; activeIndex: number; colors: any }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? colors.primary : colors.border,
                width: isActive ? 20 : 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  async function goNext() {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await markShown();
      router.replace('/(auth)/register');
    }
  }

  async function goLogin() {
    await markShown();
    router.replace('/(auth)/login');
  }

  async function markShown() {
    await AsyncStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  }

  const isLast = activeIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => { scrollX.value = e.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Dots count={slides.length} activeIndex={activeIndex} colors={colors} />

        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={colors.gradients.button as [string, string, ...string[]]}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>
              {isLast ? 'Empezar gratis' : 'Siguiente'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={goLogin} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
            Ya tengo cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1 },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 160,
  },
  emojiContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: { fontSize: 44 },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  primaryButton: {
    width: width - 48,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
