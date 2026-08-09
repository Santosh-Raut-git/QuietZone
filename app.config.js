// QuietZone — app.config.js
// Environment variables injected via process.env, never hard-coded.
export default {
  name: 'QuietZone',
  slug: 'quietzone',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'quietzone',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.quietzone.app',
    infoPlist: {
      NSMicrophoneUsageDescription:
        'QuietZone records a short ambient audio sample (5–10 seconds) to classify the noise level at your location. The recording is stored privately and only you can access it.',
      NSLocationWhenInUseUsageDescription:
        'QuietZone uses your location to place noise readings on the map so other users can find quiet areas nearby.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#071629'
    },
    permissions: ['RECORD_AUDIO', 'ACCESS_FINE_LOCATION'],
    package: 'com.quietzone.app',
    reactNativeArchitectures: ['arm64-v8a']
  },
  web: {
    output: 'static',
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#071629',
        image: './assets/splash.png',
        imageWidth: 200,
      },
    ],
  ],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'placeholder_anon_key',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  },
};
