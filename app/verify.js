import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';
import Map from '../src/components/Map';

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  
  const [businessName, setBusinessName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function checkExistingApplication() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('verified_businesses')
        .select('status, name')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (data) {
        setHasApplied(true);
        setApplicationStatus(data.status);
        setBusinessName(data.name);
      } else {
        // Fetch current location for map center
        try {
          const locPerm = await Location.requestForegroundPermissionsAsync();
          if (locPerm.status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setInitialLocation(coords);
            setSelectedLocation(coords);
          }
        } catch (e) {
          console.warn("Could not fetch location", e);
        }
      }
    }
    
    checkExistingApplication();
  }, [session]);

  const handleContinue = () => {
    if (!session?.user?.id) {
      Alert.alert('Authentication Required', 'Please sign in to apply for verification.');
      return;
    }
    if (!businessName.trim()) {
      Alert.alert('Missing Info', 'Please enter your business name.');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Missing Location', 'Please tap on the map to set your exact business location.');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.from('verified_businesses').insert({
        user_id: session.user.id,
        name: businessName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        status: 'pending',
      });

      if (error) throw error;
      
      setShowPayment(false);
      setHasApplied(true);
      setApplicationStatus('pending');
      Alert.alert('Payment Successful', 'Your application has been submitted and is pending manual review.');
      
    } catch (error) {
      Alert.alert('Submission Failed', error.message);
      setShowPayment(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {hasApplied ? (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#D4AF37" />
          </View>
          <View style={styles.statusCard}>
            {applicationStatus === 'rejected' ? (
              <>
                <Ionicons name="close-circle" size={48} color="#EF4444" />
                <Text style={styles.statusTitle}>Application Denied</Text>
                <Text style={styles.statusText}>
                  Your application for "{businessName}" was reviewed and did not meet the guidelines for verification.
                </Text>
                <TouchableOpacity 
                  style={[styles.button, { marginTop: Spacing.xl, width: '100%' }]} 
                  onPress={() => setHasApplied(false)}
                >
                  <Text style={styles.buttonText}>Submit New Application</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons 
                  name={applicationStatus === 'approved' ? 'checkmark-circle' : 'time'} 
                  size={48} 
                  color={applicationStatus === 'approved' ? '#22C55E' : '#F59E0B'} 
                />
                <Text style={styles.statusTitle}>
                  {applicationStatus === 'approved' ? 'Verified!' : 'Pending Review'}
                </Text>
                <Text style={styles.statusText}>
                  {applicationStatus === 'approved' 
                    ? `Your workspace "${businessName}" is now verified and visible on the map.` 
                    : `Your application for "${businessName}" is currently undergoing manual review. Activation is not instant.`}
                </Text>
              </>
            )}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          <Text style={styles.title}>Claim Your Space</Text>
          <Text style={styles.subtitle}>
            Earn a distinct gold Verified pin on the QuietZone map.
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., The Quiet Cafe"
              placeholderTextColor={LightColors.textSecondary}
              value={businessName}
              onChangeText={setBusinessName}
            />

            <Text style={styles.label}>Location Pinpoint</Text>
            <Text style={styles.helperText}>Tap on the map to set the exact spot for your gold pin.</Text>
            
            <View style={styles.mapWrapper}>
              <Map 
                initialRegion={initialLocation || { latitude: 20.5937, longitude: 78.9629 }}
                onLocationSelect={(coords) => setSelectedLocation(coords)}
                businesses={selectedLocation ? [{ id: 'preview', ...selectedLocation }] : []}
                logs={[]}
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleContinue}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Mock Payment Modal */}
      <Modal visible={showPayment} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => !isSubmitting && setShowPayment(false)}>
                <Ionicons name="close" size={24} color={LightColors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.receiptLine}>
              <Text style={styles.receiptText}>QuietZone Gold Verification</Text>
              <Text style={styles.receiptPrice}>₹120</Text>
            </View>
            <View style={[styles.receiptLine, styles.receiptTotal]}>
              <Text style={styles.receiptTotalText}>Total Billed (Yearly)</Text>
              <Text style={styles.receiptTotalPrice}>₹120</Text>
            </View>

            <TouchableOpacity 
              style={[styles.payButton, isSubmitting && { opacity: 0.7 }]} 
              onPress={handlePaymentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.payButtonText}>Pay securely with UPI/Card</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: LightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: LightColors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  scrollContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: LightColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: LightColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  formSection: {
    backgroundColor: LightColors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  label: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    color: LightColors.textPrimary,
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  helperText: {
    ...Typography.bodySmall,
    color: LightColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  mapWrapper: {
    height: 250,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LightColors.border,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: LightColors.brandPrimary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: LightColors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  statusTitle: {
    ...Typography.h1,
    color: LightColors.textPrimary,
    marginTop: Spacing.md,
  },
  statusText: {
    ...Typography.body,
    color: LightColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paymentCard: {
    backgroundColor: LightColors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  paymentTitle: {
    ...Typography.h1,
    color: LightColors.textPrimary,
  },
  receiptLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  receiptText: {
    ...Typography.body,
    color: LightColors.textSecondary,
  },
  receiptPrice: {
    ...Typography.body,
    color: LightColors.textPrimary,
  },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  receiptTotalText: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  receiptTotalPrice: {
    ...Typography.h2,
    color: LightColors.brandPrimary,
  },
  payButton: {
    backgroundColor: '#059669', // Success green
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  payButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  }
});
