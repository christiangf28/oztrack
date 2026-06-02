import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeContext';

export default function PrivacyScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>Política de Privacidad</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updated, { color: colors.text.muted }]}>Última actualización: mayo 2026</Text>
        <Section title="Qué recopilamos" colors={colors}>
          Oztrack recopila tu correo electrónico y datos de salud autoinformados: puntuaciones de síntomas, peso (opcional), ingesta de agua y notas de comidas. NO recopilamos datos clínicos como dosis de medicación, resultados de laboratorio o recetas.
        </Section>
        <Section title="Cómo usamos tus datos" colors={colors}>
          Tus datos se usan exclusivamente para proveer el servicio de Oztrack, incluyendo el análisis de tendencias de síntomas y el coaching de IA. No vendemos tus datos a terceros.
        </Section>
        <Section title="Coach IA" colors={colors}>
          Los mensajes enviados al Coach de IA son procesados por la API Claude de Anthropic. Los mensajes se guardan en nuestra base de datos para mantener el historial de conversación. No usamos tus mensajes para entrenar modelos de IA.
        </Section>
        <Section title="Retención de datos" colors={colors}>
          Puedes eliminar tu cuenta y todos los datos asociados en cualquier momento desde la sección Perfil → "Eliminar mi cuenta y datos". Los datos se eliminan de forma permanente e inmediata. También puedes contactarnos en privacy@oztrack.app.
        </Section>
        <Section title="Contacto" colors={colors}>
          Para consultas de privacidad, contacta: privacy@oztrack.app
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
