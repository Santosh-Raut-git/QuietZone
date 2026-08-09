import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../src/design-system/tokens';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';

export default function MyRecordingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, user } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    fetchMyLogs();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [user]);

  const fetchMyLogs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('noise_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching my recordings:", error);
      Alert.alert("Error", error.message);
    }
      
    if (!error && data) {
      setLogs(data);
    }
    setIsLoading(false);
  };

  const handlePlay = async (logId, audioPath) => {
    try {
      // If already playing this one, stop it
      if (playingId === logId) {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setPlayingId(null);
        return;
      }

      // Stop any existing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setPlayingId(logId);

      // Generate secure signed URL for private bucket
      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .createSignedUrl(audioPath, 60); // 60 seconds expiry

      if (error || !data) throw new Error('Failed to access private audio.');

      // Load and play
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.signedUrl },
        { shouldPlay: true }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          newSound.unloadAsync();
          setSound(null);
        }
      });

      setSound(newSound);
      
    } catch (err) {
      Alert.alert('Playback Error', err.message);
      setPlayingId(null);
    }
  };

  const handleDelete = (logId, audioPath) => {
    Alert.alert(
      'Delete Recording?',
      'This will permanently delete the raw audio file and the public noise map data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Delete audio from Storage
              const { error: storageError } = await supabase.storage
                .from('audio-recordings')
                .remove([audioPath]);
                
              if (storageError) throw storageError;

              // 2. Delete row from DB
              const { error: dbError } = await supabase
                .from('noise_logs')
                .delete()
                .eq('id', logId)
                .eq('user_id', user.id);

              if (dbError) throw dbError;

              // 3. Update UI
              setLogs(prev => prev.filter(l => l.id !== logId));
            } catch (err) {
              Alert.alert('Delete Failed', err.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isPlaying = playingId === item.id;
    const date = new Date(item.created_at).toLocaleDateString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.source}</Text>
            <Text style={styles.cardSubtitle}>{date} • Score: {item.disruption_score}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.audio_path)}
            accessibilityRole="button"
            accessibilityLabel="Delete this recording"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => handlePlay(item.id, item.audio_path)}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Stop audio" : "Play raw audio"}
          >
            <Ionicons name={isPlaying ? "stop" : "play"} size={20} color={isPlaying ? "#FFFFFF" : LightColors.brandPrimary} />
            <Text style={[styles.playText, isPlaying && { color: '#FFFFFF' }]}>
              {isPlaying ? 'Stop' : 'Play Raw Audio'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>My Recordings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.privacyBanner}>
        <Ionicons name="lock-closed" size={20} color={LightColors.textSecondary} />
        <Text style={styles.privacyText}>
          These raw audio files are strictly private and locked to your account via database RLS. Nobody else can access them.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} size="large" color={LightColors.brandPrimary} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mic-outline" size={48} color={LightColors.textSecondary} />
              <Text style={styles.emptyText}>You haven't recorded any scans yet.</Text>
            </View>
          }
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
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: LightColors.textPrimary,
  },
  privacyBanner: {
    flexDirection: 'row',
    backgroundColor: LightColors.surface,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: LightColors.border,
  },
  privacyText: {
    ...Typography.caption,
    color: LightColors.textSecondary,
    flex: 1,
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
    marginBottom: Spacing.md,
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
  deleteButton: {
    padding: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: LightColors.brandPrimary + '1A', // transparent primary
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  playButtonActive: {
    backgroundColor: LightColors.brandPrimary,
  },
  playText: {
    ...Typography.buttonLabel,
    color: LightColors.brandPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: LightColors.textSecondary,
    marginTop: Spacing.md,
  },
});
