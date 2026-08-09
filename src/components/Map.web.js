/**
 * Map Component (Web)
 * Uses react-leaflet with CartoDB Dark Matter tiles.
 * Dynamically imported to avoid SSR "window is not defined" crashes.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Head from 'expo-router/head';
import { DarkColors } from '../design-system/tokens';

export default function Map({ logs = [], businesses = [], initialRegion, targetRegion, onLocationSelect }) {
  const [LeafletComponents, setLeafletComponents] = useState(null);

  useEffect(() => {
    // Only load Leaflet on the client to prevent SSR crashes
    if (typeof window !== 'undefined') {
      Promise.all([
        import('react-leaflet'),
        import('leaflet')
      ]).then(([reactLeaflet, L]) => {
        setLeafletComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          useMap: reactLeaflet.useMap,
          useMapEvents: reactLeaflet.useMapEvents,
          divIcon: L.default ? L.default.divIcon : L.divIcon
        });
      }).catch(console.error);
    }
  }, []);

  if (!LeafletComponents) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={DarkColors.liveAccent} />
      </View>
    );
  }

  const { MapContainer, TileLayer, Marker, divIcon, useMap, useMapEvents } = LeafletComponents;

  const MapUpdater = ({ targetRegion }) => {
    const map = useMap();
    useEffect(() => {
      if (targetRegion) {
        map.flyTo([targetRegion.latitude, targetRegion.longitude], 16, { animate: true });
      }
    }, [targetRegion, map]);
    return null;
  };

  const MapClickHandler = ({ onSelect }) => {
    useMapEvents({
      click(e) {
        if (onSelect) {
          onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        }
      }
    });
    return null;
  };

  const getPinColor = (score) => {
    if (score >= 7) return '#EF4444'; // Loud
    if (score >= 4) return '#F59E0B'; // Moderate
    return '#22C55E'; // Quiet
  };

  const createPinIcon = (score, isPredictive = false) => {
    const color = getPinColor(score);
    const borderStyle = isPredictive ? '2px dashed #E5E7EB' : '2px solid white';
    const opacity = isPredictive ? '0.75' : '1';
    
    return divIcon({
      className: 'custom-pin',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 12px; border: ${borderStyle}; opacity: ${opacity}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-family: sans-serif; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${score}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createVerifiedPinIcon = () => {
    return divIcon({
      className: 'custom-pin-verified',
      html: `<div style="background-color: #D4AF37; width: 36px; height: 36px; border-radius: 18px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 512 512" fill="white"><path d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208c114.9,0,208-93.1,208-208S370.9,48,256,48z M369.8,211.5l-140.2,143 c-3.9,4-10.2,4-14.1,0l-71.8-73.3c-3.9-4-3.9-10.5,0-14.5l14.1-14.4c3.9-4,10.2-4,14.1,0l50.6,51.7l118.4-120.8 c3.9-4,10.2-4,14.1,0l14.1,14.4C373.7,201.7,373.7,208.2,369.8,211.5z"/></svg></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const createUserLocationIcon = () => {
    return divIcon({
      className: 'custom-user-location',
      html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 10px; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const center = initialRegion 
    ? [initialRegion.latitude, initialRegion.longitude]
    : logs.length > 0
      ? [logs[0].latitude, logs[0].longitude]
      : [37.7749, -122.4194];

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </Head>
      <View style={styles.container}>
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater targetRegion={targetRegion} />
          {onLocationSelect && <MapClickHandler onSelect={onLocationSelect} />}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {initialRegion && (
            <Marker 
              position={[initialRegion.latitude, initialRegion.longitude]}
              icon={createUserLocationIcon()}
              zIndexOffset={2000}
            />
          )}
          {logs.map((log) => (
            <Marker 
              key={log.id} 
              position={[log.latitude, log.longitude]}
              icon={createPinIcon(log.disruption_score, log.is_predictive)}
            />
          ))}
          {businesses.map((business) => (
            <Marker 
              key={business.id} 
              position={[business.latitude, business.longitude]}
              icon={createVerifiedPinIcon()}
              zIndexOffset={1000}
            />
          ))}
        </MapContainer>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkColors.mapBackground,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

