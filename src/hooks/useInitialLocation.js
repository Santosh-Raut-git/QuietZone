import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useInitialLocation() {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setError('Permission to access location was denied');
            setIsLoading(false);
          }
          return;
        }

        const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isMounted) {
          setLocation({
            latitude: currentLoc.coords.latitude,
            longitude: currentLoc.coords.longitude,
          });
          setIsLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          console.warn('Failed to get location', e);
          setError(e.message || 'Failed to get location');
          setIsLoading(false);
        }
      }
    }

    fetchLocation();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { location, isLoading, error };
}
