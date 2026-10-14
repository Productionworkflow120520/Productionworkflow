import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Recharge Pro - Capacitor Android Configuration
 * Package ID: in.rechargepro.app
 * App Name: Recharge Pro
 */

// If CAPACITOR_SERVER_URL is provided in environment, use that; otherwise default to deployed Vercel URL
const liveUrl = process.env.CAPACITOR_SERVER_URL || 'https://productionworkflow.vercel.app';

const config: CapacitorConfig = {
  appId: 'in.rechargepro.app',
  appName: 'Recharge Pro',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: liveUrl,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#3b82f6',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
