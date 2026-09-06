import type { CapacitorConfig } from '@capacitor/cli';

// The Android app is a thin native shell: it points its WebView at the
// mobile UI (`/app/...`) served by this same Nuxt app, so auth cookies,
// Supabase sessions, GetStream calls and Spotify OAuth redirects all work
// exactly as they do on the web — nothing is bundled/generated locally.
// Override with OLLO_APP_URL for local dev against `npm run dev`.
const serverUrl = process.env.OLLO_APP_URL || 'https://ollo.bio';

const config: CapacitorConfig = {
  appId: 'bio.ollo.app',
  appName: 'ollo',
  webDir: 'public',
  server: {
    url: `${serverUrl}/app/home`,
    cleartext: serverUrl.startsWith('http://'),
  },
  android: {
    backgroundColor: '#1A2235',
  },
};

export default config;
