<template>
  <div class="dash-screen">
    <div class="dash-header">
      <div class="dash-who">
        <img :src="avatarUrl || '/avatar.png'" alt="you" class="dash-avatar" />
        <div class="dash-who-text">
          <div class="dash-name">{{ displayname || username || 'You' }}</div>
          <div class="dash-handle">ollo.bio/{{ username }}</div>
        </div>
        <NuxtLink v-if="username" :to="`/app/${username}`" class="dash-view">View</NuxtLink>
      </div>
      <div class="dash-tabs">
        <button
          v-for="t in tabs"
          :key="t"
          class="dash-pill"
          :class="{ active: tab === t }"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <div class="dash-body">
      <div v-if="tab === 'Settings'" class="dash-section">
        <div class="field">
          <div class="field-label">Display name</div>
          <input v-model="displayname" class="field-input" placeholder="Set display name" />
        </div>
        <div class="field">
          <div class="field-label">Username</div>
          <input v-model="username" class="field-input" placeholder="Set username" />
        </div>
        <div class="field">
          <div class="field-label">Bio</div>
          <textarea v-model="bio" class="field-input field-textarea" placeholder="Set bio" />
        </div>
        <div class="field">
          <div class="field-label">Currently playing</div>
          <input v-model="game" class="field-input" placeholder="Set game" />
        </div>
        <div class="css-card">
          <div class="css-head">
            <span class="css-title">Custom CSS</span>
            <span class="css-badge">advanced</span>
          </div>
          <div class="css-desc">Dangerous and potentially site breaking. Edit on the web for a full editor.</div>
          <textarea v-model="css" class="css-input" placeholder=".avatar { border-radius: 20px; }" />
        </div>
        <div class="field">
          <div class="field-label">Custom domain</div>
          <input :value="customDomain" disabled class="field-input field-disabled" />
        </div>
      </div>

      <div v-else-if="tab === 'Stream'" class="dash-section">
        <div class="camera-preview">camera preview</div>
        <button class="go-live" :class="{ live: isLive }" @click="toggleLive">
          {{ isLive ? 'End broadcast' : 'Go live' }}
        </button>
        <div class="field">
          <div class="field-label">RTMP ingest</div>
          <div class="mono-box">{{ rtmpUrl }}</div>
        </div>
        <div class="field">
          <div class="field-label">Stream key</div>
          <div class="key-row">
            <span class="mono-box key-mono">{{ streamKeyMasked }}</span>
            <button class="copy-btn" @click="copyStreamKey">{{ copied ? 'Copied' : 'Copy' }}</button>
          </div>
        </div>
        <div class="recordings-card">
          <div>
            <div class="recordings-title">Recordings</div>
            <div class="recordings-sub">Save VODs to your profile</div>
          </div>
          <button class="switch" :class="{ on: recordings }" @click="recordings = !recordings">
            <div class="switch-knob" />
          </button>
        </div>
      </div>

      <div v-else-if="tab === 'Connections'" class="dash-section">
        <div class="conn-row">
          <div class="conn-icon" style="background:#1db954">♫</div>
          <div class="conn-info">
            <div class="conn-name">Spotify</div>
            <div class="conn-state" :style="{ color: spotifyToken ? '#1db954' : 'rgba(255,255,255,.45)' }">
              {{ spotifyToken ? 'Connected' : 'Not connected' }}
            </div>
          </div>
          <button class="conn-btn" :class="{ light: !spotifyToken }" @click="handleSpotify">
            {{ spotifyToken ? 'Manage' : 'Connect' }}
          </button>
        </div>
        <div class="conn-row">
          <div class="conn-icon" style="background:#5865F2">◇</div>
          <div class="conn-info">
            <div class="conn-name">Discord</div>
            <div class="conn-state" style="color:#04d87f">Connected</div>
          </div>
          <button class="conn-btn">Manage</button>
        </div>
        <div class="conn-row">
          <div class="conn-icon" style="background:#111111">◎</div>
          <div class="conn-info">
            <div class="conn-name">Pally.gg</div>
            <div class="conn-state" :style="{ color: pally ? '#04d87f' : 'rgba(255,255,255,.45)' }">
              {{ pally ? `Connected as ${pally}` : 'Not connected' }}
            </div>
          </div>
          <button class="conn-btn" :class="{ light: !pally }" @click="editingPally = !editingPally">
            {{ pally ? 'Manage' : 'Connect' }}
          </button>
        </div>
        <input v-if="editingPally" v-model="pally" class="field-input" placeholder="Pally.gg username" />
        <div class="conn-row">
          <div class="conn-icon" style="background:#9146FF">▷</div>
          <div class="conn-info">
            <div class="conn-name">Twitch</div>
            <div class="conn-state" style="color:rgba(255,255,255,.45)">Coming soon</div>
          </div>
          <button class="conn-btn light" disabled>Connect</button>
        </div>
        <div class="conn-row">
          <div class="conn-icon" style="background:#df1340">♡</div>
          <div class="conn-info">
            <div class="conn-name">HypeRate</div>
            <div class="conn-state" style="color:#dc3545">Under maintenance</div>
          </div>
          <button class="conn-btn dim" disabled>Connect</button>
        </div>
      </div>

      <div v-else-if="tab === 'Privacy'" class="dash-section">
        <div class="privacy-card">
          <div class="privacy-title">Your data</div>
          <div class="privacy-desc">We're privacy-focused and don't share your data with third parties.</div>
          <button class="privacy-btn" @click="showUserData = !showUserData">
            {{ showUserData ? 'Hide user data' : 'Show user data' }}
          </button>
        </div>
        <pre v-if="showUserData" class="privacy-json">{{ JSON.stringify(user, null, 2) }}</pre>
        <div class="danger-card">
          <div class="danger-title">Delete account</div>
          <div class="privacy-desc">This deletes your user and all associated data. It cannot be undone.</div>
          <button class="danger-btn" @click="deleteData">Delete user &amp; data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import useStreamStore from '@/stores/getstream.client';

definePageMeta({ layout: 'app', tab: 'dash' });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

watchEffect(() => {
  if (!user.value) navigateTo('/app/login');
});

const tabs = ['Settings', 'Stream', 'Connections', 'Privacy'] as const;
const tab = ref<(typeof tabs)[number]>('Settings');

const displayname = ref('');
const username = ref('');
const game = ref('');
const bio = ref('');
const avatarUrl = ref('');
const pally = ref('');
const editingPally = ref(false);
const customDomain = ref('');
const css = ref('');
const spotifyToken = ref('');
const spotifyRefreshToken = ref('');
const showUserData = ref(false);
const recordings = ref(true);
const copied = ref(false);

// Client-only: GetStream needs VITE_APP_API_KEY/VITE_APP_TOKEN and is only
// usable once hydrated in the browser.
const store = import.meta.client ? useStreamStore() : null;
const { call } = store ? storeToRefs(store) : { call: ref(undefined) };
const isLive = computed(() => !!call.value);
const rtmpUrl = computed(() => `rtmps://video-ingress-ohio-vi1.stream-io-video.com:443/qxhh2h2czs7x.livestream.${username.value}`);
const streamKeyMasked = computed(() => '••••••••••••••••••••');
const STREAM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoib3JhbmdvcHVzIn0.Rt3FIvYcUMOdx6o-MUBCLZOdmn9lfXbTJ5Qg_yvRQ_0';

async function copyStreamKey() {
  try {
    await navigator.clipboard.writeText(STREAM_KEY);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch (e) {
    console.error('Could not copy stream key', e);
  }
}

async function toggleLive() {
  if (isLive.value) {
    await store?.endCall();
  } else if (username.value) {
    await store?.createCall(username.value);
  }
}

function handleSpotify() {
  const clientId = 'f4c0d55175314b9a843c864e48b863a1';
  const redirectUri = window.location.origin + '/dashboard';
  const scopes = 'user-read-private user-read-email user-read-currently-playing';
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = authUrl;
}

async function deleteData() {
  await supabase.rpc('delete_user');
}

async function updateField(field: string, value: string) {
  if (!user.value) return;
  try {
    await supabase.from('profiles').update({ [field]: value }).eq('id', user.value.id);
  } catch (e: any) {
    console.error(`Error updating ${field}:`, e.message);
  }
}

async function exchangeCodeForToken(code: string) {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: window.location.origin + '/dashboard',
        client_id: 'f4c0d55175314b9a843c864e48b863a1',
        client_secret: '3f30cba020ed435ea8c0dae40069f93d',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return { access_token: response.data.access_token, refresh_token: response.data.refresh_token };
  } catch (e) {
    console.error('Error exchanging code for token:', e);
    return null;
  }
}

async function saveSpotifyTokens(accessToken: string, refreshToken: string) {
  if (!user.value) return;
  await supabase.from('profiles').update({ spotify: accessToken, spotify_refresh: refreshToken }).eq('id', user.value.id);
  spotifyToken.value = accessToken;
  spotifyRefreshToken.value = refreshToken;
}

onMounted(async () => {
  if (!user.value) return;
  const code = router.currentRoute.value.query.code as string | undefined;
  if (code) {
    const tokens = await exchangeCodeForToken(code);
    if (tokens) await saveSpotifyTokens(tokens.access_token, tokens.refresh_token);
  }

  const { data } = await supabase.from('profiles').select('*').eq('id', user.value.id).single();
  if (data) {
    displayname.value = data.displayname;
    username.value = data.username;
    game.value = data.game;
    bio.value = data.bio;
    avatarUrl.value = data.avatar_url;
    pally.value = data.pally;
    customDomain.value = data.custom_domain;
    css.value = data.css;
    spotifyToken.value = data.spotify;
    spotifyRefreshToken.value = data.spotify_refresh;
  }
});

watch(displayname, (v) => updateField('displayname', v));
watch(username, (v) => updateField('username', v));
watch(game, (v) => updateField('game', v));
watch(bio, (v) => updateField('bio', v));
watch(css, (v) => updateField('css', v));
watch(pally, (v) => updateField('pally', v));
</script>

<style scoped>
.dash-screen { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.dash-header { padding: calc(env(safe-area-inset-top, 0) + 14px) 16px 8px; flex: none; }
.dash-who { display: flex; align-items: center; gap: 12px; }
.dash-avatar { width: 48px; height: 48px; border-radius: 100px; object-fit: cover; }
.dash-who-text { min-width: 0; flex: 1; }
.dash-name { font: 700 19px Quicksand, sans-serif; }
.dash-handle { font: 600 13px Quicksand, sans-serif; color: #9a9da6; }
.dash-view { border: none; cursor: pointer; background: #fff; color: #212121; border-radius: 100px; padding: 10px 16px; font: 700 12.5px Quicksand, sans-serif; text-transform: uppercase; text-decoration: none; }
.dash-tabs { display: flex; gap: 8px; margin-top: 14px; overflow: auto; }
.dash-pill { flex: none; border: none; cursor: pointer; background: rgba(0,0,0,.28); color: rgba(255,255,255,.75); border-radius: 100px; padding: 9px 16px; font: 700 13px Quicksand, sans-serif; }
.dash-pill.active { background: #fff; color: #212121; }
.dash-body { flex: 1; overflow: auto; padding: 8px 16px 16px; }
.dash-section { display: flex; flex-direction: column; gap: 14px; }

.field-label { font: 700 13px Quicksand, sans-serif; color: rgba(255,255,255,.55); margin-bottom: 6px; }
.field-input { width: 100%; box-sizing: border-box; background: #060606; border: none; outline: none; color: #fff; padding: 14px 16px; font: 700 16px Quicksand, sans-serif; border-radius: 18px; }
.field-textarea { height: 96px; resize: none; font-weight: 700; line-height: 1.5; }
.field-disabled { color: rgba(255,255,255,.4); cursor: not-allowed; }

.css-card { background: #141a27; border-radius: 20px; padding: 16px; }
.css-head { display: flex; align-items: center; justify-content: space-between; }
.css-title { font: 700 15px Quicksand, sans-serif; }
.css-badge { background: #dc3545; color: #fff; border-radius: 100px; padding: 4px 10px; font: 700 10.5px Quicksand, sans-serif; text-transform: uppercase; }
.css-desc { font: 600 12.5px/1.5 Quicksand, sans-serif; color: rgba(255,255,255,.55); margin-top: 6px; }
.css-input { width: 100%; box-sizing: border-box; background: #060606; border: none; outline: none; border-radius: 14px; padding: 12px; margin-top: 10px; font: 500 12px/1.6 ui-monospace, Menlo, monospace; color: #04d87f; min-height: 70px; resize: vertical; }

.camera-preview { aspect-ratio: 16/9; border-radius: 20px; background: repeating-linear-gradient(115deg,#1c2438 0 10px,#161d2e 10px 20px); display: flex; align-items: center; justify-content: center; font: 500 11px ui-monospace, Menlo, monospace; color: rgba(255,255,255,.4); }
.go-live { border: none; cursor: pointer; background: #fff; color: #212121; border-radius: 100px; padding: 16px; font: 700 16px Quicksand, sans-serif; text-transform: uppercase; }
.go-live.live { background: #dc3545; color: #fff; }
.mono-box { background: #060606; border-radius: 18px; padding: 14px 16px; font: 500 12px/1.5 ui-monospace, Menlo, monospace; color: rgba(255,255,255,.7); word-break: break-all; }
.key-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #060606; border-radius: 18px; padding: 14px 16px; }
.key-mono { background: none; padding: 0; }
.copy-btn { border: none; cursor: pointer; background: rgba(255,255,255,.1); color: #fff; border-radius: 100px; padding: 7px 13px; font: 700 11.5px Quicksand, sans-serif; flex: none; }
.recordings-card { background: #141a27; border-radius: 20px; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
.recordings-title { font: 700 15px Quicksand, sans-serif; }
.recordings-sub { font: 600 12.5px Quicksand, sans-serif; color: rgba(255,255,255,.55); margin-top: 3px; }
.switch { border: none; cursor: pointer; width: 46px; height: 27px; border-radius: 100px; background: rgba(255,255,255,.15); padding: 3px; box-sizing: border-box; display: flex; justify-content: flex-start; }
.switch.on { background: #04d87f; justify-content: flex-end; }
.switch-knob { width: 21px; height: 21px; border-radius: 100px; background: #0e131f; }

.conn-row { background: #141a27; border-radius: 20px; padding: 15px; display: flex; align-items: center; gap: 12px; }
.conn-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex: none; }
.conn-info { min-width: 0; flex: 1; }
.conn-name { font: 700 15px Quicksand, sans-serif; }
.conn-state { font: 600 12.5px Quicksand, sans-serif; margin-top: 2px; }
.conn-btn { border: none; cursor: pointer; background: rgba(255,255,255,.1); color: #fff; border-radius: 100px; padding: 9px 15px; font: 700 12px Quicksand, sans-serif; text-transform: uppercase; }
.conn-btn.light { background: #fff; color: #212121; }
.conn-btn.dim { background: rgba(255,255,255,.06); color: rgba(255,255,255,.5); }
.conn-btn:disabled { cursor: not-allowed; opacity: .8; }

.privacy-card, .danger-card { background: #141a27; border-radius: 20px; padding: 16px; }
.danger-card { border: 1px solid rgba(220,53,69,.35); }
.privacy-title { font: 700 15px Quicksand, sans-serif; }
.danger-title { font: 700 15px Quicksand, sans-serif; color: #dc3545; }
.privacy-desc { font: 600 12.5px/1.5 Quicksand, sans-serif; color: rgba(255,255,255,.55); margin-top: 5px; }
.privacy-btn { border: none; cursor: pointer; margin-top: 12px; background: rgba(255,255,255,.1); color: #fff; border-radius: 100px; padding: 10px 16px; font: 700 12.5px Quicksand, sans-serif; }
.privacy-json { background: #060606; border-radius: 18px; padding: 14px; font: 500 12px/1.7 ui-monospace, Menlo, monospace; color: rgba(255,255,255,.55); white-space: pre-wrap; overflow-x: auto; }
.danger-btn { border: none; cursor: pointer; margin-top: 12px; background: #dc3545; color: #fff; border-radius: 100px; padding: 11px 18px; font: 700 12.5px Quicksand, sans-serif; text-transform: uppercase; }
</style>
