// Shared by /dashboard and /app/dashboard. Confirms first, removes the user's
// uploaded avatar from storage, then asks the server to delete every row that
// belongs to the account (see server/api/delete-account.post.ts) before
// signing out.
export function useDeleteAccount() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const deleting = ref(false);
  const deleteError = ref('');

  async function deleteAccount(): Promise<boolean> {
    if (!user.value || deleting.value) return false;
    const ok = window.confirm(
      'Delete your ollo account? Your profile, posts, likes, links and uploads will be permanently deleted. This cannot be undone.'
    );
    if (!ok) return false;

    deleting.value = true;
    deleteError.value = '';
    try {
      // Avatar uploads live at this exact key (see updateAvatar in pages/dashboard.vue).
      await supabase.storage.from('uploads').remove([`public/avatars/${user.value.id}?updated`]);
      await $fetch('/api/delete-account', { method: 'POST' });
      await supabase.auth.signOut();
      return true;
    } catch (e: any) {
      deleteError.value = 'Your account could not be fully deleted. Please try again, or contact us from the privacy page.';
      console.error('delete-account failed:', e?.message || e);
      return false;
    } finally {
      deleting.value = false;
    }
  }

  return { deleting, deleteError, deleteAccount };
}
