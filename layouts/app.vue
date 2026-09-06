<template>
  <div class="app-shell">
    <div class="app-screen">
      <slot />
    </div>
    <AppTabBar v-if="!route.meta.hideTabs" :active="String(route.meta.tab || '')" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>

<style>
/* Mobile shell tokens, ported from the ollo Mobile App design (#1A2235 / #141A27, Quicksand, 100px pills). */
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: #1a2235;
  color: #fff;
  font-family: 'Quicksand', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.app-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-shell button,
.app-shell input,
.app-shell textarea {
  font-family: inherit;
}

.app-shell a {
  color: #04d87f;
}
</style>
