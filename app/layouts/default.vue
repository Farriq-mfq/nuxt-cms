<script setup lang="ts">

const route = useRoute()

</script>
<template>
    <div class="min-h-screen flex flex-col bg-background text-on-background">
        <PublicHeader :enable-transparent="route.path === '/'" />
        <main class="flex-1 bg-surface-container-lowest text-on-surface">
            <slot />
        </main>
        <PublicFooter />
    </div>
</template>