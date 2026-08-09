/**
 * Map Component (Native)
 * Uses react-native-maps with CartoDB Dark Matter tiles.
 */
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import { DarkColors, Typography } from '../design-system/tokens';
import { MapPin } from './MapPin';

// Workaround for Android marker rendering bugs:
// Allow tracking for 1 second so fonts and layouts can settle, then lock it.
const TrackedMarker = ({ children, ...props }) => {
  const [track, setTrack] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrack(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return <Marker tracksViewChanges={track} {...props}>{children}</Marker>;
};

export default function Map({ logs = [], businesses = [], initialRegion, targetRegion, onLocationSelect }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (targetRegion && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: targetRegion.latitude,
        longitude: targetRegion.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [targetRegion]);

  const getPinColor = (score) => {
    if (score >= 7) return '#EF4444'; // Loud
    if (score >= 4) return '#F59E0B'; // Moderate
    return '#22C55E'; // Quiet
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion ? {
          ...initialRegion,
          latitudeDelta: initialRegion.latitudeDelta || 0.05,
          longitudeDelta: initialRegion.longitudeDelta || 0.05,
        } : logs.length > 0 ? {
          latitude: logs[0].latitude,
          longitude: logs[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={(e) => {
          if (onLocationSelect && e.nativeEvent.coordinate) {
            onLocationSelect(e.nativeEvent.coordinate);
          }
        }}
      >
        
        {logs.map((log) => (
          <TrackedMarker
            key={log.id}
            coordinate={{ latitude: log.latitude, longitude: log.longitude }}
          >
            <MapPin score={log.disruption_score} isPredictive={log.is_predictive} />
          </TrackedMarker>
        ))}

        {businesses.map((business) => (
          <TrackedMarker
            key={business.id}
            coordinate={{ latitude: business.latitude, longitude: business.longitude }}
            style={{ zIndex: 999 }} // Ensures gold pins render above noise logs
          >
            <MapPin verified={true} />
          </TrackedMarker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkColors.mapBackground,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
