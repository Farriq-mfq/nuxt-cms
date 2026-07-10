<script setup lang="ts">
defineProps<{
    news: {
        id: number
        title: string
        slug: string
        publishedAt: string | null
        category: { name: string } | null
        thumbnail: { path: string } | null
    }
}>()

function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
    <NuxtLink :to="`/berita/${news.slug}`"
        class="group relative block aspect-[4/3] rounded overflow-hidden bg-surface-container shadow-layer-1 hover:shadow-layer-2 transition-shadow">
        <img v-if="news.thumbnail" :src="news.thumbnail.path" :alt="news.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div v-else class="w-full h-full flex items-center justify-center bg-surface-container">
            <Icon name="lucide:image" size="32" class="text-on-surface-variant opacity-40" />
        </div>

        <div
            class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
            <div v-if="news.category"
                class="inline-flex self-start bg-secondary text-on-secondary text-label-md rounded-full px-2.5 py-0.5 mb-2">
                {{ news.category.name }}
            </div>

            <h3 class="text-body-lg font-semibold text-white leading-snug line-clamp-2">
                {{ news.title }}
            </h3>

            <div class="flex items-center gap-1.5 text-label-md text-white/70 mt-2">
                <Icon name="lucide:calendar" size="12" />
                {{ formatDate(news.publishedAt) }}
            </div>
        </div>
    </NuxtLink>
</template>