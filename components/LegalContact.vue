<template>
  <a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
  <strong v-else class="legal-missing">[privacy contact email not set: add it in app.config.ts]</strong>
</template>

<script setup lang="ts">
const email = useAppConfig().legal?.contactEmail as string | undefined;
</script>

<style scoped>
.legal-missing { color: #ff9f7a; }
</style>
