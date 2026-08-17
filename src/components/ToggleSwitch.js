import React, { useRef, useEffect } from 'react';
import { Pressable, Animated, StyleSheet, View, Text } from 'react-native';
import { LightColors, DarkColors, Typography, Spacing, MinTapTarget } from '../design-system/tokens';

const TRACK_WIDTH = 48, TRACK_HEIGHT = 28, THUMB_SIZE = 22, THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4;

export function ToggleSwitch({ value = false, onValueChange, label, dark = false, disabled = false, style }) {
  const translateX = useRef(new Animated.Value(value ? THUMB_TRAVEL : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, { toValue: value ? THUMB_TRAVEL : 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }, [value, translateX]);

  const activeColor = dark ? DarkColors.liveAccent : LightColors.brandPrimary;
  const inactiveColor = dark ? DarkColors.border : LightColors.border;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange?.(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      style={[styles.container, style]}
      disabled={disabled}
    >
      {label && <Text style={[styles.label, { color: dark ? DarkColors.textPrimary : LightColors.textPrimary }]}>{label}</Text>}
      <View style={[styles.track, { backgroundColor: value ? activeColor : inactiveColor }, disabled && styles.disabled]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MinTapTarget },
  label: { ...Typography.body, marginRight: Spacing.md, flex: 1 },
  track: { width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, justifyContent: 'center', paddingHorizontal: 2 },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  disabled: { opacity: 0.5 },
});
