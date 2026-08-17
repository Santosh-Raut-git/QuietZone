import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { DarkColors, Typography } from '../design-system/tokens';
import { MapPin } from './MapPin';

const TrackedMarker = ({ children, ...props }) => {
  const [track, setTrack] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTrack(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return <Marker tracksViewChanges={track} {...props}>{children}</Marker>;
};

export default function Map({ logs = [], businesses = [], initialRegion, targetRegion, onLocationSelect }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (targetRegion && mapRef.current) {
      mapRef.current.animateToRegion({ ...targetRegion, latitudeDelta: 0.005, longitudeDelta: 0.005 });
    }
  }, [targetRegion]);

  const initial = initialRegion ? { ...initialRegion, latitudeDelta: initialRegion.latitudeDelta || 0.05, longitudeDelta: initialRegion.longitudeDelta || 0.05 }
    : logs.length > 0 ? { latitude: logs[0].latitude, longitude: logs[0].longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initial}
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={(e) => onLocationSelect?.(e.nativeEvent.coordinate)}
      >
        {logs.map((log) => (
          <TrackedMarker key={log.id} coordinate={{ latitude: log.latitude, longitude: log.longitude }}>
            <MapPin score={log.disruption_score} isPredictive={log.is_predictive} />
          </TrackedMarker>
        ))}
        {businesses.map((business) => (
          <TrackedMarker key={business.id} coordinate={{ latitude: business.latitude, longitude: business.longitude }} style={{ zIndex: 999 }}>
            <MapPin verified={true} />
          </TrackedMarker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DarkColors.mapBackground },
  map: { width: '100%', height: '100%' },
  pin: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  pinText: { ...Typography.caption, color: '#FFFFFF', fontWeight: 'bold' },
});
