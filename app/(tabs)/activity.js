import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightColors, Typography, Spacing, BorderRadius, Shadows } from '../../src/design-system/tokens';
import { useBreakpoint } from '../../src/utils/responsive';
import { EmptyState } from '../../src/components/StateScreens';
import { useNoiseLogs } from '../../src/hooks/useNoiseLogs';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { screenPadding } = useBreakpoint();
  const { data: logs = [], isLoading, error } = useNoiseLogs(null, {});

  const getBadgeColor = (score) => score >= 7 ? '#EF4444' : score >= 4 ? '#F59E0B' : '#22C55E';
  const getBadgeLabel = (score) => score >= 7 ? 'Loud' : score >= 4 ? 'Moderate' : 'Quiet';

  const renderItem = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.source}</Text>
            <Text style={styles.cardSubtitle}>{date}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(item.disruption_score) }]}>
            <Text style={styles.badgeNumber}>{item.disruption_score}</Text>
            <Text style={styles.badgeText}>{getBadgeLabel(item.disruption_score)}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}><Text style={styles.title}>Global Activity</Text></View>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xxl }} size="large" color={LightColors.brandPrimary} />
      ) : error ? (
        <EmptyState icon="alert-circle-outline" title="Error Loading Activity" message={error.message} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: screenPadding }]}
          ListEmptyComponent={<EmptyState icon="time-outline" title="No Activity Yet" message="No noise scans have been recorded recently." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LightColors.background },
  header: { backgroundColor: LightColors.surface, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: LightColors.border },
  title: { ...Typography.h1, color: LightColors.textPrimary, marginTop: Spacing.md },
  listContent: { paddingVertical: Spacing.md },
  card: { backgroundColor: LightColors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm, borderWidth: 1, borderColor: LightColors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardTitle: { ...Typography.h2, color: LightColors.textPrimary },
  cardSubtitle: { ...Typography.bodySmall, color: LightColors.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm, gap: 4 },
  badgeNumber: { ...Typography.body, fontWeight: 'bold', color: '#FFFFFF' },
  badgeText: { ...Typography.caption, fontWeight: 'bold', color: '#FFFFFF' },
  description: { ...Typography.body, color: LightColors.textSecondary },
});
