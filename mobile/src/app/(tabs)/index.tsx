import { router } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReports, type ReportKind } from '@/components/report-context';

const ink = '#172522';
const muted = '#66736e';
const green = '#176b55';
const paper = '#f4f5ef';

export function generateMetadata(): Metadata {
  return {
    title: 'Ensinesthisi.cy | Τοπική δοκιμή',
    description: 'Δοκίμασε τοπικά μια ροή καταγραφής εμποδίων στην προσβασιμότητα. Δεν γίνεται υποβολή σε αρχή.',
  };
}

const choices: { kind: ReportKind; title: string; detail: string }[] = [
  { kind: 'sidewalk', title: 'Πεζοδρόμιο', detail: 'Εμποδίζεται η διέλευση πεζών' },
  { kind: 'accessible', title: 'Θέση ΑμεΑ', detail: 'Κατειλημμένη ειδική θέση' },
  { kind: 'crosswalk', title: 'Διάβαση πεζών', detail: 'Καλύπτονται οι γραμμές της διάβασης' },
  { kind: 'ramp', title: 'Ράμπα ή όδευση τυφλών', detail: 'Μπλοκάρεται προσβάσιμη διαδρομή' },
  { kind: 'cycleLane', title: 'Ποδηλατόδρομος', detail: 'Κλείνει η διαδρομή ποδηλάτων' },
  { kind: 'doublePark', title: 'Διπλοστάθμευση', detail: 'Κλείνει λωρίδα κυκλοφορίας' },
  { kind: 'busStop', title: 'Στάση λεωφορείου', detail: 'Μπλοκάρεται το σημείο επιβίβασης' },
];

export default function HomeScreen() {
  const [kind, setKind] = useState<ReportKind | null>(null);
  const [showMore, setShowMore] = useState(false);
  const { receipts } = useReports();
  const primaryChoices = choices.slice(0, 2);
  const moreChoices = choices.slice(2);

  function renderChoice(choice: (typeof choices)[number], last = false) {
    const selected = kind === choice.kind;
    return (
      <Pressable
        key={choice.kind}
        onPress={() => setKind(choice.kind)}
        style={({ pressed }) => [styles.choiceRow, selected && styles.choiceSelected, pressed && styles.choicePressed, last && styles.choiceLast]}
        accessibilityRole="radio"
        accessibilityState={{ selected }}>
        <View style={[styles.choiceMark, selected && styles.choiceMarkSelected]} />
        <View style={styles.choiceCopy}>
          <Text style={styles.choiceTitle}>{choice.title}</Text>
          <Text style={styles.choiceDetail}>{choice.detail}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/icon.png')} style={styles.brandMark} accessible={false} />
            <Text style={styles.brand}>ENSINESTHISI.CY</Text>
            <Pressable onPress={() => router.push('/explore')} style={styles.historyButton} accessibilityRole="button" accessibilityLabel={`Οι αποδείξεις${receipts.length ? `, ${receipts.length}` : ''}`}>
              <Text style={styles.historyButtonText}>Αποδείξεις{receipts.length ? ` · ${receipts.length}` : ''}</Text>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Τι εμποδίζει τη διέλευση;</Text>
            <Text style={styles.intro}>Διάλεξε τι θέλεις να δοκιμάσεις. Δεν γίνεται υποβολή σε αρχή.</Text>
          </View>

          <View style={styles.group}>
            <Text style={styles.groupTitle}>Συχνές περιπτώσεις</Text>
            <View style={styles.choiceList}>{primaryChoices.map((choice, index) => renderChoice(choice, index === primaryChoices.length - 1))}</View>
          </View>

          <View style={styles.group}>
            <Pressable
              onPress={() => setShowMore((visible) => !visible)}
              style={styles.moreButton}
              accessibilityRole="button"
              accessibilityState={{ expanded: showMore }}>
              <Text style={styles.moreTitle}>{showMore ? 'Λιγότερες περιπτώσεις' : `Άλλες περιπτώσεις (${moreChoices.length})`}</Text>
              <Text style={styles.moreArrow}>{showMore ? '−' : '+'}</Text>
            </Pressable>
            {showMore && <View style={styles.choiceList}>{moreChoices.map((choice, index) => renderChoice(choice, index === moreChoices.length - 1))}</View>}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>Η φωτογραφία διαγράφεται μετά τον υπολογισμό. Το αποτύπωμα δεν πιστοποιεί τι δείχνει ή πότε τραβήχτηκε.</Text>
          <Pressable
            onPress={() => kind && router.push({ pathname: '/capture', params: { kind } })}
            disabled={!kind}
            style={({ pressed }) => [styles.primaryButton, !kind && styles.buttonDisabled, pressed && kind && styles.buttonPressed]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !kind }}>
            <Text style={styles.primaryButtonText}>{kind ? 'Άνοιγμα κάμερας' : 'Επίλεξε πρώτα περίπτωση'}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
          <Text style={styles.disclaimer}>Η κάμερα θα ζητήσει άδεια από τη συσκευή σου</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: paper },
  screen: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
  scroll: { flex: 1 },
  page: { paddingHorizontal: 22, paddingBottom: 18 },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 32, height: 32, borderRadius: 9 },
  brand: { flex: 1, color: ink, fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  historyButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 22, backgroundColor: '#e8ebe4' },
  historyButtonText: { color: ink, fontSize: 12, fontWeight: '700' },
  hero: { paddingTop: 18, paddingBottom: 19 },
  title: { color: ink, fontSize: 29, lineHeight: 35, fontWeight: '700', letterSpacing: -0.6 },
  intro: { color: muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  group: { marginBottom: 19 },
  groupTitle: { color: ink, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  choiceList: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#dfe3dc', overflow: 'hidden' },
  choiceRow: { minHeight: 76, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#edf0ea' },
  choiceLast: { borderBottomWidth: 0 },
  choiceSelected: { backgroundColor: '#f2f8f4' },
  choicePressed: { opacity: 0.82 },
  choiceMark: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c8d7c9' },
  choiceMarkSelected: { backgroundColor: green },
  choiceCopy: { flex: 1, gap: 3 },
  choiceTitle: { color: ink, fontSize: 14, fontWeight: '700' },
  choiceDetail: { color: muted, fontSize: 12, lineHeight: 17 },
  radio: { width: 22, height: 22, borderWidth: 1.5, borderColor: '#aeb9b1', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: green },
  radioDot: { height: 11, width: 11, backgroundColor: green, borderRadius: 6 },
  moreButton: { minHeight: 52, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#dfe3dc' },
  moreTitle: { color: green, fontSize: 14, fontWeight: '700' },
  moreArrow: { color: green, fontSize: 23 },
  footer: { paddingTop: 10, paddingHorizontal: 22, paddingBottom: 7, backgroundColor: paper, borderTopWidth: 1, borderTopColor: '#dfe3dc' },
  footerNote: { color: muted, fontSize: 12, lineHeight: 17, textAlign: 'left', marginBottom: 10 },
  primaryButton: { minHeight: 56, borderRadius: 16, paddingHorizontal: 18, backgroundColor: green, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttonDisabled: { backgroundColor: '#aebbb3' },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buttonArrow: { color: '#fff', fontSize: 22 },
  disclaimer: { textAlign: 'center', color: muted, fontSize: 10, marginTop: 7 },
});
