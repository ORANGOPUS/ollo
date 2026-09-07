<template>
  <button class="minutesago" @click="toggleLike">
    <Icon :name="liked ? 'icon-park-solid:like' : 'icon-park-outline:like'" class="mr-1" />
    {{ likes }}
  </button>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const props = defineProps<{
  postId: number;
  initialLikes: number;
}>();

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const liked = ref(false);
const likes = ref(props.initialLikes || 0);

onMounted(async () => {
  if (!user.value) return;
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', props.postId)
    .eq('user_id', user.value.id)
    .maybeSingle();
  liked.value = !!data;
});

async function toggleLike() {
  if (!user.value) return;

  if (liked.value) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', props.postId)
      .eq('user_id', user.value.id);
    if (error) return console.error('Error unliking post:', error.message);
    liked.value = false;
    likes.value -= 1;
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: props.postId, user_id: user.value.id });
    if (error) return console.error('Error liking post:', error.message);
    liked.value = true;
    likes.value += 1;
  }
}
</script>
