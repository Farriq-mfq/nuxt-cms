<script setup lang="ts">
useHead({
    titleTemplate: (title) => title ? `${title} · Auth` : 'Auth',
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-surface-container-lowest px-md">
        <div class="w-full max-w-sm">
            <div class="bg-surface border border-outline-variant rounded shadow-layer-2 p-3">
                <slot />
            </div>

            <p class="text-center text-label-md text-on-surface-variant mt-md">
                © {{ new Date().getFullYear() }} Me
            </p>
        </div>
    </div>
</template>