import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../design-system/tokens';

export function ListItemCard({ title, subtitle, meta, onPress, rightContent, leftContent, style }) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      style={({ pressed } = {}) => [styles.card, pressed && styles.pressed, style]}
    >
      {leftContent && <View style={styles.leftSlot}>{leftContent}</View>}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
        {meta && <Text style={styles.meta} numberOfLines={1}>{meta}</Text>}
      </View>
      {rightContent && <View style={styles.rightSlot}>{rightContent}</View>}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: LightColors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: LightColors.border, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, ...Shadows.card },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  leftSlot: { marginRight: Spacing.md },
  content: { flex: 1 },
  rightSlot: { marginLeft: Spacing.md },
  title: { ...Typography.body, fontFamily: Typography.h2.fontFamily, color: LightColors.textPrimary },
  subtitle: { ...Typography.bodySmall, color: LightColors.textSecondary, marginTop: Spacing.xs },
  meta: { ...Typography.caption, color: LightColors.textSecondary, marginTop: Spacing.xs },
});
