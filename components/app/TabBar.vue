<template>
  <div class="tab-bar">
    <NuxtLink
      v-for="t in tabs"
      :key="t.key"
      :to="t.to"
      class="tab-btn"
      :class="{ fab: t.fab, active: t.key === active }"
    >
      <span class="tab-glyph" :style="{ fontSize: t.glyphSize }">{{ t.glyph }}</span>
      <span v-if="t.label">{{ t.label }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: string }>();

const tabs = [
  { key: 'home', to: '/app/home', glyph: '⌂', label: 'Home', glyphSize: '19px' },
  { key: 'explore', to: '/app/explore', glyph: '☰', label: 'Explore', glyphSize: '17px' },
  { key: 'compose', to: '/app/compose', glyph: '+', label: '', glyphSize: '26px', fab: true },
  { key: 'activity', to: '/app/activity', glyph: '◔', label: 'Activity', glyphSize: '17px' },
  { key: 'dash', to: '/app/dashboard', glyph: '◈', label: 'You', glyphSize: '17px' },
];
</script>

<style scoped>
.tab-bar {
  flex: none;
  height: 66px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-left: 8px;
  padding-right: 8px;
}

.tab-btn {
  border: none;
  cursor: pointer;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  width: 62px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font: 700 9.5px Quicksand, sans-serif;
  text-decoration: none;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.tab-glyph {
  line-height: 1;
}

.tab-btn.fab {
  width: 52px;
  height: 44px;
  border-radius: 18px;
  background: #fff;
  color: #212121;
}
</style>
