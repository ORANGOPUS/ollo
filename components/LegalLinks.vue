<template>
  <nav class="legal-links" aria-label="Legal">
    <NuxtLink to="/terms">Terms</NuxtLink>
    <span aria-hidden="true">·</span>
    <NuxtLink to="/privacy">Privacy</NuxtLink>
  </nav>
</template>

<style scoped>
.legal-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  font: 600 14px/1.5 Quicksand, system-ui, sans-serif;
  color: #a9b3c7;
}
.legal-links a { color: #a9b3c7; text-decoration: underline; text-underline-offset: 3px; }
.legal-links a:hover, .legal-links a:focus-visible { color: #fff; }
</style>
