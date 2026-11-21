import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isReportKind, reportLabels, useReports, type ReportKind } from '@/components/report-context';

const green = '#176b55';
const ink = '#172522';

export function generateMetadata(): Metadata {
  return {
    title: 'Λήψη φωτογραφίας | Ensinesthisi.cy',
    description: 'Τοπική δοκιμαστική λήψη. Δεν γίνεται υποβολή σε δημόσια αρχή.',
  };
}

export default function CaptureScreen() {
  const { kind: rawKind } = useLocalSearchParams<{ kind?: string }>();
  const kind: ReportKind = isReportKind(rawKind) ? rawKind : 'sidewalk';
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const { addReceipt } = useReports();
  const [cameraReady, setCameraReady] = useState(false);
  const [working, setWorking] = useState(false);
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');

  async function capture() {
    if (!cameraReady || working) return;
    setWorking(true);
    setError('');
    let file: File | undefined;
    try {
      const picture = await camera.current?.takePictureAsync({ quality: 0.8, base64: Platform.OS === 'web' });
      if (!picture) throw new Error('Δεν έγινε λήψη φωτογραφίας. Δοκίμασε ξανά.');
      let digest: string;
      if (Platform.OS === 'web') {
        if (!picture.base64) throw new Error('Δεν ήταν διαθέσιμη η φωτογραφία για υπολογισμό.');
        const bytes = Uint8Array.from(atob(picture.base64), (character) => character.charCodeAt(0));
        const result = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
        digest = Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, '0')).join('');
      } else {
        file = new File(picture.uri);
        digest = await file.digest('SHA-256');
        if (file.exists) file.delete();
        if (file.exists) throw new Error('Δεν ήταν δυνατή η διαγραφή της προσωρινής φωτογραφίας. Δεν δημιουργήθηκε απόδειξη.');
        file = undefined;
      }
      const createdAt = new Date().toISOString();
      addReceipt({ id: Crypto.randomUUID(), kind, hash: digest, createdAt });
      setHash(digest);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Κάτι δεν πήγε καλά. Δοκίμασε ξανά.');
    } finally {
      try {
        if (file?.exists) file.delete();
      } catch {
        setError('Δεν ήταν δυνατή η διαγραφή της προσωρινής φωτογραφίας. Έλεγξε ξανά τα αρχεία της συσκευής.');
      }
      setWorking(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.backButton}><Text style={styles.backText}>‹  Πίσω</Text></Pressable>
        <Text style={styles.headerTitle}>Νέα δοκιμή</Text>
        <View style={styles.headerSpacer} />
      </View>

      {hash ? (
        <View style={styles.result}>
          <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
          <Text style={styles.eyebrow}>ΤΟΠΙΚΗ ΑΠΟΔΕΙΞΗ</Text>
          <Text style={styles.resultTitle}>Έτοιμο.</Text>
          <Text style={styles.resultBody}>Υπολογίστηκε το ψηφιακό αποτύπωμα και διαγράφηκε το προσωρινό αρχείο φωτογραφίας.</Text>
          <View style={styles.hashCard}><Text style={styles.hashLabel}>SHA-256</Text><Text selectable style={styles.hashValue}>{hash}</Text></View>
          <Text style={styles.localOnly}>Δεν στάλθηκε σε αρχή. Το αποτύπωμα δεν πιστοποιεί τι δείχνει η εικόνα ή πότε τραβήχτηκε.</Text>
          <Pressable onPress={() => router.push('/explore')} style={styles.button} accessibilityRole="button"><Text style={styles.buttonText}>Οι αποδείξεις μου</Text></Pressable>
          <Pressable onPress={() => router.replace('/')} style={styles.secondaryButton} accessibilityRole="button"><Text style={styles.secondaryButtonText}>Νέα δοκιμή</Text></Pressable>
        </View>
      ) : !permission ? (
        <View style={styles.permissionState}><Text style={styles.bodyText}>Έλεγχος πρόσβασης στην κάμερα…</Text></View>
      ) : !permission.granted ? (
        <View style={styles.permissionState}>
          <Text style={styles.eyebrow}>ΠΡΟΣΒΑΣΗ ΣΤΗΝ ΚΑΜΕΡΑ</Text>
          <Text style={styles.resultTitle}>Άνοιξε την κάμερα</Text>
          <Text style={styles.bodyText}>Η φωτογραφία θα χρησιμοποιηθεί μόνο για τον υπολογισμό SHA-256 και μετά θα διαγραφεί. Δεν ανεβαίνει στο διαδίκτυο ούτε υποβάλλεται σε αρχή.</Text>
          <Pressable onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{permission.canAskAgain ? 'Ενεργοποίηση κάμερας' : 'Ρυθμίσεις κάμερας'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.cameraStage}>
          <Text style={styles.kindLabel}>{reportLabels[kind]}</Text>
          <View style={styles.cameraFrame}>
            <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setCameraReady(true)} />
            <View pointerEvents="none" style={styles.frameCorners}><View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} /><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} /></View>
            {!cameraReady && <View style={styles.loading}><Text style={styles.loadingText}>Άνοιγμα κάμερας…</Text></View>}
          </View>
          <Text style={styles.cameraHint}>{cameraHints[kind]}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable onPress={capture} disabled={!cameraReady || working} style={[styles.button, (!cameraReady || working) && styles.buttonDisabled]} accessibilityRole="button">
            {working ? <ActivityIndicator size="small" color="#fff" /> : <View style={styles.shutter} />}
            <Text style={styles.buttonText}>{working ? 'Υπολογισμός αποτυπώματος…' : 'Λήψη και υπολογισμός'}</Text>
          </Pressable>
          <Text style={styles.disclaimer}>Η εικόνα δεν ανεβαίνει στο διαδίκτυο και δεν γίνεται υποβολή.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const cameraHints: Record<ReportKind, string> = {
  sidewalk: 'Δείξε το όχημα και το πεζοδρόμιο που εμποδίζει. Απόφυγε πρόσωπα και προσωπικά έγγραφα.',
  accessible: 'Δείξε το όχημα και τη σήμανση της θέσης ΑμεΑ. Απόφυγε πρόσωπα και προσωπικά έγγραφα.',
  crosswalk: 'Δείξε το όχημα και τις γραμμές της διάβασης που καλύπτει. Απόφυγε πρόσωπα και προσωπικά έγγραφα.',
  cycleLane: 'Δείξε το όχημα και το τμήμα του ποδηλατοδρόμου που κλείνει. Απόφυγε πρόσωπα και έγγραφα.',
  ramp: 'Δείξε το όχημα και τη ράμπα ή την όδευση που μπλοκάρει. Απόφυγε πρόσωπα και έγγραφα.',
  doublePark: 'Δείξε το όχημα και τη λωρίδα που κλείνει. Απόφυγε πρόσωπα και προσωπικά έγγραφα.',
  busStop: 'Δείξε το όχημα και το σημείο επιβίβασης στη στάση. Απόφυγε πρόσωπα και προσωπικά έγγραφα.',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5ef' },
  header: { height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minWidth: 76, paddingVertical: 10 },
  backText: { color: green, fontSize: 15, fontWeight: '700' },
  headerTitle: { color: ink, fontSize: 15, fontWeight: '700' },
  headerSpacer: { minWidth: 76 },
  cameraStage: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  kindLabel: { color: ink, fontSize: 19, fontWeight: '700', paddingTop: 8, paddingBottom: 14 },
  cameraFrame: { flex: 1, minHeight: 190, overflow: 'hidden', borderRadius: 22, backgroundColor: '#18211e' },
  frameCorners: { ...StyleSheet.absoluteFill, margin: 20 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fff', opacity: 0.9 },
  topLeft: { top: 0, left: 0, borderLeftWidth: 2, borderTopWidth: 2, borderTopLeftRadius: 7 },
  topRight: { top: 0, right: 0, borderRightWidth: 2, borderTopWidth: 2, borderTopRightRadius: 7 },
  bottomLeft: { bottom: 0, left: 0, borderLeftWidth: 2, borderBottomWidth: 2, borderBottomLeftRadius: 7 },
  bottomRight: { bottom: 0, right: 0, borderRightWidth: 2, borderBottomWidth: 2, borderBottomRightRadius: 7 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#18211e' },
  loadingText: { color: '#fff', fontSize: 14 },
  cameraHint: { color: '#66736e', fontSize: 12, lineHeight: 18, paddingVertical: 13 },
  button: { minHeight: 56, borderRadius: 16, backgroundColor: green, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 11, paddingHorizontal: 18 },
  secondaryButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 18 },
  secondaryButtonText: { color: green, fontSize: 14, fontWeight: '700' },
  buttonDisabled: { backgroundColor: '#9eaca4' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  shutter: { width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: '#fff' },
  disclaimer: { textAlign: 'center', color: '#66736e', fontSize: 11, paddingTop: 11 },
  permissionState: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center', gap: 15 },
  eyebrow: { color: green, fontSize: 11, letterSpacing: 1.7, fontWeight: '800' },
  resultTitle: { color: ink, fontSize: 32, lineHeight: 38, textAlign: 'center', fontWeight: '700' },
  bodyText: { color: '#66736e', maxWidth: 340, textAlign: 'center', fontSize: 15, lineHeight: 23 },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 16, gap: 13 },
  successIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#dcece3', alignItems: 'center', justifyContent: 'center' },
  successCheck: { color: green, fontSize: 26, fontWeight: '700' },
  resultBody: { color: '#66736e', fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 350 },
  hashCard: { width: '100%', marginTop: 4, padding: 15, borderRadius: 14, backgroundColor: '#e8eee7', gap: 8 },
  hashLabel: { color: green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  hashValue: { color: ink, fontSize: 12, lineHeight: 19, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
  localOnly: { color: '#66736e', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 350, marginBottom: 8 },
  error: { color: '#a53b34', fontSize: 13, paddingBottom: 8 },
});
