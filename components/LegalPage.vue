<template>
  <main class="legal">
    <p class="legal-eyebrow">ollo · {{ controller }}</p>
    <h1>{{ title }}</h1>
    <p class="legal-updated">Last updated {{ updated }}</p>
    <slot />
    <LegalLinks class="legal-foot" />
  </main>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
const legal = useAppConfig().legal as { controller: string; lastUpdated: string };
const controller = legal.controller;
const updated = legal.lastUpdated;
</script>

<style scoped>
.legal {
  max-width: 72ch;
  margin: 0 auto;
  padding: 48px 24px 64px;
  color: #fff;
  font: 400 17px/1.7 Quicksand, system-ui, sans-serif;
}
.legal-eyebrow { margin: 0; color: #a9b3c7; font-weight: 600; font-size: 14px; letter-spacing: .06em; text-transform: uppercase; }
.legal h1 { margin: 8px 0 0; font-size: clamp(32px, 5vw, 44px); line-height: 1.15; font-weight: 700; }
.legal-updated { margin: 8px 0 32px; color: #a9b3c7; font-size: 15px; }
.legal :deep(h2) { margin: 40px 0 8px; font-size: 22px; line-height: 1.3; font-weight: 700; }
.legal :deep(p), .legal :deep(li) { color: #dfe4ee; }
.legal :deep(ul) { padding-left: 1.25em; }
.legal :deep(li) { margin: 6px 0; }
.legal :deep(a) { color: #04d87f; text-underline-offset: 3px; }
.legal :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 15px; }
.legal :deep(th), .legal :deep(td) { text-align: left; vertical-align: top; padding: 10px 8px; border-bottom: 1px solid #2a3347; }
.legal :deep(th) { color: #a9b3c7; font-weight: 600; }
.legal :deep(.legal-callout) { background: #141a27; border: 1px solid #2a3347; border-radius: 12px; padding: 16px 20px; }
.legal-foot { margin-top: 48px; }
@media (max-width: 600px) {
  .legal :deep(table), .legal :deep(thead), .legal :deep(tbody), .legal :deep(tr), .legal :deep(td) { display: block; }
  .legal :deep(thead) { display: none; }
  .legal :deep(td) { border: 0; padding: 2px 0; }
  .legal :deep(tr) { border-bottom: 1px solid #2a3347; padding: 10px 0; }
}
</style>
