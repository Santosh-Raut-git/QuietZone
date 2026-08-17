import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DisruptionColors, Typography, getDisruptionLevel } from '../design-system/tokens';

const PIN_SIZE = 36;
const PIN_SIZE_SMALL = 28;
const IS_ANDROID = Platform.OS === 'android';

export function MapPin({ score, verified = false, size = 'default', isPredictive = false, style }) {
  const isSmall = size === 'small';
  const pinSize = isSmall ? PIN_SIZE_SMALL : PIN_SIZE;

  if (verified) {
    if (IS_ANDROID) {
      return (
        <View collapsable={false} style={[styles.container, style]} accessibilityLabel="Verified Workspace">
          <View style={{ width: pinSize, height: pinSize, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="ellipse" size={pinSize} color={DisruptionColors.verified} style={{ position: 'absolute' }} />
            <Ionicons name="shield-checkmark" size={isSmall ? 14 : 18} color="#FFFFFF" style={{ position: 'absolute' }} />
          </View>
        </View>
      );
    }
    
    return (
      <View collapsable={false} style={[styles.container, style]} accessibilityLabel="Verified Workspace">
        <View style={[styles.verifiedPinOuter, { width: pinSize + 4, height: pinSize + 4, borderRadius: (pinSize + 4) / 2 }]}>
          <View style={[styles.verifiedPinInner, { width: pinSize, height: pinSize, borderRadius: pinSize / 2 }]}>
            <Ionicons name="shield-checkmark" size={isSmall ? 14 : 18} color="#FFFFFF" />
          </View>
        </View>
        <View style={[styles.tail, { borderTopColor: '#FFFFFF' }]} />
      </View>
    );
  }

  const { color, label } = getDisruptionLevel(score);

  if (IS_ANDROID) {
    return (
      <View collapsable={false} style={[styles.container, isPredictive && { opacity: 0.75 }, style]} accessibilityLabel={`Noise level: ${label}, score ${score}`}>
        <View style={{ width: pinSize, height: pinSize, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="ellipse" size={pinSize} color={color} style={{ position: 'absolute' }} />
          <Text style={[styles.score, isSmall && styles.scoreSmall, { position: 'absolute' }]}>{score}</Text>
        </View>
      </View>
    );
  }

  return (
    <View collapsable={false} style={[styles.container, isPredictive && { opacity: 0.75 }, style]} accessibilityLabel={`Noise level: ${label}, score ${score}`}>
      <View style={[styles.regularPinOuter, { width: pinSize + 4, height: pinSize + 4, borderRadius: (pinSize + 4) / 2 }]}>
        <View style={{ width: pinSize, height: pinSize, borderRadius: pinSize / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Text style={[styles.score, isSmall && styles.scoreSmall]}>{score}</Text>
        </View>
      </View>
      <View style={[styles.tail, { borderTopColor: '#FFFFFF' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  regularPinOuter: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: IS_ANDROID ? 'transparent' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: IS_ANDROID ? 0 : 0.2, shadowRadius: IS_ANDROID ? 0 : 4, elevation: IS_ANDROID ? 0 : 4, overflow: 'hidden' },
  score: { ...Typography.caption, fontFamily: Typography.buttonLabel.fontFamily, color: '#FFFFFF', fontSize: 13 },
  scoreSmall: { fontSize: 10 },
  tail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  verifiedPinOuter: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: IS_ANDROID ? 'transparent' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: IS_ANDROID ? 0 : 0.2, shadowRadius: IS_ANDROID ? 0 : 4, elevation: IS_ANDROID ? 0 : 4, overflow: 'hidden' },
  verifiedPinInner: { backgroundColor: DisruptionColors.verified, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
