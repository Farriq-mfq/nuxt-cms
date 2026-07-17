<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`public-announcement-${slug}`, () =>
    $fetch(`/api/public/announcements/${slug}`)
)

if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Pengumuman tidak ditemukan', fatal: true })
}

const item = computed(() => data.value?.data)

useHead({
    title: item.value?.title,
    meta: [
        { property: 'og:title', content: item.value?.title || '' },
        { property: 'og:image', content: item.value?.thumbnail?.path || '' },
    ],
})

function formatDate(date: string | null): string {
    if (!date) return ''
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}

</script>

<template>
    <PublicContainer v-if="item" class="bg-surface-container-lowest">
        <PublicBreadcrumb :items="[{ label: 'Pengumuman', to: '/pengumuman' }, { label: item.title }]" />

        <div class="mt-lg">
            <header class="mb-lg">
                <div class="flex items-start gap-4">
                    <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                    <div>
                        <span class="text-label-md uppercase tracking-widest text-secondary">Pengumuman</span>
                        <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">
                            {{ item.title }}
                        </h1>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 mt-md pl-5 text-label-md text-on-surface-variant">
                    <span class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar" size="14" />
                        {{ formatDate(item.publishedAt) }}
                    </span>
                    <PublicShareOn :title="item.title" :url="item.path" />
                </div>
            </header>

            <div v-if="item.thumbnail" class="aspect-video rounded overflow-hidden mb-lg shadow-layer-1">
                <img :src="item.thumbnail.path" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <PublicRichContent :content="item.content" />
        </div>
    </PublicContainer>
</template>