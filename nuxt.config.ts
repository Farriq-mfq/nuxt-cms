export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "nuxt-toast",
    "nuxt-auth-utils",
    "@nuxtjs/sitemap",
  ],
  css: ["~/assets/css/themes.css"],
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
  typescript: {
    tsConfig: {
      include: ["../types/**/*.d.ts"],
    },
  },
  routeRules: {
    "/_admins/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  },
  sitemap: {
    exclude: ["/_admins/**"],
  },
});
