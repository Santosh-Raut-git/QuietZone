import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';
import { useAuth } from '../../src/hooks/useAuth';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.admin) {
      Alert.alert('Unauthorized', 'You do not have permission to access the admin panel.');
      router.replace('/');
    }
  }, [user]);

  if (!user?.admin) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Ionicons name="shield-half" size={64} color={LightColors.brandPrimary} />
          <Text style={styles.heroTitle}>Control Center</Text>
          <Text style={styles.heroSubtitle}>Manage users, content, and business verification requests.</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/logs')}>
          <View style={styles.cardIcon}>
            <Ionicons name="map" size={24} color={LightColors.brandPrimary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Manage Noise Logs</Text>
            <Text style={styles.cardSubtitle}>View and delete inappropriate or spam scans.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={LightColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/users')}>
          <View style={styles.cardIcon}>
            <Ionicons name="people" size={24} color={LightColors.brandPrimary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Manage Users</Text>
            <Text style={styles.cardSubtitle}>View and ban malicious users.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={LightColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/admin/businesses')}>
          <View style={styles.cardIcon}>
            <Ionicons name="business" size={24} color="#D4AF37" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Verification Requests</Text>
            <Text style={styles.cardSubtitle}>Approve or reject pending workspace claims.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={LightColors.textSecondary} />
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
    marginBottom: Spacing.xxl,
  },
  heroTitle: {
    ...Typography.h1,
    color: LightColors.textPrimary,
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    ...Typography.body,
    color: LightColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LightColors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: LightColors.textSecondary,
    marginTop: 2,
  },
});
