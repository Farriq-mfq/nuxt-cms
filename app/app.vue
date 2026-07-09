<script setup lang="ts">
const { setting } = useSetting()
const { theme } = useTheme()

useHead({
  htmlAttrs: {
    lang: 'id',
    'data-theme': theme.value,
  },
  titleTemplate: (titleChunk) => {
    const appName = setting.value?.appName ?? ''
    return titleChunk ? `${titleChunk} | ${appName}` : appName
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: setting.value?.appFavicon ?? '/favicon.ico',
    },
  ],
  meta: [
    {
      name: 'description',
      content: setting.value?.metaDescription ?? setting.value?.appDescription ?? '',
    },
    {
      name: 'keywords',
      content: setting.value?.appKeywords?.join(', ') ?? '',
    },
    // Open Graph
    {
      property: 'og:title',
      content: setting.value?.metaTitle ?? setting.value?.appName ?? '',
    },
    {
      property: 'og:description',
      content: setting.value?.metaDescription ?? setting.value?.appDescription ?? '',
    },
    {
      property: 'og:image',
      content: setting.value?.metaImage ?? '',
    },
    {
      property: 'og:url',
      content: setting.value?.metaUrl ?? '',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: setting.value?.metaTitle ?? setting.value?.appName ?? '',
    },
    {
      name: 'twitter:description',
      content: setting.value?.metaDescription ?? setting.value?.appDescription ?? '',
    },
    {
      name: 'twitter:image',
      content: setting.value?.metaImage ?? '',
    },
  ],
  script: setting.value?.googleAnalyticsId
    ? [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${setting.value.googleAnalyticsId}`,
        async: true,
      },
      {
        innerHTML: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${setting.value.googleAnalyticsId}');
                  `,
      },
    ]
    : [],
})
</script>

<template>
  <NuxtLoadingIndicator color="rgb(var(--color-secondary))" :height="3" :throttle="0" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>