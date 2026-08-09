import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSubscribe = () => {
    Alert.alert("Coming Soon", "QuietZone Pro subscriptions are not yet available in this beta.");
  };

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
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Ionicons name="star" size={64} color="#D4AF37" />
          <Text style={styles.heroTitle}>QuietZone Pro</Text>
          <Text style={styles.heroSubtitle}>Unlock the full power of crowdsourced noise mapping.</Text>
        </View>

        <View style={styles.currentPlanCard}>
          <Text style={styles.planLabel}>Current Plan</Text>
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planFeature}>✓ View live noise map</Text>
          <Text style={styles.planFeature}>✓ Record and upload scans</Text>
        </View>

        <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="analytics" size={20} color="#D4AF37" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Predictive Filtering</Text>
            <Text style={styles.featureDescription}>View historical noise trends and predict quiet times for any location.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="business" size={20} color="#D4AF37" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Workspace Verification</Text>
            <Text style={styles.featureDescription}>Own a cafe? Claim it and get a gold verified pin on the map.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="notifications-off" size={20} color="#D4AF37" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Ad-Free Experience</Text>
            <Text style={styles.featureDescription}>Enjoy QuietZone completely free of interruptions.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Upgrade for ₹60/mo</Text>
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
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    ...Typography.display,
    color: LightColors.textPrimary,
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    ...Typography.body,
    color: LightColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  currentPlanCard: {
    backgroundColor: '#F3F4F6',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  planLabel: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    textTransform: 'uppercase',
  },
  planName: {
    ...Typography.h2,
    color: LightColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  planFeature: {
    ...Typography.bodySmall,
    color: LightColors.textSecondary,
    marginTop: 4,
  },
  upgradeTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: LightColors.textPrimary,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: LightColors.textSecondary,
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: LightColors.brandPrimary,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  subscribeButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
