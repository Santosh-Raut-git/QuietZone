/**
 * DisruptionScoreBadge — Color-coded badge with MANDATORY text label
 * 
 * Per spec: "always show the text label too, never color-only"
 * Quiet (1–3): #22C55E
 * Moderate (4–6): #F59E0B  
 * Loud (7–10): #EF4444
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Typography,
  Spacing,
  BorderRadius,
  getDisruptionLevel,
} from '../design-system/tokens';

export function DisruptionScoreBadge({ score, size = 'default', style }) {
  const { color, label } = getDisruptionLevel(score);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        { backgroundColor: color + '1A' }, // 10% opacity background
        style,
      ]}
      accessibilityLabel={`Disruption score ${score}, ${label}`}
      accessibilityRole="text"
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          isSmall ? styles.labelSmall : styles.label,
          { color },
        ]}
      >
        {score}
      </Text>
      <Text
        style={[
          isSmall ? styles.textSmall : styles.text,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.buttonLabel,
    marginRight: Spacing.xs,
  },
  labelSmall: {
    ...Typography.caption,
    fontFamily: Typography.buttonLabel.fontFamily,
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.bodySmall,
  },
  textSmall: {
    ...Typography.caption,
  },
});
