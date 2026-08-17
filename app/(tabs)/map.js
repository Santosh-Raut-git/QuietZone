import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Map from '../../src/components/Map';
import { useNoiseLogs } from '../../src/hooks/useNoiseLogs';
import { useEntitlements } from '../../src/hooks/useEntitlements';
import { useVerifiedBusinesses } from '../../src/hooks/useVerifiedBusinesses';
import { useInitialLocation } from '../../src/hooks/useInitialLocation';
import { useBreakpoint } from '../../src/utils/responsive';
import DiscoverScreen from './discover';
import { DarkColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: entitlements, isLoading: isLoadingEntitlements } = useEntitlements();
  const { data: verifiedBusinesses } = useVerifiedBusinesses();
  const { isExpanded } = useBreakpoint();
  
  const [isPredictive, setIsPredictive] = useState(false);
  const [targetDay, setTargetDay] = useState(new Date().getDay());
  const [targetHour, setTargetHour] = useState(new Date().getHours());
  const [targetRegion, setTargetRegion] = useState(null);
  const { targetLat, targetLng } = useLocalSearchParams();
  
  const { location: initialRegion, isLoading: isLocating } = useInitialLocation();

  useEffect(() => {
    if (targetLat && targetLng) setTargetRegion({ latitude: parseFloat(targetLat), longitude: parseFloat(targetLng) });
  }, [targetLat, targetLng]);

  const { data: logs, isLoading: isLoadingLogs } = useNoiseLogs(null, { isPredictive, targetDay, targetHour });

  const handleTogglePredictive = () => {
    if (!entitlements?.is_pro) {
      Alert.alert('QuietZone Pro', 'Predictive Filtering is a Pro feature. Upgrade to see historical noise predictions for any day and time!', [
        { text: 'Maybe Later', style: 'cancel' }, { text: 'Upgrade', onPress: () => router.push('/profile') }
      ]);
      return;
    }
    setIsPredictive(!isPredictive);
  };

  return (
    <View style={[styles.container, isExpanded && { flexDirection: 'row' }]}>
      {isExpanded && <View style={styles.sidePanel}><DiscoverScreen isNested={true} /></View>}

      <View style={styles.mapContainer}>
        {isLocating ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={DarkColors.liveAccent} /></View>
        ) : (
          <Map logs={logs || []} businesses={verifiedBusinesses || []} initialRegion={initialRegion} targetRegion={targetRegion} />
        )}

        {!isExpanded && (
          <View style={[styles.floatingHeader, { top: Math.max(insets.top, Spacing.md) }]}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => router.push('/discover')}>
                <Ionicons name="search" size={20} color={DarkColors.textSecondary} />
                <Text style={styles.searchText}>Search Quiet Places...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, isPredictive && styles.toggleButtonActive]} onPress={handleTogglePredictive}>
                <Ionicons name={isPredictive ? "analytics" : "time-outline"} size={20} color={isPredictive ? DarkColors.liveAccent : DarkColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isPredictive && (
              <View style={styles.pickerPanel}>
                <Text style={styles.pickerLabel}>Predictive Average</Text>
                <View style={styles.pickerControls}>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setTargetDay((d) => (d === 0 ? 6 : d - 1))}><Ionicons name="chevron-back" size={16} color={DarkColors.textPrimary} /></TouchableOpacity>
                  <Text style={styles.pickerValue}>{DAYS[targetDay]}</Text>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setTargetDay((d) => (d === 6 ? 0 : d + 1))}><Ionicons name="chevron-forward" size={16} color={DarkColors.textPrimary} /></TouchableOpacity>
                  <View style={styles.pickerDivider} />
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setTargetHour((h) => (h === 0 ? 23 : h - 1))}><Ionicons name="chevron-back" size={16} color={DarkColors.textPrimary} /></TouchableOpacity>
                  <Text style={styles.pickerValue}>{targetHour}:00</Text>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setTargetHour((h) => (h === 23 ? 0 : h + 1))}><Ionicons name="chevron-forward" size={16} color={DarkColors.textPrimary} /></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {(isLoadingLogs || isLoadingEntitlements) && (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={DarkColors.liveAccent} /></View>
        )}

        {!isExpanded && !isPredictive && (
          <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + Spacing.xl + 60 }]} activeOpacity={0.9} onPress={() => router.push('/scan')}>
            <Ionicons name="mic" size={28} color="#FFFFFF" />
            <Text style={styles.fabText}>Scan Area</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DarkColors.mapBackground },
  mapContainer: { flex: 1 },
  sidePanel: { width: 400, borderRightWidth: 1, borderRightColor: DarkColors.border, backgroundColor: DarkColors.surfaceElevated },
  floatingHeader: { position: 'absolute', left: Spacing.md, right: Spacing.md, zIndex: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: DarkColors.surfaceElevated, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: DarkColors.border, ...Shadows.md },
  searchText: { ...Typography.body, color: DarkColors.textSecondary, marginLeft: Spacing.sm },
  toggleButton: { width: 48, height: 48, backgroundColor: DarkColors.surfaceElevated, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: DarkColors.border, ...Shadows.md },
  toggleButtonActive: { borderColor: DarkColors.liveAccent, backgroundColor: 'rgba(0, 210, 106, 0.1)' },
  pickerPanel: { marginTop: Spacing.sm, backgroundColor: DarkColors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: DarkColors.border, ...Shadows.md },
  pickerLabel: { ...Typography.caption, color: DarkColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md, textAlign: 'center' },
  pickerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pickerBtn: { padding: Spacing.xs },
  pickerValue: { ...Typography.h2, color: DarkColors.textPrimary, width: 50, textAlign: 'center' },
  pickerDivider: { width: 1, height: 24, backgroundColor: DarkColors.border, marginHorizontal: Spacing.lg },
  loadingContainer: { position: 'absolute', top: '50%', alignSelf: 'center', backgroundColor: DarkColors.surfaceElevated, padding: Spacing.md, borderRadius: BorderRadius.full, ...Shadows.lg },
  fab: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: DarkColors.liveAccent, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, ...Shadows.lg, gap: Spacing.sm },
  fabText: { ...Typography.button, color: '#FFFFFF' },
});
