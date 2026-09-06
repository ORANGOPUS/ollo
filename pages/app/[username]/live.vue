<template>
  <div v-if="profile" class="live-screen">
    <div class="live-video">
      <ClientOnly>
        <Video v-if="call && remoteParticipant" :call="call" :participant="remoteParticipant" />
        <span v-else class="live-placeholder">live video</span>
      </ClientOnly>
      <button class="live-back" @click="$router.back()">‹</button>
      <div class="live-badges">
        <span class="live-badge">live</span>
      </div>
    </div>
    <div class="live-who">
      <div class="live-avatar" :style="profile.avatar ? {} : { background: tintFor(profile.username) }">
        <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.username" />
        <span v-else>{{ initialOf(profile.username) }}</span>
      </div>
      <div class="live-who-text">
        <div class="live-name">{{ profile.displayname || profile.username }}</div>
        <div class="live-handle">@{{ profile.username }}{{ profile.game ? ` · ${profile.game}` : '' }}</div>
      </div>
      <a v-if="profile.pally" :href="`https://pally.gg/${profile.pally}`" target="_blank" class="tip-btn">Tip</a>
    </div>
    <div class="live-chat">
      <div v-for="m in messages" :key="m.id" class="chat-msg">
        <div class="chat-avatar" :style="m.avatar ? {} : { background: tintFor(m.username) }">
          <img v-if="m.avatar" :src="m.avatar" :alt="m.username" />
          <span v-else>{{ initialOf(m.username) }}</span>
        </div>
        <div class="chat-text"><span class="chat-user">{{ m.username }}</span>{{ m.text }}</div>
      </div>
    </div>
    <div class="live-input-row">
      <input v-model="newMessage" class="live-input" placeholder="Type a message" @keyup.enter="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import useStreamStore from '@/stores/getstream.client';

definePageMeta({ layout: 'app', hideTabs: true });

const route = useRoute();
const username = route.params.username as string;
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const profile = ref<any>(null);
const messages = ref<any[]>([]);
const newMessage = ref('');
const profilesById = ref<Record<string, any>>({});

// Client-only: GetStream needs VITE_APP_API_KEY/VITE_APP_TOKEN and is only
// usable once hydrated in the browser.
const store = import.meta.client ? useStreamStore() : null;
const { call, remoteParticipant } = store ? storeToRefs(store) : { call: ref(undefined), remoteParticipant: ref(undefined) };

async function fetchMessages() {
  const { data, error } = await supabase.from('chat').select('*').eq('channel', username).order('created_at', { ascending: true });
  if (error) return console.error(error.message);
  messages.value = (data || []).map((m: any) => ({
    id: m.id,
    text: m.content,
    username: profilesById.value[m.user_id]?.username || 'Unknown',
    avatar: profilesById.value[m.user_id]?.avatar,
  }));
}

async function sendMessage() {
  if (!user.value || !newMessage.value.trim()) return;
  const { error } = await supabase.from('chat').insert([{ user_id: user.value.id, content: newMessage.value, channel: username }]);
  if (error) return console.error(error.message);
  newMessage.value = '';
  await fetchMessages();
}

onMounted(async () => {
  const profiles: any[] = await $fetch('/api/profiles');
  profilesById.value = Object.fromEntries(profiles.map((p) => [p.id, p]));
  profile.value = profiles.find((p) => p.username === username);
  await fetchMessages();
  await store?.watchStream(username);
});
</script>

<style scoped>
.live-screen { flex: 1; display: flex; flex-direction: column; background: #0d1220; min-height: 0; }
.live-video { position: relative; aspect-ratio: 16/9; background: repeating-linear-gradient(115deg,#1c2438 0 12px,#141b2b 12px 24px); flex: none; display: flex; align-items: center; justify-content: center; }
.live-placeholder { font: 500 11px ui-monospace, Menlo, monospace; color: rgba(255,255,255,.4); }
.live-back { position: absolute; top: calc(env(safe-area-inset-top, 0) + 12px); left: 12px; width: 36px; height: 36px; border: none; cursor: pointer; border-radius: 100px; background: rgba(0,0,0,.55); color: #fff; font-size: 15px; }
.live-badges { position: absolute; top: calc(env(safe-area-inset-top, 0) + 14px); right: 12px; display: flex; gap: 8px; align-items: center; }
.live-badge { background: #dc3545; color: #fff; border-radius: 100px; padding: 5px 11px; font: 700 11px Quicksand, sans-serif; text-transform: uppercase; }
.live-who { padding: 14px 16px; display: flex; align-items: center; gap: 12px; flex: none; }
.live-avatar { width: 52px; height: 52px; border-radius: 16px; color: #0e131f; font: 700 20px Quicksand, sans-serif; display: flex; align-items: center; justify-content: center; flex: none; overflow: hidden; }
.live-avatar img { width: 100%; height: 100%; object-fit: cover; }
.live-who-text { min-width: 0; flex: 1; }
.live-name { font: 700 17px Quicksand, sans-serif; }
.live-handle { font: 600 13px Quicksand, sans-serif; color: #9a9da6; }
.tip-btn { border: none; cursor: pointer; background: #fff; color: #212121; border-radius: 100px; padding: 10px 16px; font: 700 12.5px Quicksand, sans-serif; text-transform: uppercase; text-decoration: none; }
.live-chat { flex: 1; overflow: auto; padding: 0 12px; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { display: flex; gap: 10px; align-items: flex-start; }
.chat-avatar { width: 30px; height: 30px; border-radius: 100px; color: #0e131f; font: 700 12px Quicksand, sans-serif; display: flex; align-items: center; justify-content: center; flex: none; overflow: hidden; }
.chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
.chat-text { font: 600 13.5px/1.45 Quicksand, sans-serif; }
.chat-user { background: #0F141F; border-radius: 20px; padding: 3px 10px; font-weight: 700; margin-right: 7px; }
.live-input-row { padding: 12px; padding-bottom: calc(env(safe-area-inset-bottom, 0) + 12px); flex: none; }
.live-input { width: 100%; box-sizing: border-box; background: #0F141F; border: none; outline: none; color: #fff; border-radius: 31px; padding: 15px 18px; font: 700 14px Quicksand, sans-serif; }
</style>
