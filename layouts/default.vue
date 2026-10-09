<template>
    <div>
      <Nav/>
      <div class="margin">
        <slot/>
      </div>
      <footer class="site-footer"><LegalLinks /></footer>
    </div>
  </template>
  
  <script setup lang="ts">
  const supabase = useSupabaseClient()
  
  const user = useSupabaseUser()
  
  const { username } = useRoute().params
  
  const { data: profile } = await useAsyncData('profiles', async () => {
    const { data } = await supabase.from('profiles').select("*")
  
    return data
  })
  </script>

<style scoped>
.site-footer { padding: 32px 16px 48px; }
</style>