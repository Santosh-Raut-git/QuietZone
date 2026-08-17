import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LightColors, Typography, Spacing, BorderRadius } from '../design-system/tokens';

export function FilterChip({ label, selected = false, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} filter${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: LightColors.border,
    backgroundColor: LightColors.surface,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: LightColors.brandPrimary,
    borderColor: LightColors.brandPrimary,
  },
  label: { ...Typography.bodySmall, color: LightColors.textSecondary },
  labelSelected: { color: '#FFFFFF', fontFamily: Typography.buttonLabel.fontFamily },
});
