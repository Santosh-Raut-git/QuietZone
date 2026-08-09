import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';

export default function AdminBusinessesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('verified_businesses')
      .select('*')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setBusinesses(data);
    } else if (error) {
      Alert.alert('Error', error.message);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('verified_businesses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update UI: if rejected, remove it. Otherwise update the status
      if (newStatus === 'rejected') {
        setBusinesses(prev => prev.filter(b => b.id !== id));
      } else {
        setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString();

    const statusColors = {
      pending: '#F59E0B',
      approved: '#22C55E',
      rejected: '#EF4444',
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}</Text>
            <Text style={styles.cardMeta}>User ID: {item.user_id}</Text>
            <Text style={styles.cardMeta}>Requested: {date}</Text>
            
            <View style={[styles.badge, { backgroundColor: statusColors[item.status] || '#9CA3AF' }]}>
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {item.status !== 'approved' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#DCFCE7' }]}
              onPress={() => updateStatus(item.id, 'approved')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#166534" />
              <Text style={[styles.actionBtnText, { color: '#166534' }]}>Approve</Text>
            </TouchableOpacity>
          )}

          {item.status !== 'rejected' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() => updateStatus(item.id, 'rejected')}
            >
              <Ionicons name="close-circle" size={20} color="#991B1B" />
              <Text style={[styles.actionBtnText, { color: '#991B1B' }]}>Reject</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} size="large" color={LightColors.brandPrimary} />
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: LightColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: LightColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  cardMeta: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  badgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  actionBtnText: {
    ...Typography.button,
  },
});
