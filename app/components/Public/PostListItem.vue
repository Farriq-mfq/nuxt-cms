<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

defineProps<{
    post: {
        id: number
        title: string
        slug: string
        publishedAt: string | null
        category: { name: string } | null
    }
}>()

</script>

<template>
    <NuxtLink :to="`/post/${post.slug}`" class="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
        <Icon name="lucide:chevron-right" size="16" class="text-on-surface-variant shrink-0" />

        <div class="min-w-0">
            <h4
                class="text-body-md text-on-surface leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                {{ post.title }}
            </h4>
            <div class="flex items-center gap-2 text-label-md text-on-surface-variant mt-1">
                <span v-if="post.category">{{ post.category.name }}</span>
                <span v-if="post.category">•</span>
                <span>{{ format(post.publishedAt, 'dd MMMM yyyy', { locale: id }) }}</span>
            </div>
        </div>
    </NuxtLink>
</template>