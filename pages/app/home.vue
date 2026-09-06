<template>
  <div class="home-screen">
    <div class="home-header">
      <div class="home-brand">
        <img src="/logo.svg" alt="ollo" class="home-logo" />
        <span class="home-title">ollo</span>
      </div>
      <div class="home-header-actions">
        <NuxtLink v-if="myUsername" :to="`/app/${myUsername}/spotify`" class="icon-btn spotify">♫</NuxtLink>
        <NuxtLink to="/app/activity" class="icon-btn">
          ◔<span class="icon-dot" />
        </NuxtLink>
      </div>
    </div>

    <div class="home-body">
      <div v-if="liveNow.length" class="live-rail">
        <NuxtLink
          v-for="p in liveNow"
          :key="p.username"
          :to="p.isLive ? `/app/${p.username}/live` : `/app/${p.username}`"
          class="live-item"
        >
          <div class="live-ring" :style="{ background: p.isLive ? '#dc3545' : 'rgba(255,255,255,.12)' }">
            <div class="live-avatar" :style="p.avatar ? {} : { background: tintFor(p.username) }">
              <img v-if="p.avatar" :src="p.avatar" :alt="p.username" />
              <span v-else>{{ initialOf(p.username) }}</span>
            </div>
          </div>
          <span class="live-name">{{ p.username }}</span>
        </NuxtLink>
      </div>

      <NuxtLink to="/app/compose" class="compose-bar">
        <img :src="myAvatar || '/avatar.png'" alt="you" class="compose-avatar" />
        <span class="compose-placeholder">What have you done today?</span>
        <span class="compose-cta">Post</span>
      </NuxtLink>

      <template v-for="post in posts" :key="post.id">
        <AppPostCard
          :post="post"
          :likers="likersFor(post.id)"
          @toggle-like="toggleLike(post)"
          @toggle-reply="toggleReplyInput(post.id)"
        >
          <template v-if="replyInputs[post.id]" #reply-form>
            <form class="reply-form" @submit.prevent="handleReplySubmit(post.id)">
              <textarea v-model="replyContent" class="reply-input" placeholder="Write a reply..." />
              <button type="submit" class="reply-submit">Reply</button>
            </form>
          </template>
        </AppPostCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

definePageMeta({ layout: 'app', tab: 'home' });

const supabase = useSupabaseClient();
const user = useSupabaseUser();

watchEffect(() => {
  if (!user.value) navigateTo('/app/login');
});

const posts = ref<any[]>([]);
const likes = ref<any[]>([]);
const replyInputs = reactive<Record<number, boolean>>({});
const replyContent = ref('');
const liveProfiles = ref<any[]>([]);
const myProfile = ref<any>(null);

const myUsername = computed(() => myProfile.value?.username);
const myAvatar = computed(() => myProfile.value?.avatar_url || myProfile.value?.avatar);

const liveNow = computed(() => {
  const live = liveProfiles.value.filter((p) => p.isLive);
  const rest = liveProfiles.value.filter((p) => !p.isLive).slice(0, 3);
  return [...live, ...rest];
});

function likersFor(postId: number) {
  return likes.value.filter((l) => l.post_id === postId).slice(0, 3);
}

async function fetchPosts() {
  const { data, error } = await supabase.from('posts_with_likes').select().order('id', { ascending: false });
  if (error) return console.error('Error fetching posts:', error.message);

  const postIds = data.map((p: any) => p.id);
  const { data: likesData } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.value?.id)
    .in('post_id', postIds);
  const likedIds = new Set((likesData || []).map((l: any) => l.post_id));

  posts.value = data.map((p: any) => ({ ...p, likes: p.likes || 0, liked: likedIds.has(p.id) }));
}

async function fetchLikes() {
  const { data, error } = await supabase.from('likes_with_profiles').select('*');
  if (error) return console.error('Error fetching likes:', error.message);
  likes.value = data;
}

async function toggleLike(post: any) {
  if (!user.value) return;
  if (post.liked) {
    const { error } = await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.value.id);
    if (error) return console.error(error.message);
    post.likes -= 1;
    post.liked = false;
  } else {
    const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.value.id });
    if (error) return console.error(error.message);
    post.likes += 1;
    post.liked = true;
  }
  await fetchLikes();
}

function toggleReplyInput(postId: number) {
  replyInputs[postId] = !replyInputs[postId];
}

async function handleReplySubmit(postId: number) {
  if (!user.value || !replyContent.value.trim()) return;
  const { error } = await supabase.from('replies').insert([{ content: replyContent.value, post_id: postId, user_id: user.value.id }]);
  if (error) return console.error(error.message);
  replyContent.value = '';
  replyInputs[postId] = false;
}

async function fetchMyProfile() {
  const profiles = await $fetch('/api/profiles');
  myProfile.value = (profiles as any[]).find((p) => p.id === user.value?.id) || null;
}

const STREAM_API_KEY = 'qxhh2h2czs7x';
async function checkIfLive(username: string) {
  try {
    const res = await fetch(`https://video.stream-io-api.com/api/v2/video/call/livestream/${username}?api_key=${STREAM_API_KEY}`, {
      headers: {
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoib3JhbmdvcHVzIn0.Rt3FIvYcUMOdx6o-MUBCLZOdmn9lfXbTJ5Qg_yvRQ_0',
        'stream-auth-type': 'jwt',
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.live;
  } catch {
    return false;
  }
}

async function fetchLiveRail() {
  const profiles = await $fetch('/api/profiles');
  const sample = (profiles as any[]).filter((p) => p.username).slice(0, 8);
  const withStatus = await Promise.all(sample.map(async (p) => ({ ...p, isLive: await checkIfLive(p.username) })));
  liveProfiles.value = withStatus;
}

onMounted(async () => {
  await fetchMyProfile();
  await fetchPosts();
  await fetchLikes();
  await fetchLiveRail();
});
</script>

<style scoped>
.home-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0) + 12px) 16px 10px;
  flex: none;
}

.home-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.home-logo {
  width: 30px;
}

.home-title {
  font: 700 21px Quicksand, sans-serif;
}

.home-header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border: none;
  cursor: pointer;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-decoration: none;
}

.icon-btn.spotify {
  color: #1db954;
}

.icon-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 100px;
  background: #dc3545;
}

.home-body {
  flex: 1;
  overflow: auto;
  padding: 0 12px 12px;
}

.live-rail {
  display: flex;
  gap: 10px;
  overflow: auto;
  padding: 4px 4px 14px;
}

.live-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: none;
  width: 64px;
  text-decoration: none;
}

.live-ring {
  width: 56px;
  height: 56px;
  border-radius: 100px;
  padding: 2.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-avatar {
  width: 100%;
  height: 100%;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 19px Quicksand, sans-serif;
  color: #0e131f;
  overflow: hidden;
}

.live-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-name {
  font: 600 11px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.65);
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compose-bar {
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
  background: #141a27;
  border-radius: 20px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  text-decoration: none;
  box-sizing: border-box;
}

.compose-avatar {
  width: 38px;
  height: 38px;
  border-radius: 100px;
  object-fit: cover;
  flex: none;
}

.compose-placeholder {
  font: 700 15px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.42);
}

.compose-cta {
  margin-left: auto;
  background: #fff;
  color: #212121;
  border-radius: 100px;
  padding: 7px 14px;
  font: 700 12px Quicksand, sans-serif;
  text-transform: uppercase;
}

.reply-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  background: rgba(0, 0, 0, 0.25);
  border: none;
  outline: none;
  color: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  font: 600 13px Quicksand, sans-serif;
  resize: none;
  min-height: 60px;
}

.reply-submit {
  align-self: flex-end;
  border: none;
  cursor: pointer;
  background: #fff;
  color: #212121;
  border-radius: 100px;
  padding: 8px 16px;
  font: 700 12px Quicksand, sans-serif;
  text-transform: uppercase;
}
</style>
