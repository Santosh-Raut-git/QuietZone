import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { DarkColors, Typography, Spacing } from '../design-system/tokens';

const RING_SIZE = 160;
const STROKE_WIDTH = 6;

export function RecordingCountdownRing({ duration = 10, remainingSeconds, isRecording = false, style }) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    if (isRecording) {
      Animated.timing(progressAnim, { toValue: 1, duration: duration * 1000, useNativeDriver: false }).start();
    }
  }, [isRecording, duration, progressAnim]);

  return (
    <View style={[styles.container, style]} accessibilityLabel={`Recording${remainingSeconds !== undefined ? `, ${remainingSeconds} seconds remaining` : ''}`} accessibilityRole="progressbar">
      <View style={styles.ringBackground} />
      <View style={styles.innerCircle}>
        <Text style={styles.countdown}>{remainingSeconds !== undefined ? remainingSeconds : duration}</Text>
        <Text style={styles.label}>{isRecording ? 'Recording...' : 'Ready'}</Text>
      </View>
      {isRecording && <PulsingRing />}
    </View>
  );
}

function PulsingRing() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, opacityAnim]);

  return <Animated.View style={[styles.pulsingRing, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />;
}

const styles = StyleSheet.create({
  container: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringBackground: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: STROKE_WIDTH, borderColor: DarkColors.liveAccent + '33' },
  innerCircle: { width: RING_SIZE - STROKE_WIDTH * 4, height: RING_SIZE - STROKE_WIDTH * 4, borderRadius: (RING_SIZE - STROKE_WIDTH * 4) / 2, backgroundColor: DarkColors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  countdown: { ...Typography.display, color: DarkColors.liveAccent, fontSize: 48, lineHeight: 56 },
  label: { ...Typography.caption, color: DarkColors.textSecondary, marginTop: Spacing.xs },
  pulsingRing: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: STROKE_WIDTH, borderColor: DarkColors.liveAccent },
});
