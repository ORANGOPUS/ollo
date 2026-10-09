<template>
  <div class="pages-optin">
    <div class="pages-optin-text">
      <label class="pages-optin-label" :for="id">Show my profile on ollo.thng.my</label>
      <span class="pages-optin-help">Lists your name, bio, avatar and links on the public read-only site. Turning it off removes you within about 6 hours.</span>
      <span v-if="error" class="pages-optin-error" role="alert">{{ error }}</span>
    </div>
    <button
      :id="id"
      type="button"
      role="switch"
      class="pages-optin-switch"
      :aria-checked="on ? 'true' : 'false'"
      :disabled="loading || saving"
      @click="toggle"
    >
      <span class="pages-optin-thumb" aria-hidden="true"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const id = 'pages-optin-switch';
const on = ref(false);
const loading = ref(true);
const saving = ref(false);
const error = ref('');

onMounted(async () => {
  if (!user.value) return;
  const { data, error: e } = await supabase.from('profiles').select('show_on_pages').eq('id', user.value.id).single();
  if (e) error.value = 'Could not load this setting.';
  else on.value = !!(data as any)?.show_on_pages;
  loading.value = false;
});

async function toggle() {
  if (!user.value) return;
  const next = !on.value;
  saving.value = true;
  error.value = '';
  const { error: e } = await supabase.from('profiles').update({ show_on_pages: next }).eq('id', user.value.id);
  if (e) error.value = 'Could not save. Please try again.';
  else on.value = next;
  saving.value = false;
}
</script>

<style scoped>
.pages-optin { display: flex; align-items: flex-start; gap: 16px; background: #141a27; border-radius: 20px; padding: 16px; margin: 12px 0; color: #fff; }
.pages-optin-text { flex: 1 1 0; min-width: 0; display: grid; gap: 4px; }
.pages-optin-label { display: block; font: 700 15px Quicksand, sans-serif; }
.pages-optin-help { display: block; font: 600 13px/1.5 Quicksand, sans-serif; color: rgba(255,255,255,.7); }
.pages-optin-error { display: block; font: 600 13px/1.5 Quicksand, sans-serif; color: #ff9f7a; }
.pages-optin-switch { flex: none; position: relative; width: 52px; height: 32px; margin-top: 2px; border-radius: 100px; border: 1px solid #2a3347; background: #1c2436; cursor: pointer; transition: background-color 160ms ease; }
.pages-optin-switch[aria-checked='true'] { background: #04d87f; border-color: #04d87f; }
.pages-optin-switch:disabled { opacity: .6; cursor: progress; }
.pages-optin-switch:focus-visible { outline: 3px solid #04d87f; outline-offset: 3px; }
.pages-optin-thumb { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: transform 160ms ease; }
.pages-optin-switch[aria-checked='true'] .pages-optin-thumb { transform: translateX(20px); }
@media (prefers-reduced-motion: reduce) { .pages-optin-switch, .pages-optin-thumb { transition: none; } }
</style>
