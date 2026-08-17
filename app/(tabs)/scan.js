import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DarkColors, LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanner } from '../../src/hooks/useScanner';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const {
    step,
    countdown,
    errorMsg,
    analysis,
    setAnalysis,
    startScan,
    cancelScan,
    agreeToConsent,
    uploadAndConfirm
  } = useScanner(userId);

  const getBadgeColor = (score) => score >= 7 ? '#EF4444' : score >= 4 ? '#F59E0B' : '#22C55E';
  const getBadgeLabel = (score) => score >= 7 ? 'Loud' : score >= 4 ? 'Moderate' : 'Quiet';

  if (['idle', 'recording', 'analyzing', 'consent'].includes(step)) {
    return (
      <View style={[styles.darkContainer, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          {step === 'consent' && (
            <>
              <Ionicons name="shield-checkmark" size={64} color={DarkColors.liveAccent} />
              <Text style={styles.darkTitle}>Privacy First</Text>
              <Text style={[styles.darkSubtitle, { textAlign: 'left', marginTop: Spacing.xl }]}>
                • <Text style={{fontWeight: 'bold', color: 'white'}}>What is recorded:</Text> A 5-second ambient audio sample.{"\n\n"}
                • <Text style={{fontWeight: 'bold', color: 'white'}}>Who can hear it:</Text> Only YOU. The raw audio is private and securely locked to your account.{"\n\n"}
                • <Text style={{fontWeight: 'bold', color: 'white'}}>What is shared:</Text> Only the AI-generated disruption score and category are shown publicly on the map.
              </Text>
              <TouchableOpacity style={[styles.primaryButtonDark, { marginTop: Spacing.xl }]} onPress={agreeToConsent}>
                <Text style={styles.primaryButtonTextDark}>I Understand & Agree</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelLink} onPress={() => cancelScan()}><Text style={styles.cancelLinkText}>Cancel</Text></TouchableOpacity>
            </>
          )}

          {step === 'idle' && (
            <>
              <Ionicons name="mic-circle" size={120} color={DarkColors.liveAccent} />
              <Text style={styles.darkTitle}>Ready to Scan</Text>
              <Text style={styles.darkSubtitle}>Tap below to record a 5-second ambient noise sample.</Text>
              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
              <TouchableOpacity style={styles.primaryButtonDark} onPress={startScan}><Text style={styles.primaryButtonTextDark}>Start Scan</Text></TouchableOpacity>
            </>
          )}

          {step === 'recording' && (
            <>
              <View style={styles.recordingRing}><Text style={styles.countdownText}>{countdown}</Text></View>
              <Text style={styles.darkTitle}>Listening...</Text>
              <TouchableOpacity style={styles.cancelLink} onPress={cancelScan}><Text style={styles.cancelLinkText}>Cancel</Text></TouchableOpacity>
            </>
          )}

          {step === 'analyzing' && (
            <>
              <ActivityIndicator size="large" color={DarkColors.liveAccent} />
              <Text style={[styles.darkTitle, { marginTop: Spacing.md }]}>Analyzing Audio</Text>
              <Text style={styles.darkSubtitle}>Gemini AI is processing your scan...</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.lightContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelScan}><Ionicons name="close" size={28} color={LightColors.textPrimary} /></TouchableOpacity>
        <Text style={styles.lightHeaderTitle}>Confirm Scan</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Source Category</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.textInput} value={analysis?.source} onChangeText={(text) => setAnalysis({ ...analysis, source: text })} placeholder="e.g. Traffic, Chatter" />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.xl }]}>Disruption Level (1-10)</Text>
          <View style={styles.scoreRow}>
            <TouchableOpacity style={styles.scoreBtn} onPress={() => setAnalysis({ ...analysis, disruption_score: Math.max(1, analysis.disruption_score - 1) })}>
              <Ionicons name="remove" size={24} color={LightColors.textPrimary} />
            </TouchableOpacity>
            <View style={[styles.badge, { backgroundColor: getBadgeColor(analysis?.disruption_score), flex: 1, justifyContent: 'center' }]}>
              <Text style={styles.badgeNumber}>{analysis?.disruption_score}</Text>
              <Text style={styles.badgeText}>{getBadgeLabel(analysis?.disruption_score)}</Text>
            </View>
            <TouchableOpacity style={styles.scoreBtn} onPress={() => setAnalysis({ ...analysis, disruption_score: Math.min(10, analysis.disruption_score + 1) })}>
              <Ionicons name="add" size={24} color={LightColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: Spacing.xl }]}>AI Description</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.textInput, { minHeight: 60 }]} multiline value={analysis?.description} onChangeText={(text) => setAnalysis({ ...analysis, description: text })} placeholder="Describe the noise..." />
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || Spacing.md }]}>
        <TouchableOpacity style={[styles.primaryButtonLight, step === 'uploading' && { opacity: 0.7 }]} onPress={uploadAndConfirm} disabled={step === 'uploading'}>
          {step === 'uploading' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonTextLight}>Confirm & Add to Map</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  darkContainer: { flex: 1, backgroundColor: DarkColors.mapBackground },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  darkTitle: { ...Typography.h1, color: DarkColors.textPrimary, marginTop: Spacing.md, textAlign: 'center' },
  darkSubtitle: { ...Typography.body, color: DarkColors.textSecondary, marginTop: Spacing.sm, textAlign: 'center', marginBottom: Spacing.xl },
  errorText: { ...Typography.bodySmall, color: '#EF4444', textAlign: 'center', marginBottom: Spacing.lg },
  primaryButtonDark: { backgroundColor: DarkColors.liveAccent, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, ...Shadows.md },
  primaryButtonTextDark: { ...Typography.button, color: '#FFFFFF' },
  recordingRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: DarkColors.liveAccent, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  countdownText: { ...Typography.display, color: DarkColors.liveAccent },
  cancelLink: { marginTop: Spacing.xl, padding: Spacing.sm },
  cancelLinkText: { ...Typography.button, color: DarkColors.textSecondary },
  lightContainer: { flex: 1, backgroundColor: LightColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  lightHeaderTitle: { ...Typography.h2, color: LightColors.textPrimary },
  content: { flex: 1, padding: Spacing.lg },
  card: { backgroundColor: LightColors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, ...Shadows.sm, borderWidth: 1, borderColor: LightColors.border },
  label: { ...Typography.caption, color: LightColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  tag: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  tagText: { ...Typography.bodySmall, color: LightColors.textPrimary, fontWeight: 'bold' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, gap: Spacing.sm },
  badgeNumber: { ...Typography.h2, color: '#FFFFFF' },
  badgeText: { ...Typography.button, color: '#FFFFFF' },
  inputContainer: { backgroundColor: '#F3F4F6', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: LightColors.border },
  textInput: { ...Typography.body, color: LightColors.textPrimary, minHeight: 40 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  scoreBtn: { backgroundColor: '#F3F4F6', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LightColors.border },
  footer: { padding: Spacing.lg, backgroundColor: LightColors.surface, borderTopWidth: 1, borderTopColor: LightColors.border },
  primaryButtonLight: { backgroundColor: LightColors.brandPrimary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  primaryButtonTextLight: { ...Typography.button, color: '#FFFFFF' },
});

