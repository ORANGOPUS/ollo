<template>
  <div class="spotify-component">
    <!-- Display currently playing track -->
    <div v-if="currentlyPlaying">
      <div class="track-info">
        <div class="album-cover-container">
          <img :src="currentlyPlaying.album.images[0].url" alt="Album Cover" class="album-cover">
          <img :src="currentlyPlaying.album.images[0].url" alt="Album Cover" class="album-coverimg">
        </div>
        <div class="track-details">
          <p class="bold">{{ currentlyPlaying.name }}</p>
          <p>{{ currentlyPlaying.artists.map(artist => artist.name).join(', ') }}</p>
          <p>Album: {{ currentlyPlaying.album.name }}</p>
          <div class="seek-bar">
        <div class="slider-container">
          <div
            class="spotify-progress"
            :style="{
              '--seek-before-width': (currentTrackDuration ? currentPosition / currentTrackDuration * 100 : 0) + '%'
            }"
          />
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const username = useRoute().params.profile || useRoute().params.username;

// The Spotify access/refresh tokens never reach the browser: this component
// only ever calls our own server route, which holds the tokens and the
// client secret. (Seeking was removed -- the old version sent seek
// requests using the *profile owner's* token from any visitor's browser,
// letting anyone viewing a public profile scrub that person's playback.)
const currentlyPlaying = ref(null);
const currentTrackDuration = ref(0);
const currentPosition = ref(0);
let pollHandle = null;

const fetchCurrentlyPlaying = async () => {
  try {
    const data = await $fetch(`/api/spotify/now-playing/${username}`);
    if (data?.item) {
      currentlyPlaying.value = data.item;
      currentTrackDuration.value = data.item.duration_ms / 1000;
      currentPosition.value = data.progress_ms / 1000;
    } else {
      currentlyPlaying.value = null;
    }
  } catch (error) {
    console.error('Error fetching currently playing track:', error.message);
  }
};

onMounted(async () => {
  await fetchCurrentlyPlaying();
  pollHandle = setInterval(fetchCurrentlyPlaying, 10000);
});

onUnmounted(() => {
  if (pollHandle) clearInterval(pollHandle);
});
</script>

<style scoped>
.spotify-component {
  max-width: 600px;
  padding: 20px;
  border-radius: 5px;
}

.track-info {
  display: flex;
  align-items: center;
  padding: 20px 25px;
  border-radius: 25px;
  background-color: rgba(0,0,0);
  background-image: url(https://orangop.us/img/section-bg.png);
}

.track-details {
  margin-left: 170px;
  width: 100%;
}

.album-cover {
  filter: blur(10px);
  width: 140px;
  height: 140px !important;
  margin-right: 20px;
  border-radius: 20px;
  position: absolute;
}
.album-cover-container {
  display: contents;
}

.album-coverimg {
  width: 140px;
  height: 140px !important;
  margin-right: 20px;
  border-radius: 20px;
  position: absolute;
}

.seek-bar {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.slider-container {
  position: relative;
  width: 100%;
}

.spotify-progress {
  width: 100%;
  height: 5px;
  background: #4b4b4b;
  border-radius: 2.5px;
  position: relative;
  margin-top: 20px !important;
}

.spotify-progress::before {
  content: '';
  height: 5px;
  background: #1db954;
  border-radius: 20px;
  position: absolute;
  top: 0;
  left: 0;
  width: var(--seek-before-width);
}
</style>
