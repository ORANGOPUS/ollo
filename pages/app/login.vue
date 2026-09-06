<template>
  <div class="login-screen">
    <div class="login-top">
      <img src="/logo.svg" alt="ollo" class="login-logo" />
      <div class="login-headline">
        one little link, <span class="login-organised">organised.</span>
      </div>
      <div class="login-sub">The free and open way to share your library to the web.</div>
    </div>
    <div class="login-bottom">
      <div class="login-url">
        <img src="/logo.svg" alt="" class="login-url-logo" />
        <span>ollo.bio/your-username</span>
      </div>
      <button class="login-discord" @click="signIn">Continue with Discord</button>
      <button class="login-claim" @click="signIn">Claim a username</button>
      <div class="login-foot">Open-source and 100% free. No paywalls, ever.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', hideTabs: true });

const supabase = useSupabaseClient();
const user = useSupabaseUser();

if (user.value) {
  navigateTo('/app/home');
}

async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: '/app/dashboard' },
  });
  if (error) console.error(error);
}
</script>

<style scoped>
.login-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 24px 34px;
  background: radial-gradient(120% 60% at 50% 0%, #22304d 0%, #1a2235 62%);
}

.login-top {
  padding-top: 86px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.login-logo {
  width: 96px;
  display: block;
}

.login-headline {
  font: 700 34px/1.1 Quicksand, sans-serif;
  text-align: center;
}

.login-organised {
  color: #000;
  background: #fff;
  border-radius: 10px;
  padding: 2px 12px;
  font-weight: 900;
}

.login-sub {
  font: 600 16px/1.5 Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  max-width: 290px;
}

.login-bottom {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-url {
  background: #141a27;
  border-radius: 22px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-url-logo {
  width: 26px;
  flex: none;
}

.login-url span {
  font: 700 17px Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.42);
}

.login-discord,
.login-claim {
  border: none;
  cursor: pointer;
  border-radius: 100px;
  padding: 16px;
  font: 700 17px Quicksand, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.login-discord {
  background: #5865f2;
  color: #fff;
  box-shadow: 0 4px 40px rgba(88, 101, 242, 0.35);
}

.login-claim {
  background: #fff;
  color: #212121;
}

.login-foot {
  font: 600 12.5px/1.5 Quicksand, sans-serif;
  color: rgba(255, 255, 255, 0.38);
  text-align: center;
  padding: 2px 20px 0;
}
</style>
