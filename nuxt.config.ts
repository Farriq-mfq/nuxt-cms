export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "nuxt-toast",
  ],
  googleFonts: {
    families: {
      Inter: [400, 600, 700, 800],
    },
    display: "swap",
  },
  toast: {
    settings: {
      position: "topRight",
    },
  },
});
