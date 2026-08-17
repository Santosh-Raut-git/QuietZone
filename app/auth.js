import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { PremiumTextInput } from '../src/components/PremiumTextInput';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signIn');
  const [authError, setAuthError] = useState('');

  const toggleMode = () => { setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn'); setAuthError(''); };

  const handleAuth = async () => {
    setAuthError('');
    if (!email || !password) { setAuthError('Please enter both email and password.'); return; }

    setLoading(true);
    let error, signUpSession = null;

    if (mode === 'signIn') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
      signUpSession = data?.session;
    }

    setLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      const safelyGoBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/map');
      if (mode === 'signIn' || signUpSession) {
        safelyGoBack();
      } else {
        if (Platform.OS === 'web') {
          window.alert('Account created! Please check your email for a confirmation link.');
          safelyGoBack();
        } else {
          Alert.alert('Success', 'Account created! Please check your email for a confirmation link.', [{ text: 'OK', onPress: safelyGoBack }]);
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, Spacing.xl), paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled">
        <View style={styles.closeButtonContainer}>
          <Ionicons name="close" size={28} color={LightColors.textPrimary} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/map')} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{mode === 'signIn' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>{mode === 'signIn' ? 'Sign in to sync your scans and access Pro features.' : 'Join QuietZone to map noise levels around you.'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <PremiumTextInput placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
          <Text style={styles.label}>Password</Text>
          <PremiumTextInput placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
          <PrimaryButton label={mode === 'signIn' ? 'Sign In' : 'Sign Up'} onPress={handleAuth} loading={loading} style={styles.actionButton} />
          <SecondaryButton label={mode === 'signIn' ? 'Don\'t have an account? Sign Up' : 'Already have an account? Sign In'} onPress={toggleMode} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: LightColors.background, paddingHorizontal: Spacing.lg },
  closeButtonContainer: { alignItems: 'flex-end', marginBottom: Spacing.lg },
  header: { marginBottom: Spacing.xl },
  title: { ...Typography.display, color: LightColors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: LightColors.textSecondary },
  form: { backgroundColor: LightColors.surface, padding: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.sm },
  label: { ...Typography.bodySmall, color: LightColors.textPrimary, marginBottom: Spacing.xs, fontWeight: '600' },
  errorText: { ...Typography.bodySmall, color: '#EF4444', marginBottom: Spacing.base, textAlign: 'center' },
  actionButton: { marginBottom: Spacing.base, marginTop: Spacing.sm },
});
