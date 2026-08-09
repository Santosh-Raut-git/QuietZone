/**
 * Scan Tab
 * Handles End-to-End flow: Capture Audio & GPS -> Gemini Analysis -> Confirm -> Upload to Supabase
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { decode } from 'base64-arraybuffer';
import { DarkColors, LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';
import { classifyAudio } from '../../src/lib/gemini';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const [step, setStep] = useState('idle'); // idle | recording | analyzing | confirmation | uploading
  const [countdown, setCountdown] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Stored data across the flow
  const recordingRef = useRef(null);
  const [audioUri, setAudioUri] = useState(null);
  const [base64AudioData, setBase64AudioData] = useState(null);
  const [location, setLocation] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Clean up recording if unmounted during recording
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    if (step !== 'idle' && step !== 'consent') return; // Prevent double-clicks

    if (!userId) {
      Alert.alert('Authentication Required', 'Please sign in from the Profile tab to scan and upload noise logs.');
      return;
    }

    try {
      const hasConsented = await AsyncStorage.getItem('quietzone_consent');
      if (hasConsented !== 'true') {
        setStep('consent');
        return;
      }
    } catch (err) {
      console.warn('Failed to read consent state', err);
    }

    try {
      setErrorMsg('');
      setStep('idle');
      
      // Request Permissions
      const audioPerm = await Audio.requestPermissionsAsync();
      const locPerm = await Location.requestForegroundPermissionsAsync();

      if (audioPerm.status !== 'granted' || locPerm.status !== 'granted') {
        throw new Error('Microphone and Location permissions are required to scan.');
      }

      // Configure Audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Prepare & Start Recording
      // Note: createAsync() automatically starts the recording.
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;

      // Update UI State
      setStep('recording');
      setCountdown(5);

      // Parallel: Fetch Location and Countdown
      const locPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Countdown loop
      for (let i = 5; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Stop Recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      recordingRef.current = null;

      // Wait for Location
      const loc = await locPromise;
      setLocation(loc);

      // Begin Analysis
      setStep('analyzing');
      
      // Determine mime type based on OS
      const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : (Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4');

      // Convert to base64 using fetch & FileReader (Cross-platform safe)
      const audioResponse = await fetch(uri);
      const audioBlob = await audioResponse.blob();
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const dataUrl = reader.result;
          resolve(dataUrl.split(',')[1]); // Extract base64 part
        };
        reader.readAsDataURL(audioBlob);
      });
      
      setBase64AudioData(base64Audio);
      const result = await classifyAudio(base64Audio, mimeType);
      setAnalysis(result);
      
      setStep('confirmation');

    } catch (err) {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      setErrorMsg(err.message || 'An error occurred during scanning.');
      setStep('idle');
    }
  };

  const cancelScan = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
    setStep('idle');
    setErrorMsg('');
    setAudioUri(null);
    setAnalysis(null);
  };

  const agreeToConsent = async () => {
    try {
      await AsyncStorage.setItem('quietzone_consent', 'true');
      startScan(); // Resume the scan flow
    } catch (err) {
      Alert.alert('Error', 'Could not save consent status.');
    }
  };

  const uploadAndConfirm = async () => {
    try {
      setStep('uploading');
      
      const scanId = Math.random().toString(36).substring(2, 15);
      const ext = Platform.OS === 'ios' ? 'm4a' : 'm4a'; // enforce m4a for consistency or use exact
      const filePath = `${userId}/${scanId}.${ext}`;

      // 1. Upload audio to storage using ArrayBuffer (Fixes "Network request failed" Blob bug on Native)
      const arrayBuffer = decode(base64AudioData);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(filePath, arrayBuffer, {
          contentType: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp4',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Insert into noise_logs
      const { error: dbError } = await supabase.from('noise_logs').insert({
        user_id: userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        source: analysis.source,
        disruption_score: analysis.disruption_score,
        description: analysis.description,
        audio_path: uploadData.path,
      });

      if (dbError) throw dbError;

      // Invalidate the cache so the map refreshes immediately
      queryClient.invalidateQueries({ queryKey: ['noise_logs'] });

      Alert.alert("Success", "Noise log added to the map!");
      setStep('idle');
    } catch (err) {
      Alert.alert("Upload Failed", err.message);
      setStep('confirmation'); // let them retry
    }
  };

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------

  const getBadgeColor = (score) => {
    if (score >= 7) return '#EF4444';
    if (score >= 4) return '#F59E0B';
    return '#22C55E';
  };

  const getBadgeLabel = (score) => {
    if (score >= 7) return 'Loud';
    if (score >= 4) return 'Moderate';
    return 'Quiet';
  };

  // Render Dark Theme Capture Screen
  if (step === 'idle' || step === 'recording' || step === 'analyzing' || step === 'consent') {
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
              
              <TouchableOpacity 
                style={[styles.primaryButtonDark, { marginTop: Spacing.xl }]} 
                onPress={agreeToConsent}
                accessibilityRole="button"
                accessibilityLabel="I Understand and Agree to the Privacy Policy"
              >
                <Text style={styles.primaryButtonTextDark}>I Understand & Agree</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelLink} 
                onPress={() => setStep('idle')}
                accessibilityRole="button"
                accessibilityLabel="Cancel and return"
              >
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'idle' && (
            <>
              <Ionicons name="mic-circle" size={120} color={DarkColors.liveAccent} />
              <Text style={styles.darkTitle}>Ready to Scan</Text>
              <Text style={styles.darkSubtitle}>Tap below to record a 5-second ambient noise sample.</Text>
              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
              
              <TouchableOpacity 
                style={styles.primaryButtonDark} 
                onPress={startScan}
                accessibilityRole="button"
                accessibilityLabel="Start a 5-second audio scan"
              >
                <Text style={styles.primaryButtonTextDark}>Start Scan</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'recording' && (
            <>
              <View style={styles.recordingRing}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
              <Text style={styles.darkTitle}>Listening...</Text>
              <TouchableOpacity 
                style={styles.cancelLink} 
                onPress={cancelScan}
                accessibilityRole="button"
                accessibilityLabel="Cancel recording"
              >
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
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

  // Render Light Theme Confirmation Screen
  return (
    <View style={[styles.lightContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={cancelScan}
          accessibilityRole="button"
          accessibilityLabel="Close confirmation and discard scan"
        >
          <Ionicons name="close" size={28} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.lightHeaderTitle}>Confirm Scan</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Source Category</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={analysis.source}
              onChangeText={(text) => setAnalysis({ ...analysis, source: text })}
              placeholder="e.g. Traffic, Chatter"
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.xl }]}>Disruption Level (1-10)</Text>
          <View style={styles.scoreRow}>
            <TouchableOpacity 
              style={styles.scoreBtn} 
              onPress={() => setAnalysis({ ...analysis, disruption_score: Math.max(1, analysis.disruption_score - 1) })}
            >
              <Ionicons name="remove" size={24} color={LightColors.textPrimary} />
            </TouchableOpacity>
            
            <View style={[styles.badge, { backgroundColor: getBadgeColor(analysis.disruption_score), flex: 1, justifyContent: 'center' }]}>
              <Text style={styles.badgeNumber}>{analysis.disruption_score}</Text>
              <Text style={styles.badgeText}>{getBadgeLabel(analysis.disruption_score)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.scoreBtn} 
              onPress={() => setAnalysis({ ...analysis, disruption_score: Math.min(10, analysis.disruption_score + 1) })}
            >
              <Ionicons name="add" size={24} color={LightColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: Spacing.xl }]}>AI Description</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { minHeight: 60 }]}
              multiline
              value={analysis.description}
              onChangeText={(text) => setAnalysis({ ...analysis, description: text })}
              placeholder="Describe the noise..."
            />
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || Spacing.md }]}>
        <TouchableOpacity 
          style={[styles.primaryButtonLight, step === 'uploading' && { opacity: 0.7 }]} 
          onPress={uploadAndConfirm}
          disabled={step === 'uploading'}
          accessibilityRole="button"
          accessibilityLabel="Confirm and add noise log to the public map"
        >
          {step === 'uploading' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonTextLight}>Confirm & Add to Map</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: DarkColors.mapBackground,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  darkTitle: {
    ...Typography.h1,
    color: DarkColors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  darkSubtitle: {
    ...Typography.body,
    color: DarkColors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  primaryButtonDark: {
    backgroundColor: DarkColors.liveAccent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  primaryButtonTextDark: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  recordingRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: DarkColors.liveAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  countdownText: {
    ...Typography.display,
    color: DarkColors.liveAccent,
  },
  cancelLink: {
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
  cancelLinkText: {
    ...Typography.button,
    color: DarkColors.textSecondary,
  },

  // Light Theme Confirmation
  lightContainer: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  lightHeaderTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: LightColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  label: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6', // light gray
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    ...Typography.bodySmall,
    color: LightColors.textPrimary,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  badgeNumber: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  badgeText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  textInput: {
    ...Typography.body,
    color: LightColors.textPrimary,
    minHeight: 40,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  scoreBtn: {
    backgroundColor: '#F3F4F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: LightColors.surface,
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
  },
  primaryButtonLight: {
    backgroundColor: LightColors.brandPrimary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryButtonTextLight: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
