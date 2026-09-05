import Rawger from 'rawger';

export default defineNuxtPlugin(async () => {
  const rawger = await Rawger();

  return {
    provide: {
      rawger,
    },
  };
});
