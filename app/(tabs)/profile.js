import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { LightColors, Typography, Spacing } from '../../src/design-system/tokens';
import { useBreakpoint } from '../../src/utils/responsive';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { ListItemCard } from '../../src/components/ListItemCard';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { screenPadding } = useBreakpoint();
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: screenPadding }}>
        <View style={styles.header}>
          <View style={styles.avatar}><Ionicons name="person" size={40} color={LightColors.brandPrimary} /></View>
          <Text style={styles.title}>{user ? 'My Profile' : 'Profile'}</Text>
          <Text style={styles.subtitle}>{user ? user.email : 'Sign in to save your scans and access all features.'}</Text>
        </View>

        {!user ? (
          <PrimaryButton label="Sign In" onPress={() => router.push('/auth')} style={styles.actionButton} />
        ) : (
          <SecondaryButton label="Sign Out" onPress={handleSignOut} style={styles.actionButton} />
        )}

        <Text style={styles.sectionTitle}>Settings</Text>

        {user?.admin && <ListItemCard title="Admin Dashboard" subtitle="Manage logs, users, and verifications" onPress={() => router.push('/admin')} rightContent={<Ionicons name="settings" size={20} color={LightColors.brandPrimary} />} />}
        
        {user && (
          <>
            <ListItemCard title="My Recordings" subtitle="Listen to and manage your raw audio" onPress={() => router.push('/recordings')} rightContent={<Ionicons name="chevron-forward" size={20} color={LightColors.textSecondary} />} />
            <ListItemCard title="Business Verification" subtitle="Claim your space and earn a gold pin" onPress={() => router.push('/verify')} rightContent={<Ionicons name="chevron-forward" size={20} color={LightColors.textSecondary} />} />
          </>
        )}

        <ListItemCard title="Privacy & Data" subtitle="Manage your data and privacy settings" onPress={() => router.push('/privacy')} rightContent={<Ionicons name="chevron-forward" size={20} color={LightColors.textSecondary} />} />
        <ListItemCard title="Subscription" subtitle="Free plan" onPress={() => router.push('/subscription')} rightContent={<Ionicons name="chevron-forward" size={20} color={LightColors.textSecondary} />} />
        <ListItemCard title="About QuietZone" subtitle="Version 1.0.0" onPress={() => router.push('/about')} rightContent={<Ionicons name="chevron-forward" size={20} color={LightColors.textSecondary} />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: LightColors.brandPrimary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  title: { ...Typography.h1, color: LightColors.textPrimary },
  subtitle: { ...Typography.body, color: LightColors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  actionButton: { marginVertical: Spacing.lg },
  sectionTitle: { ...Typography.h2, color: LightColors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.md },
});
