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
      "Plus Jakarta Sans": [500, 600, 700, 800],
      Inter: [400, 500, 600, 700],
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
