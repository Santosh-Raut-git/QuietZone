import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LightColors, Typography, Spacing, BorderRadius } from '../src/design-system/tokens';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 30 }} />
        </View>
        <Text style={styles.title}>QuietZone</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        
        <Text style={styles.description}>
          A crowdsourced urban noise map built to help you find peace and quiet in a noisy world.
        </Text>
        
        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: LightColors.border,
    backgroundColor: LightColors.surface,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: LightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: LightColors.border,
    overflow: 'hidden',
  },
  title: {
    ...Typography.display,
    color: LightColors.textPrimary,
  },
  version: {
    ...Typography.bodySmall,
    color: LightColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  description: {
    ...Typography.body,
    color: LightColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  }
});
