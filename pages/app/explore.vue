<template>
  <div class="explore-screen">
    <div class="explore-header">
      <div class="explore-title-row">
        <span class="explore-title">Explore</span>
        <span class="explore-count">{{ profiles.length }}</span>
      </div>
      <input
        v-model="search"
        class="explore-search"
        placeholder="Search for an ollo..."
      />
    </div>
    <div class="explore-body">
      <div class="explore-grid">
        <NuxtLink v-for="p in filtered" :key="p.id" :to="`/app/${p.username}`" class="explore-card">
          <div class="explore-avatar" :style="p.avatar_url || p.avatar ? {} : { background: tintFor(p.username) }">
            <img v-if="p.avatar_url || p.avatar" :src="p.avatar_url || p.avatar" :alt="p.username" />
            <span v-else>{{ initialOf(p.username) }}</span>
          </div>
          <div class="explore-username">{{ p.username }}</div>
          <div class="explore-followers">{{ hi5sFor(p.username) }} hi-5s</div>
          <span v-if="p.isLive" class="explore-live">live</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', tab: 'explore' });

const search = ref('');
const profiles = ref<any[]>([]);
const hi5Totals = ref<Record<string, number>>({});

const STREAM_API_KEY = 'qxhh2h2czs7x';

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return profiles.value
    .filter((p) => p.username && p.username.toLowerCase().includes(q))
    .sort((a, b) => a.username.localeCompare(b.username));
});

function hi5sFor(username: string) {
  return hi5Totals.value[username] || 0;
}

async function fetchProfiles() {
  const data = await $fetch('/api/profiles');
  profiles.value = (data as any[]).map((p) => ({ ...p, isLive: false }));
  updateLiveStatus();
}

async function fetchHi5Totals() {
  const supabase = useSupabaseClient();
  const { data, error } = await supabase.from('posts_with_likes').select('username, likes');
  if (error) return console.error(error.message);
  const totals: Record<string, number> = {};
  for (const row of data as any[]) {
    totals[row.username] = (totals[row.username] || 0) + (row.likes || 0);
  }
  hi5Totals.value = totals;
}

async function checkIfLive(username: string, retryCount = 0): Promise<boolean> {
  const maxRetries = 3;
  try {
    const response = await fetch(`https://video.stream-io-api.com/api/v2/video/call/livestream/${username}?api_key=${STREAM_API_KEY}`, {
      headers: {
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoib3JhbmdvcHVzIn0.Rt3FIvYcUMOdx6o-MUBCLZOdmn9lfXbTJ5Qg_yvRQ_0',
        'stream-auth-type': 'jwt',
      },
    });
    if (response.status === 429 && retryCount < maxRetries) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** retryCount));
      return checkIfLive(username, retryCount + 1);
    }
    const data = await response.json();
    return !!data.live;
  } catch {
    return false;
  }
}

async function updateLiveStatus() {
  const queue = [...profiles.value];
  const batchSize = 10;
  const processBatch = async () => {
    if (!queue.length) return;
    const batch = queue.splice(0, batchSize);
    await Promise.all(
      batch.map(async (p) => {
        p.isLive = await checkIfLive(p.username);
      })
    );
    setTimeout(processBatch, 5000);
  };
  processBatch();
}

onMounted(async () => {
  await fetchProfiles();
  await fetchHi5Totals();
});
</script>

<style scoped>
.explore-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.explore-header {
  padding: calc(env(safe-area-inset-top, 0) + 14px) 16px 10px;
  flex: none;
}

.explore-title-row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.explore-title {
  font: 700 25px Quicksand, sans-serif;
}

.explore-count {
  background: #0472d8;
  border-radius: 100px;
  padding: 4px 10px;
  font: 700 12px Quicksand, sans-serif;
}

.explore-search {
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  background: #141a27;
  border: none;
  outline: none;
  color: #fff;
  border-radius: 100px;
  padding: 13px 18px;
  font: 700 14.5px Quicksand, sans-serif;
}

.explore-body {
  flex: 1;
  overflow: auto;
  padding: 2px 12px 12px;
}

.explore-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.explore-card {
  border: none;
  cursor: pointer;
  background: #141a27;
  border-radius: 20px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  text-decoration: none;
}

.explore-avatar {
  width: 62px;
  height: 62px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 22px Quicksand, sans-serif;
  color: #0e131f;
  overflow: hidden;
}

.explore-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.explore-username {
  font: 700 15px Quicksand, sans-serif;
  color: #fff;
}

.explore-followers {
  font: 600 12px Quicksand, sans-serif;
  color: #9a9da6;
}

.explore-live {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #dc3545;
  color: #fff;
  border-radius: 100px;
  padding: 3px 9px;
  font: 700 10px Quicksand, sans-serif;
  text-transform: uppercase;
}
</style>
