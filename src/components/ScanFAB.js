/**
 * ScanFAB — Floating Action Button for triggering area scans
 * 
 * Circular, Live Accent background (#00D26A), centered at the bottom on the Home screen.
 * Includes a subtle pulse animation to draw attention.
 */
import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkColors, Shadows, Spacing } from '../design-system/tokens';

const FAB_SIZE = 64;
const PULSE_SIZE = 80;

export function ScanFAB({ onPress, style }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={[styles.container, style]}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      {/* FAB */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Scan Area"
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <Ionicons name="mic" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
  },
  pulseRing: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    backgroundColor: DarkColors.liveAccent,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: DarkColors.liveAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  fabPressed: {
    backgroundColor: '#00B85C',
    transform: [{ scale: 0.95 }],
  },
});
