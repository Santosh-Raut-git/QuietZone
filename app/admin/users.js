import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setUsers(data);
    } else if (error) {
      Alert.alert('Error', error.message);
    }
    setIsLoading(false);
  };

  const performDelete = async (userId) => {
    try {
      const { error: dbError } = await supabase.from('users').delete().eq('id', userId);
      if (dbError) throw dbError;
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      Platform.OS === 'web' ? window.alert('Delete Failed: ' + err.message) : Alert.alert('Delete Failed', err.message);
    }
  };

  const handleDelete = (userId, email) => {
    const msg = `Are you sure you want to delete the user: ${email || userId}? This action is irreversible.`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) performDelete(userId);
      return;
    }

    Alert.alert(
      'Delete User?',
      msg,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => performDelete(userId)
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.email || 'No Email'}</Text>
            <Text style={styles.cardMeta}>User ID: {item.id}</Text>
            <Text style={styles.cardMeta}>Joined: {date}</Text>
            <View style={styles.badgeRow}>
              {item.admin && (
                <View style={[styles.badge, { backgroundColor: LightColors.brandPrimary }]}>
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {!item.admin && (
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.email)}
            >
              <Ionicons name="trash" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.deleteButtonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={LightColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} size="large" color={LightColors.brandPrimary} />
      ) : (
        <FlatList
          data={users}
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
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.sm,
  },
  deleteButtonText: {
    ...Typography.buttonLabel,
    color: '#EF4444',
  },
  cardActions: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
    paddingTop: Spacing.md,
  },
});
