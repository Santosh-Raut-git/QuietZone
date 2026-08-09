/**
 * BottomSheet — Draggable sheet from the bottom
 * 
 * Uses Surface Elevated bg on dark theme, Surface on light theme.
 * Simplified implementation using Animated API.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {
  LightColors,
  DarkColors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../design-system/tokens';

export function BottomSheet({
  visible = false,
  onClose,
  dark = false,
  snapPoints = [0.4, 0.7], // Fraction of screen height
  children,
  style,
}) {
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  const minHeight = screenHeight * snapPoints[0];
  const maxHeight = screenHeight * (snapPoints[1] || snapPoints[0]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: screenHeight - minHeight,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, screenHeight, minHeight, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        const newY = screenHeight - minHeight + gesture.dy;
        if (newY >= screenHeight - maxHeight) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          // Dismiss
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose?.());
        } else if (gesture.dy < -50) {
          // Expand
          Animated.spring(translateY, {
            toValue: screenHeight - maxHeight,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        } else {
          // Snap back to min
          Animated.spring(translateY, {
            toValue: screenHeight - minHeight,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const colors = dark
    ? { bg: DarkColors.surfaceElevated, handle: DarkColors.border }
    : { bg: LightColors.surface, handle: LightColors.border };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close sheet"
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.bg,
            height: maxHeight,
            transform: [{ translateY }],
          },
          Shadows.elevated,
          style,
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
});
