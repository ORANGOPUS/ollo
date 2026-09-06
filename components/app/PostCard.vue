<template>
  <div class="post-card">
    <div class="post-head">
      <NuxtLink :to="`/app/${post.username}`" class="post-avatar" :style="post.avatar ? {} : { background: tintFor(post.username) }">
        <img v-if="post.avatar" :src="post.avatar" :alt="post.username" />
        <span v-else>{{ initialOf(post.username) }}</span>
      </NuxtLink>
      <div class="post-who">
        <div class="post-name">
          {{ post.displayname || post.username }}
          <span v-if="post.verified" class="post-verified">✓</span>
        </div>
        <div class="post-meta">@{{ post.username }} · {{ ago }}</div>
      </div>
      <span class="post-more">···</span>
    </div>

    <div class="post-body">{{ post.content }}</div>

    <div class="post-actions">
      <button class="post-like" :class="{ liked: post.liked }" @click="$emit('toggle-like')">
        {{ post.liked ? '♥' : '♡' }} {{ post.likes || 0 }}
      </button>
      <button class="post-reply" @click="$emit('toggle-reply')">reply</button>
      <div v-if="likers.length" class="post-likers">
        <NuxtLink v-for="l in likers" :key="l.username" :to="`/app/${l.username}`" class="liker" :style="l.avatar ? {} : { background: tintFor(l.username) }">
          <img v-if="l.avatar" :src="l.avatar" :alt="l.username" />
          <span v-else>{{ initialOf(l.username) }}</span>
        </NuxtLink>
      </div>
    </div>

    <slot name="reply-form" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const props = defineProps<{
  post: {
    id: number;
    username: string;
    displayname?: string | null;
    avatar?: string | null;
    verified?: boolean;
    content: string;
    published_at?: string;
    likes?: number;
    liked?: boolean;
  };
  likers?: { username: string; avatar?: string | null }[];
}>();

defineEmits(['toggle-like', 'toggle-reply']);

const likers = computed(() => (props.likers || []).slice(0, 3));

const ago = computed(() => {
  if (!props.post.published_at) return '';
  const offsetMs = new Date().getTimezoneOffset() * -1 * 60 * 1000;
  return dayjs(new Date(props.post.published_at).getTime() + offsetMs).fromNow();
});
</script>

<style scoped>
.post-card {
  background: #141a27;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
}

.post-head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.post-avatar {
  border: none;
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 100px;
  color: #0e131f;
  font: 700 16px Quicksand, sans-serif;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-who {
  min-width: 0;
  flex: 1;
}

.post-name {
  font: 700 15.5px Quicksand, sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
}

.post-verified {
  background: #0472d8;
  color: #fff;
  border-radius: 100px;
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}

.post-meta {
  font: 600 13px Quicksand, sans-serif;
  color: #9a9da6;
}

.post-more {
  font: 600 11px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.3);
}

.post-body {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 16px;
  padding: 14px 15px;
  margin-top: 12px;
  font: 600 14.5px/1.55 Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.92);
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.post-like,
.post-reply {
  border: none;
  cursor: pointer;
  border-radius: 100px;
  padding: 8px 14px;
  font: 700 13px Quicksand, sans-serif;
  display: flex;
  align-items: center;
  gap: 7px;
}

.post-like {
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}

.post-like.liked {
  background: rgba(4, 216, 127, 0.16);
  color: #04d87f;
}

.post-reply {
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}

.post-likers {
  margin-left: auto;
  display: flex;
}

.liker {
  width: 24px;
  height: 24px;
  border-radius: 100px;
  border: 2px solid #141a27;
  margin-left: -7px;
  font: 700 10px Quicksand, sans-serif;
  color: #0e131f;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.liker img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
