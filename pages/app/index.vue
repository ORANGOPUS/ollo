<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', hideTabs: true });

const user = useSupabaseUser();
navigateTo(user.value ? '/app/home' : '/app/login');
</script>
