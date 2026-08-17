import React, { useRef, useEffect } from 'react';
import { View, Animated, PanResponder, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { LightColors, DarkColors, Spacing, BorderRadius, Shadows } from '../design-system/tokens';

export function BottomSheet({ visible = false, onClose, dark = false, snapPoints = [0.4, 0.7], children, style }) {
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const minHeight = screenHeight * snapPoints[0];
  const maxHeight = screenHeight * (snapPoints[1] || snapPoints[0]);

  useEffect(() => {
    Animated[visible ? 'spring' : 'timing'](translateY, {
      toValue: visible ? screenHeight - minHeight : screenHeight,
      useNativeDriver: true,
      ...(visible ? { tension: 65, friction: 11 } : { duration: 250 }),
    }).start();
  }, [visible, screenHeight, minHeight, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        const newY = screenHeight - minHeight + g.dy;
        if (newY >= screenHeight - maxHeight) translateY.setValue(newY);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          Animated.timing(translateY, { toValue: screenHeight, duration: 250, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: screenHeight - (g.dy < -50 ? maxHeight : minHeight),
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const colors = dark ? { bg: DarkColors.surfaceElevated, handle: DarkColors.border } : { bg: LightColors.surface, handle: LightColors.border };
  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close sheet" />
      <Animated.View style={[styles.sheet, { backgroundColor: colors.bg, height: maxHeight, transform: [{ translateY }] }, Shadows.elevated, style]}>
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />
        </View>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg },
  handleContainer: { alignItems: 'center', paddingVertical: Spacing.md },
  handle: { width: 36, height: 4, borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: Spacing.base },
});
