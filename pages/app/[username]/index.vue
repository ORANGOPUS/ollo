<template>
  <div v-if="profile" class="profile-screen">
    <div class="profile-body">
      <div class="profile-banner" :style="profile.background_url ? { backgroundImage: `url(https://${profile.background_url})`, backgroundSize: 'cover' } : {}">
        <button class="profile-back" @click="$router.back()">‹</button>
      </div>
      <div class="profile-main">
        <div class="profile-top">
          <div class="profile-avatar" :style="profile.avatar ? {} : { background: tintFor(profile.username) }">
            <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.username" />
            <span v-else>{{ initialOf(profile.username) }}</span>
          </div>
          <NuxtLink v-if="isLive" :to="`/app/${profile.username}/live`" class="watch-live">Watch live</NuxtLink>
        </div>
        <div class="profile-name">
          {{ profile.displayname || profile.username }}
          <span v-if="profile.verified" class="profile-verified">✓</span>
        </div>
        <div class="profile-handle">@{{ profile.username }}</div>
        <div v-if="profile.bio" class="profile-bio">{{ profile.bio }}</div>

        <div class="profile-stats">
          <div class="stat"><b>{{ posts.length }}</b> <span>posts</span></div>
          <div class="stat"><b>{{ hi5Total }}</b> <span>hi-5s</span></div>
        </div>

        <div v-if="social.length" class="profile-socials">
          <a v-for="s in social" :key="s.id" :href="s.url" target="_blank" class="social-chip" :style="{ background: s.background_color, color: s.color }">
            <Icon :name="`fa6-brands:${s.icon}`" />
          </a>
        </div>

        <NuxtLink v-if="profile.spotify" :to="`/app/${profile.username}/spotify`" class="spotify-preview">
          <div class="spotify-art">album<br />art</div>
          <div class="spotify-info">
            <div class="spotify-label">Now playing</div>
            <div class="spotify-track">Live on their profile</div>
          </div>
        </NuxtLink>

        <div class="profile-tabs">
          <button v-for="t in profileTabs" :key="t" class="profile-pill" :class="{ active: tab === t }" @click="tab = t">
            {{ t }}
          </button>
        </div>

        <template v-if="tab === 'Posts'">
          <div v-if="!posts.length" class="empty-note">Nothing here yet — this profile's posts land in this column.</div>
          <AppPostCard v-for="p in posts" :key="p.id" :post="p" :likers="[]" @toggle-like="toggleLike(p)" @toggle-reply="() => {}" />
        </template>

        <div v-else-if="tab === 'About'" class="about-card">
          <MDC :value="profile.html || ''" />
        </div>

        <div v-else-if="tab === 'VODs'" class="vods-grid">
          <div v-if="!recordings.length" class="empty-note">No recordings yet.</div>
          <div v-for="(r, i) in recordings" :key="i" class="vod-card">
            <video class="vod-video" :src="r.url" controls />
          </div>
        </div>

        <div v-else-if="tab === 'Tracks'" class="tracks-list">
          <div v-if="!tracks.length" class="empty-note">No tracks found.</div>
          <a v-for="track in tracks" :key="track.id" :href="`https://audius.co/tracks/${track.id}`" target="_blank" class="track-row">
            <img :src="track.artwork?.['150x150']" class="track-art" />
            <div>
              <div class="track-title">{{ track.title }}</div>
              <div class="track-artist">{{ track.user?.name }}</div>
            </div>
          </a>
        </div>

        <div v-else-if="tab === 'Repos'" class="repos-list">
          <div v-if="!repos.length" class="empty-note">No public repositories linked.</div>
          <a v-for="repo in repos" :key="repo.id" :href="repo.html_url" target="_blank" class="repo-card">
            <div class="repo-head">
              <span class="repo-name">{{ repo.name }}</span>
              <span class="repo-vis">{{ repo.visibility }}</span>
            </div>
            <div class="repo-desc">{{ repo.description }}</div>
            <div class="repo-meta">{{ repo.language }} · {{ repo.stargazers_count }} ⭐</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import useStreamStore from '@/stores/getstream.client';

definePageMeta({ layout: 'app' });

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const username = route.params.username as string;
const profile = ref<any>(null);
const social = ref<any[]>([]);
const posts = ref<any[]>([]);
const tracks = ref<any[]>([]);
const repos = ref<any[]>([]);
const recordings = ref<any[]>([]);

const profileTabs = ['Posts', 'About', 'VODs', 'Tracks', 'Repos'] as const;
const tab = ref<(typeof profileTabs)[number]>('Posts');

// GetStream needs VITE_APP_API_KEY/VITE_APP_TOKEN and is only relevant once
// hydrated in the browser, so the store is created client-side only — this
// keeps the profile screen (and its SSR render) working even when live
// video isn't configured for the current environment.
const store = import.meta.client ? useStreamStore() : null;
const { call, remoteParticipant } = store ? storeToRefs(store) : { call: ref(undefined), remoteParticipant: ref(undefined) };
const isLive = computed(() => !!(call.value && remoteParticipant.value));
const hi5Total = computed(() => posts.value.reduce((sum, p) => sum + (p.likes || 0), 0));

async function fetchPosts() {
  const { data, error } = await supabase.from('posts_with_likes').select().order('id', { ascending: false }).eq('username', username);
  if (error) return console.error(error.message);
  const ids = (data || []).map((p: any) => p.id);
  const { data: likesData } = await supabase.from('likes').select('post_id').eq('user_id', user.value?.id).in('post_id', ids.length ? ids : [-1]);
  const likedIds = new Set((likesData || []).map((l: any) => l.post_id));
  posts.value = (data || []).map((p: any) => ({ ...p, likes: p.likes || 0, liked: likedIds.has(p.id) }));
}

async function toggleLike(post: any) {
  if (!user.value) return;
  if (post.liked) {
    await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.value.id);
    post.likes -= 1;
    post.liked = false;
  } else {
    await supabase.from('likes').insert({ post_id: post.id, user_id: user.value.id });
    post.likes += 1;
    post.liked = true;
  }
}

async function fetchTracks() {
  try {
    const res = await $fetch(`https://discoveryprovider.audius.co/v1/users/handle/${username}/tracks`);
    tracks.value = (res as any)?.data || [];
  } catch (e) {
    console.error('Error fetching tracks:', e);
  }
}

async function fetchRepos(gitUsername?: string) {
  if (!gitUsername) return;
  try {
    repos.value = (await $fetch(`https://api.github.com/users/${gitUsername}/repos`)) as any[];
  } catch (e) {
    console.error('Error fetching repos:', e);
  }
}

async function fetchRecordings() {
  try {
    if (call.value) {
      const res = await call.value.queryRecordings();
      recordings.value = res?.recordings || [];
    }
  } catch (e) {
    console.error('Error fetching recordings:', e);
  }
}

onMounted(async () => {
  const profiles: any[] = await $fetch('/api/profiles');
  profile.value = profiles.find((p) => p.username === username);
  if (!profile.value) return;

  const socials: any[] = await $fetch('/api/socials');
  social.value = socials.filter((s) => s.user_id === profile.value.id);
  const git = social.value.find((s) => s.name === 'GitHub');
  const gitUsername = git?.url?.split('/')[3];

  await fetchPosts();
  await fetchTracks();
  await fetchRepos(gitUsername);
  await store?.watchStream(username);
  await fetchRecordings();

  useHead({
    title: `${profile.value.displayname || profile.value.username} on ollo`,
    style: profile.value.css ? [{ innerHTML: profile.value.css }] : [],
  });
});

watch(call, fetchRecordings);
</script>

<style scoped>
.profile-screen { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.profile-body { flex: 1; overflow: auto; }
.profile-banner { height: 132px; background: repeating-linear-gradient(115deg,#243050 0 10px,#1e2942 10px 20px); position: relative; }
.profile-back { position: absolute; top: calc(env(safe-area-inset-top, 0) + 12px); left: 12px; width: 36px; height: 36px; border: none; cursor: pointer; border-radius: 100px; background: rgba(0,0,0,.5); color: #fff; font-size: 15px; }
.profile-main { padding: 0 16px 16px; margin-top: -42px; position: relative; z-index: 1; }
.profile-top { display: flex; align-items: flex-end; justify-content: space-between; }
.profile-avatar { width: 84px; height: 84px; border-radius: 100px; border: 4px solid #1a2235; display: flex; align-items: center; justify-content: center; font: 700 30px Quicksand, sans-serif; color: #0e131f; box-shadow: 0 0 40px rgba(0,0,0,.5); overflow: hidden; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.watch-live { border: none; cursor: pointer; background: #dc3545; color: #fff; border-radius: 100px; padding: 10px 16px; font: 700 13px Quicksand, sans-serif; text-transform: uppercase; text-decoration: none; margin-bottom: 6px; }
.profile-name { margin-top: 12px; font: 700 23px Quicksand, sans-serif; display: flex; align-items: center; gap: 7px; }
.profile-verified { background: #0472d8; color: #fff; border-radius: 100px; width: 17px; height: 17px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
.profile-handle { font: 600 14.5px Quicksand, sans-serif; color: #9a9da6; }
.profile-bio { margin-top: 10px; font: 600 14.5px/1.5 Quicksand, sans-serif; color: rgba(255,255,255,.85); }
.profile-stats { display: flex; gap: 18px; margin-top: 14px; }
.stat { font: 700 15px Quicksand, sans-serif; }
.stat span { color: #9a9da6; font-weight: 600; font-size: 13px; }
.profile-socials { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.social-chip { width: 46px; height: 46px; border-radius: 100px; display: flex; align-items: center; justify-content: center; font-size: 17px; text-decoration: none; }
.spotify-preview { width: 100%; text-align: left; border: none; cursor: pointer; margin-top: 16px; background: #000; border-radius: 20px; padding: 12px; display: flex; align-items: center; gap: 12px; text-decoration: none; box-sizing: border-box; }
.spotify-art { width: 54px; height: 54px; border-radius: 14px; background: repeating-linear-gradient(135deg,#232323 0 7px,#151515 7px 14px); flex: none; display: flex; align-items: center; justify-content: center; font: 500 8px ui-monospace, Menlo, monospace; color: rgba(255,255,255,.45); text-align: center; }
.spotify-label { font: 600 10px Quicksand, sans-serif; color: #1db954; text-transform: uppercase; letter-spacing: .08em; }
.spotify-track { font: 700 14.5px Quicksand, sans-serif; margin-top: 3px; color: #fff; }
.profile-tabs { display: flex; gap: 8px; margin-top: 18px; overflow: auto; padding-bottom: 2px; }
.profile-pill { flex: none; border: none; cursor: pointer; background: rgba(0,0,0,.28); color: rgba(255,255,255,.75); border-radius: 100px; padding: 9px 16px; font: 700 13px Quicksand, sans-serif; }
.profile-pill.active { background: #fff; color: #212121; }
.empty-note { color: rgba(255,255,255,.5); font: 600 13.5px/1.5 Quicksand, sans-serif; padding: 16px 4px; }
.about-card { background: #141a27; border-radius: 20px; padding: 18px; margin-top: 12px; font: 600 14.5px/1.6 Quicksand, sans-serif; color: rgba(255,255,255,.85); }
.vods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
.vod-card { border-radius: 16px; overflow: hidden; }
.vod-video { width: 100%; border-radius: 16px; }
.tracks-list { background: #000; border-radius: 20px; padding: 14px; margin-top: 12px; display: flex; flex-direction: column; gap: 14px; }
.track-row { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.track-art { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; flex: none; }
.track-title { font: 700 14px Quicksand, sans-serif; color: #fff; }
.track-artist { font: 600 12.5px Quicksand, sans-serif; color: #9a9da6; }
.repos-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.repo-card { background: #141a27; border-radius: 18px; padding: 15px; text-decoration: none; display: block; }
.repo-head { display: flex; justify-content: space-between; align-items: center; }
.repo-name { font: 700 14.5px Quicksand, sans-serif; color: #fff; }
.repo-vis { background: #fff; color: #000; border-radius: 25px; padding: 3px 10px; font: 700 11px Quicksand, sans-serif; }
.repo-desc { font: 600 13px/1.5 Quicksand, sans-serif; color: rgba(255,255,255,.7); margin-top: 6px; }
.repo-meta { font: 600 12px Quicksand, sans-serif; color: #9a9da6; margin-top: 6px; }
</style>
