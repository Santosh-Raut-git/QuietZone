import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreakpoint } from '../../src/utils/responsive';
import { LightColors, Typography, Spacing, Shadows } from '../../src/design-system/tokens';
import { useRouter, useSegments } from 'expo-router';

const TAB_ICONS = {
  map: { active: 'map', inactive: 'map-outline' },
  discover: { active: 'search', inactive: 'search-outline' },
  scan: { active: 'mic', inactive: 'mic-outline' },
  activity: { active: 'time', inactive: 'time-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabLayout() {
  const { isExpanded } = useBreakpoint();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {isExpanded && <NavRail />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: LightColors.brandPrimary,
          tabBarInactiveTintColor: LightColors.textSecondary,
          tabBarStyle: isExpanded ? { display: 'none' } : { backgroundColor: LightColors.surface, borderTopColor: LightColors.border, borderTopWidth: 1, paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm, paddingTop: Spacing.sm, height: 56 + (insets.bottom > 0 ? insets.bottom : Spacing.sm), ...Shadows.card },
          tabBarLabelStyle: { ...Typography.caption, fontFamily: Typography.caption.fontFamily },
        }}
      >
        <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? TAB_ICONS.map.active : TAB_ICONS.map.inactive} size={24} color={color} /> }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? TAB_ICONS.discover.active : TAB_ICONS.discover.inactive} size={24} color={color} /> }} />
        <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? TAB_ICONS.scan.active : TAB_ICONS.scan.inactive} size={24} color={color} /> }} />
        <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? TAB_ICONS.activity.active : TAB_ICONS.activity.inactive} size={24} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? TAB_ICONS.profile.active : TAB_ICONS.profile.inactive} size={24} color={color} /> }} />
      </Tabs>
    </View>
  );
}

function NavRail() {
  const router = useRouter();
  const segments = useSegments();
  const currentTab = segments[1] || 'map';
  
  const navItems = [
    { key: 'map', label: 'Map', iconActive: 'map', iconInactive: 'map-outline' },
    { key: 'discover', label: 'Discover', iconActive: 'search', iconInactive: 'search-outline' },
    { key: 'scan', label: 'Scan', iconActive: 'mic', iconInactive: 'mic-outline' },
    { key: 'activity', label: 'Activity', iconActive: 'time', iconInactive: 'time-outline' },
    { key: 'profile', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline' },
  ];

  return (
    <View style={navRailStyles.container}>
      <View style={navRailStyles.header}>
        <Image source={require('../../assets/icon.png')} style={{ width: 48, height: 48, borderRadius: 12 }} />
      </View>
      {navItems.map((item) => {
        const isActive = currentTab === item.key;
        return (
          <TouchableOpacity key={item.key} style={navRailStyles.item} onPress={() => router.push(`/${item.key}`)}>
            <Ionicons name={isActive ? item.iconActive : item.iconInactive} size={24} color={isActive ? LightColors.brandPrimary : LightColors.textSecondary} />
            <Text style={[navRailStyles.label, isActive && { color: LightColors.brandPrimary, fontWeight: '600' }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
});

const navRailStyles = StyleSheet.create({
  container: { width: 80, backgroundColor: LightColors.surface, borderRightWidth: 1, borderRightColor: LightColors.border, paddingTop: Spacing.xxl, alignItems: 'center' },
  header: { marginBottom: Spacing.xl },
  item: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.sm },
  label: { ...Typography.caption, color: LightColors.textSecondary, marginTop: Spacing.xs },
});
