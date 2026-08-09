/**
 * Auth Modal Screen
 * 
 * Handles Supabase Email/Password authentication.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signIn'); // 'signIn' or 'signUp'

  const toggleMode = () => {
    setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn');
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    let error;

    if (mode === 'signIn') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
    }

    setLoading(false);

    if (error) {
      Alert.alert('Authentication Error', error.message);
    } else {
      // Helper to safely go back
      const safelyGoBack = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      };

      // On successful auth, close the modal
      if (mode === 'signIn') {
        safelyGoBack();
      } else {
        // If email confirmation is required, Supabase will succeed but session is null until verified.
        Alert.alert('Success', 'Account created! Please check your email for a confirmation link if required, otherwise you are signed in.', [
          { text: 'OK', onPress: safelyGoBack }
        ]);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { paddingTop: Math.max(insets.top, Spacing.xl), paddingBottom: insets.bottom + Spacing.xl }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.closeButtonContainer}>
          <Ionicons 
            name="close" 
            size={28} 
            color={LightColors.textPrimary} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }} 
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{mode === 'signIn' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signIn' 
              ? 'Sign in to sync your scans and access Pro features.' 
              : 'Join QuietZone to map noise levels around you.'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={LightColors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={LightColors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryButton
            label={mode === 'signIn' ? 'Sign In' : 'Sign Up'}
            onPress={handleAuth}
            loading={loading}
            style={styles.actionButton}
          />

          <SecondaryButton
            label={mode === 'signIn' ? 'Don\'t have an account? Sign Up' : 'Already have an account? Sign In'}
            onPress={toggleMode}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: LightColors.background,
    paddingHorizontal: Spacing.lg,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.display,
    color: LightColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: LightColors.textSecondary,
  },
  form: {
    backgroundColor: LightColors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: LightColors.textPrimary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    color: LightColors.textPrimary,
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: LightColors.background,
  },
  actionButton: {
    marginBottom: Spacing.base,
    marginTop: Spacing.sm,
  },
});
