import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect href={session ? "/(tabs)/map" : "/auth"} />;
}
