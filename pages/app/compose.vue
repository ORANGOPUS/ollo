<template>
  <div class="compose-screen">
    <div class="compose-header">
      <button class="compose-cancel" @click="$router.back()">Cancel</button>
      <button class="compose-submit" :disabled="posting" @click="submitPost">Post</button>
    </div>
    <div class="compose-main">
      <img :src="myAvatar || '/avatar.png'" alt="you" class="compose-avatar" />
      <textarea v-model="draft" class="compose-input" placeholder="What have you done today?" />
    </div>
    <div class="compose-footer">
      <div class="compose-chips">
        <span class="chip">↓ markdown</span>
        <span class="chip">rich embed</span>
        <span class="chip">image</span>
        <span class="chip green">♫ now playing</span>
      </div>
      <div class="compose-count">{{ draft.length }}/500 · posts to ollo.bio/{{ myUsername }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', hideTabs: true });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();

watchEffect(() => {
  if (!user.value) navigateTo('/app/login');
});

const draft = ref(typeof route.query.prefill === 'string' ? route.query.prefill : '');
const posting = ref(false);
const myProfile = ref<any>(null);
const myUsername = computed(() => myProfile.value?.username);
const myAvatar = computed(() => myProfile.value?.avatar_url || myProfile.value?.avatar);

onMounted(async () => {
  const profiles = await $fetch('/api/profiles');
  myProfile.value = (profiles as any[]).find((p) => p.id === user.value?.id) || null;
});

async function submitPost() {
  const content = draft.value.trim();
  if (!content || !user.value) return navigateTo('/app/home');
  posting.value = true;
  const { error } = await supabase.from('posts').insert([{ content, user_id: user.value.id }]);
  posting.value = false;
  if (error) return console.error(error.message);
  navigateTo('/app/home');
}
</script>

<style scoped>
.compose-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.compose-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0) + 12px) 16px 12px;
}

.compose-cancel {
  border: none;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  border-radius: 100px;
  padding: 9px 16px;
  font: 700 13px Quicksand, sans-serif;
}

.compose-submit {
  border: none;
  cursor: pointer;
  background: #fff;
  color: #212121;
  border-radius: 100px;
  padding: 10px 22px;
  font: 700 14px Quicksand, sans-serif;
  text-transform: uppercase;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.35);
}

.compose-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.compose-main {
  flex: 1;
  padding: 6px 16px 0;
  display: flex;
  gap: 12px;
  overflow: auto;
}

.compose-avatar {
  width: 42px;
  height: 42px;
  border-radius: 100px;
  object-fit: cover;
  flex: none;
}

.compose-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #fff;
  font: 600 19px/1.5 Quicksand, sans-serif;
  padding-top: 8px;
}

.compose-footer {
  padding: 12px 16px calc(env(safe-area-inset-bottom, 0) + 16px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compose-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  background: rgba(0, 0, 0, 0.28);
  border-radius: 100px;
  padding: 9px 14px;
  font: 700 12.5px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.75);
}

.chip.green {
  color: #1db954;
}

.compose-count {
  font: 600 12.5px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.4);
}
</style>
