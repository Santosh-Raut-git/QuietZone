/**
 * App entry — redirects to the Map tab (home screen)
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/map" />;
}
