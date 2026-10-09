<template>
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
        <button class="button blurple" @click="signInWithOAuth">
          <Icon name="fa6-brands:discord" class="navicon"/> Login With Discord
        </button>
        <p class="login-legal">
          By continuing you agree to our <NuxtLink to="/terms">Terms</NuxtLink>
          and <NuxtLink to="/privacy">Privacy notice</NuxtLink>.
        </p>
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const signInWithOAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: '/dashboard',
    },
  })
  if (error) console.log(error)
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}

if (user.value) {
  navigateTo('/dashboard')
}
</script>

<style scoped>
.login-legal { max-width: 36ch; text-align: center; color: #a9b3c7; font-size: 14px; line-height: 1.5; }
.login-legal a { color: #04d87f; text-decoration: underline; text-underline-offset: 3px; }

</style>