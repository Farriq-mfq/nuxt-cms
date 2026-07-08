<script setup lang="ts">
const { isOpen } = useSidebar()
useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} | Admin Panel` : 'Admin Panel'
    }
})
</script>

<template>
    <div class="min-h-screen bg-surface-container-lowest">
        <AdminPartialSidebar />

        <div class="flex flex-col min-h-screen transition-all duration-200" :class="isOpen ? 'pl-64' : 'pl-16'">
            <AdminPartialTopbar />

            <main class="flex-1 p-md pt-20 bg-surface-container-low text-on-surface">
                <slot />
            </main>
        </div>
        <AdminBaseConfirmDialog />
    </div>
</template>