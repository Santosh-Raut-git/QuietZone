import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';

export default function AdminLogsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ source: '', description: '', disruption_score: 1 });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('noise_logs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setLogs(data);
    } else if (error) {
      Alert.alert('Error', error.message);
    }
    setIsLoading(false);
  };

  const performDelete = async (logId, audioPath) => {
    try {
      await supabase.storage.from('audio-recordings').remove([audioPath]);
      const { error: dbError } = await supabase.from('noise_logs').delete().eq('id', logId);
      if (dbError) throw dbError;
      setLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) {
      Platform.OS === 'web' ? window.alert('Delete Failed: ' + err.message) : Alert.alert('Delete Failed', err.message);
    }
  };

  const handleDelete = (logId, audioPath) => {
    if (Platform.OS === 'web') {
      if (window.confirm('This will permanently delete the log and its audio from the database. Are you sure?')) {
        performDelete(logId, audioPath);
      }
      return;
    }

    Alert.alert(
      'Delete Log?',
      'This will permanently delete the log and its audio from the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => performDelete(logId, audioPath)
        }
      ]
    );
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditForm({
      source: log.source,
      description: log.description,
      disruption_score: log.disruption_score.toString()
    });
  };

  const saveEdit = async (id) => {
    const score = parseInt(editForm.disruption_score, 10);
    if (isNaN(score) || score < 1 || score > 10) {
      Alert.alert("Invalid Score", "Score must be a number between 1 and 10.");
      return;
    }

    try {
      const { error } = await supabase
        .from('noise_logs')
        .update({
          source: editForm.source,
          description: editForm.description,
          disruption_score: score
        })
        .eq('id', id);

      if (error) throw error;

      setLogs(prev => prev.map(l => l.id === id ? { ...l, source: editForm.source, description: editForm.description, disruption_score: score } : l));
      setEditingId(null);
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString();

    if (editingId === item.id) {
      return (
        <View style={styles.card}>
          <Text style={styles.editLabel}>Category / Source</Text>
          <TextInput 
            style={styles.input}
            value={editForm.source}
            onChangeText={(text) => setEditForm({...editForm, source: text})}
          />
          <Text style={styles.editLabel}>Disruption Score (1-10)</Text>
          <TextInput 
            style={styles.input}
            value={editForm.disruption_score}
            keyboardType="number-pad"
            onChangeText={(text) => setEditForm({...editForm, disruption_score: text})}
          />
          <Text style={styles.editLabel}>Description</Text>
          <TextInput 
            style={styles.input}
            value={editForm.description}
            onChangeText={(text) => setEditForm({...editForm, description: text})}
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingId(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => saveEdit(item.id)}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: Spacing.md }}>
            <Text style={styles.cardTitle}>{item.source}</Text>
            <Text style={styles.cardSubtitle}>Score: {item.disruption_score} • {date}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.cardMeta}>User ID: {item.user_id}</Text>
          </View>
          <View style={styles.actionColumn}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => startEditing(item)}
            >
              <Ionicons name="pencil" size={20} color={LightColors.brandPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.audio_path)}
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
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
        <Text style={styles.headerTitle}>Manage Logs</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} size="large" color={LightColors.brandPrimary} />
      ) : (
        <FlatList
          data={logs}
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
  cardSubtitle: {
    ...Typography.bodySmall,
    color: LightColors.textPrimary,
    marginTop: 2,
    fontWeight: 'bold',
  },
  cardDesc: {
    ...Typography.body,
    color: LightColors.textSecondary,
    marginTop: 4,
  },
  cardMeta: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    marginTop: 8,
  },
  deleteButton: {
    padding: Spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.sm,
  },
  actionColumn: {
    gap: Spacing.sm,
  },
  editButton: {
    padding: Spacing.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.sm,
  },
  editLabel: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    ...Typography.body,
    backgroundColor: '#FFFFFF',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    padding: Spacing.sm,
  },
  cancelBtnText: {
    ...Typography.button,
    color: LightColors.textSecondary,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: LightColors.brandPrimary,
    borderRadius: BorderRadius.sm,
  },
  saveBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
