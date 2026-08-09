/**
 * VerifiedBadge — Gold badge for Verified Workspaces
 * 
 * Distinct shape (shield icon) from disruption score badges.
 * Gold color #D4AF37.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DisruptionColors,
  Typography,
  Spacing,
  BorderRadius,
} from '../design-system/tokens';

export function VerifiedBadge({ size = 'default', style }) {
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        style,
      ]}
      accessibilityLabel="Verified Workspace"
      accessibilityRole="text"
    >
      <Ionicons
        name="shield-checkmark"
        size={isSmall ? 14 : 18}
        color={DisruptionColors.verified}
      />
      <Text
        style={[
          isSmall ? styles.labelSmall : styles.label,
        ]}
      >
        Verified
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
    backgroundColor: DisruptionColors.verified + '1A', // 10% opacity
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    ...Typography.buttonLabel,
    color: DisruptionColors.verified,
    marginLeft: Spacing.xs,
  },
  labelSmall: {
    ...Typography.caption,
    fontFamily: Typography.buttonLabel.fontFamily,
    color: DisruptionColors.verified,
    marginLeft: Spacing.xs,
  },
});
