import { router } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reportLabels, useReports } from '@/components/report-context';

export function generateMetadata(): Metadata {
  return {
    title: 'Τοπικές αποδείξεις | Ensinesthisi.cy',
    description: 'Δες τα προσωρινά ψηφιακά αποτυπώματα που δημιούργησες σε αυτή τη συσκευή.',
  };
}

export default function ReportsScreen() {
  const { receipts } = useReports();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.brandRow}><Image source={require('@/assets/images/icon.png')} style={styles.brandMark} accessible={false} /><Text style={styles.brand}>ENSINESTHISI.CY</Text></View>
        <Text style={styles.title}>Οι αποδείξεις</Text>
        <Text style={styles.intro}>Αποθηκεύονται προσωρινά στη μνήμη της εφαρμογής. Δεν έχουν κατατεθεί και θα χαθούν όταν κλείσεις την εφαρμογή.</Text>
        {receipts.length ? (
          <View style={styles.list}>
            {receipts.map((receipt, index) => (
              <View key={receipt.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.number}>ΔΟΚΙΜΗ {String(receipts.length - index).padStart(2, '0')}</Text>
                  <Text style={styles.local}>ΤΟΠΙΚΗ</Text>
                </View>
                <Text style={styles.kind}>{reportLabels[receipt.kind]}</Text>
                <Text style={styles.date}>{new Date(receipt.createdAt).toLocaleString('el-CY')}</Text>
                <View style={styles.hashBox}>
                  <Text style={styles.hashLabel}>SHA-256 · ώρα κινητού, μη πιστοποιημένη</Text>
                  <Text selectable style={styles.hash}>{receipt.hash}</Text>
                </View>
                <Text style={styles.notSubmitted}>Δεν υποβλήθηκε σε δημόσια αρχή.</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>◎</Text></View>
            <Text style={styles.emptyTitle}>Δεν υπάρχει απόδειξη ακόμη</Text>
            <Text style={styles.emptyCopy}>Κάνε μια τοπική δοκιμή με την κάμερα. Η φωτογραφία διαγράφεται μετά τον υπολογισμό του hash.</Text>
            <Pressable onPress={() => router.replace('/')} style={styles.emptyButton} accessibilityRole="button">
              <Text style={styles.emptyButtonText}>Νέα δοκιμή  →</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.note}><Text style={styles.noteText}>Το hash βοηθά να φανεί αν άλλαξε ένα αρχείο. Από μόνο του δεν αποδεικνύει τι δείχνει η εικόνα ή πότε τραβήχτηκε.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5ef' },
  page: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  brandMark: { width: 30, height: 30, borderRadius: 8 },
  brand: { color: '#176b55', fontWeight: '800', fontSize: 11, letterSpacing: 1.4 },
  title: { color: '#172522', fontSize: 34, fontWeight: '700', letterSpacing: -0.7 },
  intro: { color: '#66736e', fontSize: 14, lineHeight: 21, marginTop: 9, marginBottom: 23 },
  list: { gap: 13 },
  card: { padding: 17, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e6df' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { color: '#66736e', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  local: { color: '#176b55', fontSize: 9, fontWeight: '800', letterSpacing: 1, backgroundColor: '#e4f0e8', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
  kind: { color: '#172522', fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 12 },
  date: { color: '#66736e', fontSize: 12, marginTop: 5 },
  hashBox: { backgroundColor: '#f2f4ef', marginTop: 14, borderRadius: 11, padding: 12, gap: 7 },
  hashLabel: { color: '#176b55', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  hash: { color: '#172522', fontSize: 11, lineHeight: 17, fontFamily: 'monospace' },
  notSubmitted: { color: '#66736e', fontSize: 11, marginTop: 11 },
  empty: { alignItems: 'center', paddingHorizontal: 22, paddingTop: 52, paddingBottom: 46, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e6df' },
  emptyIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#e4f0e8', alignItems: 'center', justifyContent: 'center' },
  emptyIconText: { color: '#176b55', fontSize: 24 },
  emptyTitle: { color: '#172522', fontSize: 17, fontWeight: '700', marginTop: 15 },
  emptyCopy: { color: '#66736e', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  emptyButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#176b55', marginTop: 16 },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  note: { padding: 15, backgroundColor: '#e8eee7', borderRadius: 14, marginTop: 17 },
  noteText: { color: '#52615a', fontSize: 12, lineHeight: 18 },
});
