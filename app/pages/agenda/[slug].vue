<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const { data, error } = await useAsyncData(`public-agenda-${slug}`, () =>
    $fetch(`/api/public/agenda/${slug}`)
)

if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Agenda tidak ditemukan', fatal: true })
}

const item = computed(() => data.value?.data)

useHead({
    title: item.value?.title,
    meta: [{ name: 'description', content: item.value?.description || '' }],
})

function formatDate(date: string): string {
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}

function formatTime(date: string): string {
    return format(new Date(date), 'HH:mm', { locale: id })
}

</script>

<template>
    <PublicContainer v-if="item">
        <PublicBreadcrumb :items="[{ label: 'Agenda', to: '/agenda' }, { label: item.title }]" />

        <div class="mt-lg">
            <div v-if="item.thumbnail" class="aspect-video rounded overflow-hidden mb-lg shadow-layer-1">
                <img :src="item.thumbnail.path" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <header class="mb-lg">
                <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight">
                    {{ item.title }}
                </h1>

                <div class="flex flex-wrap items-center gap-4 mt-md text-body-md text-on-surface-variant">
                    <span class="flex items-center gap-2">
                        <Icon name="lucide:calendar" size="16" class="text-secondary" />
                        {{ formatDate(item.startDate) }} {{ item.endDate ? `- ${formatDate(item.endDate)}` : '' }}
                    </span>
                    <!-- <span class="flex items-center gap-2">
                        <Icon name="lucide:clock" size="16" class="text-secondary" />
                        {{ formatTime(item.startDate) }}<template v-if="item.endDate"> - {{ formatTime(item.endDate)
                        }}</template>
</span> -->
                    <span v-if="item.location" class="flex items-center gap-2">
                        <Icon name="lucide:map-pin" size="16" class="text-secondary" />
                        {{ item.location }}
                    </span>
                    <PublicShareOn :title="item.title" :url="item.path" />
                </div>
            </header>

            <PublicRichContent v-if="item.description" :content="item.description" />
        </div>
    </PublicContainer>
</template>