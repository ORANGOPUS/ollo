<template>
  <div class="activity-screen">
    <div class="activity-header">
      <span class="activity-title">Activity</span>
      <button class="activity-mark" @click="markRead">Mark read</button>
    </div>
    <div class="activity-body">
      <div v-if="!items.length" class="activity-empty">
        No activity yet — hi-5s and replies on your posts show up here.
      </div>
      <div v-for="a in items" :key="a.key" class="activity-row" :class="{ unread: a.unread }">
        <div class="activity-avatar" :style="a.avatar ? {} : { background: tintFor(a.who) }">
          <img v-if="a.avatar" :src="a.avatar" :alt="a.who" />
          <span v-else>{{ initialOf(a.who) }}</span>
        </div>
        <div class="activity-text">
          <div><span class="activity-who">{{ a.who }}</span> {{ a.what }}</div>
          <div class="activity-ago">{{ a.ago }}</div>
        </div>
        <div class="activity-icon" :style="{ color: a.iconColor }">{{ a.icon }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

definePageMeta({ layout: 'app', tab: 'activity' });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const items = ref<any[]>([]);
const lastSeen = ref(0);

watchEffect(() => {
  if (!user.value) navigateTo('/app/login');
});

function markRead() {
  lastSeen.value = Date.now();
  localStorage.setItem('ollo:activitySeenAt', String(lastSeen.value));
  items.value = items.value.map((i) => ({ ...i, unread: false }));
}

async function load() {
  if (!user.value) return;
  const stored = Number(localStorage.getItem('ollo:activitySeenAt') || 0);
  lastSeen.value = stored;

  const profiles: any[] = await $fetch('/api/profiles');
  const byId: Record<string, any> = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const { data: myPosts } = await supabase.from('posts').select('id').eq('user_id', user.value.id);
  const postIds = (myPosts || []).map((p: any) => p.id);
  if (!postIds.length) return;

  const [{ data: likeRows }, { data: replyRows }] = await Promise.all([
    supabase.from('likes').select('user_id, post_id, created_at').in('post_id', postIds),
    supabase.from('replies').select('user_id, post_id, content, created_at').in('post_id', postIds),
  ]);

  const likeItems = (likeRows || [])
    .filter((l: any) => l.user_id !== user.value?.id)
    .map((l: any) => {
      const who = byId[l.user_id]?.username || 'someone';
      const at = new Date(l.created_at).getTime();
      return {
        key: `like-${l.post_id}-${l.user_id}-${l.created_at}`,
        who, what: "hi-5'd your post", icon: '♥', iconColor: '#04d87f',
        avatar: byId[l.user_id]?.avatar_url || byId[l.user_id]?.avatar,
        at, ago: dayjs(at).fromNow(), unread: at > lastSeen.value,
      };
    });

  const replyItems = (replyRows || [])
    .filter((r: any) => r.user_id !== user.value?.id)
    .map((r: any) => {
      const who = byId[r.user_id]?.username || 'someone';
      const at = new Date(r.created_at).getTime();
      return {
        key: `reply-${r.post_id}-${r.created_at}`,
        who, what: `replied: "${(r.content || '').slice(0, 60)}"`, icon: '↩', iconColor: '#7ec8ff',
        avatar: byId[r.user_id]?.avatar_url || byId[r.user_id]?.avatar,
        at, ago: dayjs(at).fromNow(), unread: at > lastSeen.value,
      };
    });

  items.value = [...likeItems, ...replyItems].sort((a, b) => b.at - a.at);
}

onMounted(load);
</script>

<style scoped>
.activity-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.activity-header {
  padding: calc(env(safe-area-inset-top, 0) + 14px) 16px 8px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-title {
  font: 700 25px Quicksand, sans-serif;
}

.activity-mark {
  border: none;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 100px;
  padding: 8px 14px;
  font: 700 12.5px Quicksand, sans-serif;
}

.activity-body {
  flex: 1;
  overflow: auto;
  padding: 4px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-empty {
  color: rgba(255, 255, 255, 0.5);
  font: 600 14px/1.5 Quicksand, sans-serif;
  padding: 24px 8px;
  text-align: center;
}

.activity-row {
  background: #141a27;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-row.unread {
  background: rgba(4, 216, 127, 0.07);
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 100px;
  color: #0e131f;
  font: 700 15px Quicksand, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  overflow: hidden;
}

.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-text {
  min-width: 0;
  flex: 1;
  font: 600 14px/1.45 Quicksand, sans-serif;
}

.activity-who {
  font-weight: 700;
}

.activity-ago {
  font: 600 12px Quicksand, sans-serif;
  color: #9a9da6;
  margin-top: 2px;
}

.activity-icon {
  font-size: 16px;
}
</style>
