import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LightColors, Typography, Spacing, BorderRadius, MinTapTarget, Shadows } from '../design-system/tokens';

export function PrimaryButton({ label, onPress, disabled = false, loading = false, style, icon }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, icon && { marginLeft: Spacing.sm }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: LightColors.brandPrimary, minHeight: MinTapTarget, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...Shadows.card },
  pressed: { backgroundColor: LightColors.brandPrimaryPressed },
  disabled: { opacity: 0.5 },
  label: { ...Typography.buttonLabel, color: '#FFFFFF' },
});
