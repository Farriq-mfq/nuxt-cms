<script setup lang="ts">
defineProps<{
    news: {
        id: number
        title: string
        slug: string
        publishedAt: string | null
        category: { name: string } | null
    }
}>()

function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
    <NuxtLink :to="`/berita/${news.slug}`" class="group flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
        <div class="w-1 h-1 rounded-full bg-secondary mt-2.5 shrink-0"></div>

        <div class="min-w-0">
            <h4
                class="text-body-md text-on-surface leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                {{ news.title }}
            </h4>
            <div class="flex items-center gap-2 text-label-md text-on-surface-variant mt-1">
                <span v-if="news.category">{{ news.category.name }}</span>
                <span v-if="news.category">•</span>
                <span>{{ formatDate(news.publishedAt) }}</span>
            </div>
        </div>
    </NuxtLink>
</template>