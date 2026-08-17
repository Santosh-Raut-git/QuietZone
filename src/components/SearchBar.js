import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightColors, DarkColors, Typography, Spacing, BorderRadius, Shadows, MinTapTarget } from '../design-system/tokens';

export function SearchBar({ placeholder = 'Search quiet places...', value, onChangeText, onSubmit, onClear, dark = false, style }) {
  const [focused, setFocused] = useState(false);
  const colors = dark
    ? { bg: DarkColors.surfaceElevated, text: DarkColors.textPrimary, placeholder: DarkColors.textSecondary, border: DarkColors.border, icon: DarkColors.textSecondary }
    : { bg: LightColors.surface, text: LightColors.textPrimary, placeholder: LightColors.textSecondary, border: LightColors.border, icon: LightColors.textSecondary };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: focused ? (dark ? DarkColors.liveAccent : LightColors.brandPrimary) : colors.border }, dark ? Shadows.elevated : Shadows.card, style]}>
      <Ionicons name="search" size={20} color={focused ? (dark ? DarkColors.liveAccent : LightColors.brandPrimary) : colors.icon} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { color: colors.text }]}
        accessibilityLabel={placeholder}
        returnKeyType="search"
      />
      {Boolean(value?.length) && (
        <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.icon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', minHeight: MinTapTarget, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1 },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, ...Typography.body, paddingVertical: Spacing.sm },
});
