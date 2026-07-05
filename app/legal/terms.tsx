import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeContext';

export default function TermsScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>Términos de Servicio</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updated, { color: colors.text.muted }]}>Última actualización: mayo 2026</Text>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>⚠️ Milli es una herramienta informativa. No proporciona consejo médico, diagnóstico ni tratamiento. Consulta siempre a un profesional de salud cualificado.</Text>
        </View>
        <Section title="1. Aceptación" colors={colors}>Al usar Milli aceptas estos términos. Si no estás de acuerdo, no uses la app.</Section>
        <Section title="2. No es consejo médico" colors={colors}>Milli y su Coach IA proporcionan información educativa únicamente. Nada en la app constituye consejo médico. Nunca ignores el consejo médico profesional basándote en información de esta app.</Section>
        <Section title="3. Suscripciones" colors={colors}>Las funciones Premium están disponibles con suscripción mensual ($9.99) o anual ($59.99) con 7 días de prueba gratuita. Las suscripciones se renuevan automáticamente y pueden cancelarse en cualquier momento.</Section>
        <Section title="4. Uso aceptable" colors={colors}>Aceptas no usar Milli para ningún fin ilegal ni intentar revertir la ingeniería o abusar del servicio.</Section>
        <Section title="5. Contacto" colors={colors}>support@getmilli.app</Section>
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
  updated: { fontSize: 12, marginBottom: 16 },
  disclaimer: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FCD34D' },
  disclaimerText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
});
