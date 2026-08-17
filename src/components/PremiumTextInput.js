import React, { useState, useRef } from 'react';
import { TextInput, Animated, StyleSheet, View } from 'react-native';
import { LightColors, Typography, BorderRadius, Spacing } from '../design-system/tokens';

export function PremiumTextInput({ style, containerStyle, onFocus, onBlur, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [LightColors.border, LightColors.brandPrimary] });
  const backgroundColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [LightColors.background, '#F0F4F8'] });
  const scale = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] });

  return (
    <Animated.View style={[styles.container, containerStyle, { transform: [{ scale }] }]}>
      <Animated.View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
        <TextInput {...props} style={[styles.input, style]} onFocus={handleFocus} onBlur={handleBlur} placeholderTextColor={LightColors.textSecondary} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  inputContainer: { borderWidth: 1.5, borderRadius: BorderRadius.base, overflow: 'hidden' },
  input: { ...Typography.body, color: LightColors.textPrimary, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm + 4 },
});
