import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LightColors, Typography, Spacing, BorderRadius, MinTapTarget } from '../design-system/tokens';

export function SecondaryButton({ label, onPress, disabled = false, loading = false, style, icon }) {
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
        <ActivityIndicator color={LightColors.brandPrimary} size="small" />
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
  button: { backgroundColor: 'transparent', minHeight: MinTapTarget, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: LightColors.brandPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: LightColors.brandPrimary + '12' },
  disabled: { opacity: 0.5 },
  label: { ...Typography.buttonLabel, color: LightColors.brandPrimary },
});
