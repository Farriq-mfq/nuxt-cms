<template>
  <NuxtLoadingIndicator color="rgb(var(--color-secondary))" :height="3" :throttle="0" />
  <NuxtLayout>
    <NuxtPage />
    <DebugThemeSwitcher />
  </NuxtLayout>
</template>
