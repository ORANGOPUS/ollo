import Rawger from 'rawger';

export default defineNuxtPlugin(() => {
  const apiKey = 'f31a286fc5484379a9bafb44ea69fee0'; // Replace with your RAWG API key
  const rawger = new Rawger(apiKey);

  return {
    provide: {
      rawger,
    },
  };
});
