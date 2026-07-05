import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { askCoach, CoachDailyLimitError } from '@/lib/anthropic';
import { Sentry } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/components/ui/ThemeContext';
import { Button } from '@/components/ui/Button';
import { typography, radius } from '@/components/ui/theme';
import { ChatMessage } from '@/types';

const COACH_INTRO_KEY = 'oztrack_coach_intro_shown';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s/gm, '• ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function CoachScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isPremium, loading: subLoading, refresh: refreshSub } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Re-chequear al volver al tab: cubre compras hechas desde el paywall
  // (y el QA unlock) sin esperar a remontar la pantalla.
  useFocusEffect(useCallback(() => { refreshSub(); }, [refreshSub]));

  const SUGGESTIONS = [
    t('coach.suggestion1'),
    t('coach.suggestion2'),
    t('coach.suggestion3'),
    t('coach.suggestion4'),
  ];

  useEffect(() => {
    if (!user || !isPremium) return;
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          setMessages(data as ChatMessage[]);
        } else {
          const shown = await AsyncStorage.getItem(COACH_INTRO_KEY);
          if (!shown) {
            setMessages([
              { user_id: user.id, role: 'assistant', content: t('coach.introLine1') },
              { user_id: user.id, role: 'assistant', content: t('coach.introLine2') },
            ]);
            await AsyncStorage.setItem(COACH_INTRO_KEY, 'true');
          }
        }
      });
  }, [user, isPremium]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || thinking || !user) return;
    const userMsg: ChatMessage = { user_id: user.id, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      // La Edge Function persiste ambos mensajes server-side (el rate limit
      // cuenta filas que el cliente no controla) — acá no se inserta nada.
      const history = [...messages, userMsg].map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const replyContent = stripMarkdown(await askCoach(history, i18n.language));
      const assistantMsg: ChatMessage = { user_id: user.id, role: 'assistant', content: replyContent };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const limitReached = e instanceof CoachDailyLimitError;
      if (!limitReached) Sentry.captureException(e);
      setMessages(prev => [...prev, {
        user_id: user.id,
        role: 'assistant' as const,
        content: limitReached ? t('coach.limitReached') : t('coach.genericError'),
      }]);
    } finally {
      setThinking(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, thinking, user, messages, i18n.language]);

  if (subLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isPremium) return <PaywallPrompt />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.heroSoft as [string, string, ...string[]]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarWrap}>
          <LinearGradient colors={colors.gradients.button as [string, string, ...string[]]} style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </LinearGradient>
          <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.coachName, { color: colors.text.primary }]}>Semmly</Text>
          <Text style={[styles.coachStatus, { color: colors.text.muted }]}>{t('coach.online')}</Text>
        </View>
        <View style={[styles.premiumPill, { backgroundColor: colors.lavender }]}>
          <Ionicons name="star" size={11} color="#fff" />
          <Text style={styles.premiumPillText}>Premium</Text>
        </View>
      </LinearGradient>

      {/* Mensajes */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={<WelcomeMessage onSuggest={sendMessage} suggestions={SUGGESTIONS} />}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListFooterComponent={thinking ? <TypingIndicator /> : null}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.backgroundWarm,
            borderColor: colors.border,
            color: colors.text.primary,
          }]}
          value={input}
          onChangeText={setInput}
          placeholder={t('coach.placeholder')}
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || thinking}
          activeOpacity={0.8}
        >
          <LinearGradient colors={colors.gradients.button as [string, string, ...string[]]} style={styles.sendGradient}>
            <Ionicons name="send" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <LinearGradient colors={['#F2B5C5', '#D4748F']} style={styles.bubbleAvatar}>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </LinearGradient>
      )}
      {isUser ? (
        <LinearGradient colors={colors.gradients.button as [string, string, ...string[]]} style={[styles.bubble, styles.bubbleUser]}>
          <Text style={styles.bubbleTextUser}>{message.content}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleAI, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.bubbleTextAI, { color: colors.text.primary }]}>{message.content}</Text>
        </View>
      )}
    </View>
  );
}

function TypingIndicator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.bubbleRow}>
      <LinearGradient colors={['#F2B5C5', '#D4748F']} style={styles.bubbleAvatar}>
        <Text style={{ fontSize: 14 }}>🤖</Text>
      </LinearGradient>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble, {
        backgroundColor: colors.surface, borderColor: colors.border,
      }]}>
        <Text style={[styles.typingText, { color: colors.text.muted }]}>{t('coach.thinking')}</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />
      </View>
    </View>
  );
}

function WelcomeMessage({ onSuggest, suggestions }: { onSuggest: (text: string) => void; suggestions: string[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.welcome}>
      <Text style={styles.welcomeEmoji}>🌸</Text>
      <Text style={[styles.welcomeTitle, { color: colors.text.primary }]}>{t('coach.welcomeTitle')}</Text>
      <Text style={[styles.welcomeText, { color: colors.text.secondary }]}>
        {t('coach.welcomeText')}
      </Text>
      <View style={styles.suggestions}>
        {suggestions.map(q => (
          <TouchableOpacity
            key={q}
            style={[styles.suggestion, { backgroundColor: colors.surfaceRose, borderColor: colors.border }]}
            onPress={() => onSuggest(q)}
            activeOpacity={0.7}
          >
            <Text style={[styles.suggestionText, { color: colors.primary }]}>{q}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function PaywallPrompt() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const FEATURES = [t('coach.paywallFeature1'), t('coach.paywallFeature2'), t('coach.paywallFeature3')];
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={colors.gradients.heroSoft as [string, string, ...string[]]}
        style={styles.paywallGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Text style={styles.paywallEmoji}>✨</Text>
        <Text style={[styles.paywallTitle, { color: colors.text.primary }]}>Semmly</Text>
        <Text style={[styles.paywallDesc, { color: colors.text.secondary }]}>
          {t('coach.paywallDesc')}
        </Text>
        <View style={styles.paywallFeatures}>
          {FEATURES.map(f => (
            <View key={f} style={styles.paywallFeatureRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.sage} />
              <Text style={[styles.paywallFeatureText, { color: colors.text.primary }]}>{f}</Text>
            </View>
          ))}
        </View>
        <Button title={t('coach.paywallCta')} onPress={() => router.push('/paywall')} />
        <Text style={[styles.paywallNote, { color: colors.text.muted }]}>
          {t('coach.paywallNote')}
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 22 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6, borderWidth: 2,
  },
  coachName: { ...typography.h4 },
  coachStatus: { ...typography.caption },
  premiumPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  },
  premiumPillText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  messageList: { padding: 16, paddingBottom: 8 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  bubbleAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '76%', borderRadius: 20, padding: 14 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleTextUser: { fontSize: 14, color: '#fff', lineHeight: 21 },
  bubbleTextAI: { fontSize: 14, lineHeight: 21 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  typingText: { fontSize: 13 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, borderTopWidth: 1,
  },
  input: {
    flex: 1, borderWidth: 1.5, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendDisabled: { opacity: 0.4 },
  sendGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  welcome: { padding: 24, alignItems: 'center', paddingTop: 40 },
  welcomeEmoji: { fontSize: 48, marginBottom: 16 },
  welcomeTitle: { ...typography.h3, textAlign: 'center', marginBottom: 10 },
  welcomeText: { ...typography.body, textAlign: 'center', lineHeight: 23 },
  suggestions: { marginTop: 24, gap: 10, width: '100%' },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: radius.lg, padding: 14, borderWidth: 1,
  },
  suggestionText: { fontSize: 14, fontWeight: '500', flex: 1 },

  paywallGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  paywallEmoji: { fontSize: 64, marginBottom: 16 },
  paywallTitle: { ...typography.h1, textAlign: 'center', marginBottom: 10 },
  paywallDesc: { ...typography.body, textAlign: 'center', marginBottom: 28, lineHeight: 23 },
  paywallFeatures: { gap: 14, width: '100%', marginBottom: 28 },
  paywallFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paywallFeatureText: { fontSize: 14 },
  paywallNote: { ...typography.small, textAlign: 'center', marginTop: 12 },
});
