import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LightColors, DarkColors, Typography, Spacing } from '../design-system/tokens';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

export function LoadingState({ message = 'Loading...', dark = false, style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={dark ? DarkColors.liveAccent : LightColors.brandPrimary} />
      <Text style={[styles.message, { color: dark ? DarkColors.textSecondary : LightColors.textSecondary }]}>{message}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'map-outline', title = 'Nothing here yet', message = 'Start scanning to add noise readings to the map.', actionLabel, onAction, dark = false, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: dark ? DarkColors.surfaceElevated : LightColors.background }]}>
        <Ionicons name={icon} size={48} color={dark ? DarkColors.textSecondary : LightColors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: dark ? DarkColors.textPrimary : LightColors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: dark ? DarkColors.textSecondary : LightColors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction && (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again.', onRetry, retryLabel = 'Retry', dark = false, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: '#EF444412' }]}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
      </View>
      <Text style={[styles.title, { color: dark ? DarkColors.textPrimary : LightColors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: dark ? DarkColors.textSecondary : LightColors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <View style={styles.action}>
          <SecondaryButton label={retryLabel} onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  title: { ...Typography.h2, textAlign: 'center', marginBottom: Spacing.sm },
  message: { ...Typography.body, textAlign: 'center', marginTop: Spacing.sm },
  action: { marginTop: Spacing.lg },
});
