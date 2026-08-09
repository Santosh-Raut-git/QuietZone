import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';

export default function PrivacyScreen() {
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
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color={LightColors.brandPrimary} />
        </View>
        
        <Text style={styles.title}>Your Privacy, Guaranteed.</Text>
        <Text style={styles.subtitle}>
          QuietZone is built with a strict privacy-first model. Here's exactly how your data is handled:
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mic-off" size={24} color={LightColors.brandPrimary} />
            <Text style={styles.cardTitle}>1. Raw Audio is 100% Private</Text>
          </View>
          <Text style={styles.cardBody}>
            When you scan an area, the raw audio file is securely locked to your account using database-level Row Level Security (RLS). Nobody else—not even QuietZone administrators—can listen to your recordings.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map" size={24} color={LightColors.brandPrimary} />
            <Text style={styles.cardTitle}>2. Only Scores are Public</Text>
          </View>
          <Text style={styles.cardBody}>
            The only information shared on the public heatmap is the AI-generated Disruption Score (1-10) and the category (e.g. "Traffic"). 
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trash" size={24} color={LightColors.brandPrimary} />
            <Text style={styles.cardTitle}>3. You Are in Control</Text>
          </View>
          <Text style={styles.cardBody}>
            You own your data. You can delete any of your scans at any time from the "My Recordings" page, which permanently erases the raw audio and removes the point from the public map.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/recordings')}
        >
          <Text style={styles.actionButtonText}>Manage My Recordings</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
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
    padding: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: LightColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: LightColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: LightColors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  cardBody: {
    ...Typography.body,
    color: LightColors.textSecondary,
    paddingLeft: 32, // align with text
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: LightColors.brandPrimary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  actionButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
