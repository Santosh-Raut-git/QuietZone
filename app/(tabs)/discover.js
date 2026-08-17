import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightColors, Typography, Spacing } from '../../src/design-system/tokens';
import { useNoiseLogs } from '../../src/hooks/useNoiseLogs';
import { useVerifiedBusinesses } from '../../src/hooks/useVerifiedBusinesses';
import { SearchBar } from '../../src/components/SearchBar';
import { FilterChip } from '../../src/components/FilterChip';
import { ListItemCard } from '../../src/components/ListItemCard';
import { DisruptionScoreBadge } from '../../src/components/DisruptionScoreBadge';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CATEGORIES = ['All', 'Traffic', 'Cafe', 'Park', 'Library', 'Construction', 'Restaurant', 'Office'];

export default function DiscoverScreen({ isNested = false }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: noiseLogs, isLoading, isError } = useNoiseLogs(null, { search: searchQuery, category: activeCategory });
  const { data: businesses, isLoading: isLoadingBiz } = useVerifiedBusinesses();

  const combinedData = useMemo(() => {
    let result = [];
    if (businesses) result = [...businesses.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(b => ({ ...b, type: 'business' }))];
    if (noiseLogs) result = [...result, ...noiseLogs.map(n => ({ ...n, type: 'log' }))];
    return result;
  }, [noiseLogs, businesses, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Discover</Text>
      <Text style={styles.headerSubtitle}>Find quiet places nearby</Text>
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search locations or descriptions..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
        {CATEGORIES.map(cat => <FilterChip key={cat} label={cat} active={activeCategory === cat} onPress={() => setActiveCategory(cat)} style={styles.chip} />)}
      </ScrollView>
      <View style={styles.resultCountContainer}>
        <Text style={styles.resultCountText}>{combinedData.length} {combinedData.length === 1 ? 'place' : 'places'} found</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading || isLoadingBiz) return <View style={styles.emptyContainer}><ActivityIndicator size="large" color={LightColors.brandPrimary} /></View>;
    if (isError) return <View style={styles.emptyContainer}><Ionicons name="alert-circle-outline" size={48} color={LightColors.textSecondary} /><Text style={styles.emptyTitle}>Failed to load scans</Text><Text style={styles.emptySubtitle}>Please check your connection and try again.</Text></View>;
    return <View style={styles.emptyContainer}><Ionicons name="search-outline" size={48} color={LightColors.textSecondary} /><Text style={styles.emptyTitle}>No locations found</Text><Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text></View>;
  };

  const renderItem = ({ item }) => {
    const timeAgo = new Date(item.created_at).toLocaleDateString();
    
    if (item.type === 'business') {
      return <ListItemCard title={item.name} subtitle="Verified Workspace" meta={timeAgo} leftContent={<Ionicons name="shield-checkmark" size={32} color="#D4AF37" />} onPress={() => router.push({ pathname: '/map', params: { targetLat: item.latitude, targetLng: item.longitude } })} />;
    }

    return <ListItemCard title={item.source} subtitle={item.description} meta={timeAgo} leftContent={<DisruptionScoreBadge score={item.disruption_score} />} onPress={() => router.push({ pathname: '/map', params: { targetLat: item.latitude, targetLng: item.longitude } })} />;
  };

  return (
    <View style={[styles.container, !isNested && { paddingTop: insets.top }]}>
      <FlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  headerContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  headerTitle: { ...Typography.h1, color: LightColors.textPrimary },
  headerSubtitle: { ...Typography.body, color: LightColors.textSecondary, marginBottom: Spacing.lg },
  searchWrapper: { marginBottom: Spacing.md },
  chipContainer: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip: { marginRight: Spacing.xs },
  resultCountContainer: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  resultCountText: { ...Typography.caption, color: LightColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { flexGrow: 1, paddingHorizontal: Spacing.xs },
  emptyContainer: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl },
  emptyTitle: { ...Typography.h2, color: LightColors.textPrimary, marginTop: Spacing.md },
  emptySubtitle: { ...Typography.body, color: LightColors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
});
