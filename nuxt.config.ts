// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "nuxt-icon", "@nuxt/ui", "@nuxtjs/mdc", "@nuxt/image"],
  css: ['/assets/css/styles.css'],
  supabase: {
    redirect: false,
  },
  app: {
    head: {
      script: [
        {
          src: 'https://canny.io/sdk.js',
          async: true,
          defer: true
        }
      ]
    }
  },
})