<template>
  <div class="spotify-screen">
    <div class="spotify-topbar">
      <button class="spotify-back" @click="$router.back()">‹</button>
      <div class="spotify-label">Now playing</div>
      <div class="spotify-spacer" />
    </div>

    <div v-if="track" class="spotify-main">
      <div class="spotify-art">
        <img v-if="track.album?.images?.[0]?.url" :src="track.album.images[0].url" alt="Album art" />
        <span v-else>album art</span>
      </div>
      <div class="spotify-track-info">
        <div class="spotify-title">{{ track.name }}</div>
        <div class="spotify-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }} · {{ track.album?.name }}</div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <div class="progress-times">
          <span>{{ formatMs(positionMs) }}</span>
          <span>{{ formatMs(durationMs) }}</span>
        </div>
      </div>
    </div>
    <div v-else class="spotify-empty">Nothing playing right now.</div>

    <div class="spotify-bottom">
      <div class="spotify-note-row">
        <img :src="profile?.avatar || '/avatar.png'" alt="" class="spotify-note-avatar" />
        <div class="spotify-note">Shown live on {{ profile?.username }}'s ollo page and stream overlay.</div>
      </div>
      <button v-if="track && isMe" class="post-track-btn" @click="postTrack">Post this track</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';

definePageMeta({ layout: 'app', hideTabs: true });

const route = useRoute();
const username = route.params.username as string;
const user = useSupabaseUser();

const profile = ref<any>(null);
const track = ref<any>(null);
const positionMs = ref(0);
const durationMs = ref(0);
let pollHandle: any = null;

const isMe = computed(() => profile.value && user.value && profile.value.id === user.value.id);
const progressPct = computed(() => (durationMs.value ? Math.min(100, (positionMs.value / durationMs.value) * 100) : 0));

function formatMs(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'f4c0d55175314b9a843c864e48b863a1',
        client_secret: '3f30cba020ed435ea8c0dae40069f93d',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token as string;
  } catch (e) {
    console.error('Error refreshing Spotify token:', e);
    return null;
  }
}

async function fetchCurrentlyPlaying(accessToken: string, refreshToken: string) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.data?.item) {
      track.value = response.data.item;
      durationMs.value = response.data.item.duration_ms;
      positionMs.value = response.data.progress_ms;
    } else {
      track.value = null;
    }
  } catch (e: any) {
    if (e.response?.status === 401) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) await fetchCurrentlyPlaying(newToken, refreshToken);
    } else {
      console.error('Error fetching currently playing track:', e.message);
    }
  }
}

function postTrack() {
  if (!track.value) return;
  const artists = track.value.artists?.map((a: any) => a.name).join(', ');
  navigateTo({ path: '/app/compose', query: { prefill: `Now playing: ${track.value.name} — ${artists}` } });
}

onMounted(async () => {
  const profiles: any[] = await $fetch('/api/profiles');
  profile.value = profiles.find((p) => p.username === username);
  if (!profile.value?.spotify) return;

  await fetchCurrentlyPlaying(profile.value.spotify, profile.value.spotify_refresh);
  pollHandle = setInterval(() => fetchCurrentlyPlaying(profile.value.spotify, profile.value.spotify_refresh), 5000);
});

onUnmounted(() => {
  if (pollHandle) clearInterval(pollHandle);
});
</script>

<style scoped>
.spotify-screen { flex: 1; display: flex; flex-direction: column; background: linear-gradient(180deg,#1e2a1f 0%,#0d1220 55%); padding: calc(env(safe-area-inset-top, 0) + 14px) 20px calc(env(safe-area-inset-bottom, 0) + 24px); box-sizing: border-box; }
.spotify-topbar { display: flex; align-items: center; justify-content: space-between; flex: none; }
.spotify-back { width: 36px; height: 36px; border: none; cursor: pointer; border-radius: 100px; background: rgba(0,0,0,.4); color: #fff; font-size: 15px; }
.spotify-label { font: 700 12px Quicksand, sans-serif; color: #1db954; text-transform: uppercase; letter-spacing: .1em; }
.spotify-spacer { width: 36px; }
.spotify-main { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 26px; }
.spotify-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.5); font: 600 14px Quicksand, sans-serif; }
.spotify-art { aspect-ratio: 1; border-radius: 26px; background: repeating-linear-gradient(135deg,#242424 0 12px,#151515 12px 24px); display: flex; align-items: center; justify-content: center; font: 500 11px ui-monospace, Menlo, monospace; color: rgba(255,255,255,.45); box-shadow: 0 24px 70px rgba(0,0,0,.55); overflow: hidden; }
.spotify-art img { width: 100%; height: 100%; object-fit: cover; }
.spotify-title { font: 700 26px/1.2 Quicksand, sans-serif; }
.spotify-artist { font: 600 16px Quicksand, sans-serif; color: rgba(255,255,255,.6); margin-top: 5px; }
.progress-track { margin-top: 18px; height: 5px; border-radius: 2.5px; background: #4b4b4b; position: relative; overflow: hidden; }
.progress-fill { position: absolute; inset: 0; background: #1db954; border-radius: 20px; }
.progress-times { display: flex; justify-content: space-between; font: 600 12px Quicksand, sans-serif; color: rgba(255,255,255,.5); margin-top: 8px; }
.spotify-bottom { display: flex; flex-direction: column; gap: 12px; flex: none; }
.spotify-note-row { background: #141a27; border-radius: 20px; padding: 15px; display: flex; align-items: center; gap: 12px; }
.spotify-note-avatar { width: 38px; height: 38px; border-radius: 100px; object-fit: cover; flex: none; }
.spotify-note { font: 600 13px/1.45 Quicksand, sans-serif; color: rgba(255,255,255,.75); flex: 1; }
.post-track-btn { border: none; cursor: pointer; background: #fff; color: #212121; border-radius: 100px; padding: 15px; font: 700 15px Quicksand, sans-serif; text-transform: uppercase; }
</style>
