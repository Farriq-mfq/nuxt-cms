<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`public-post-${slug}`, () =>
    $fetch(`/api/public/posts/${slug}`)
)

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Post tidak ditemukan',
        fatal: true,
    })
}

const item = computed(() => data.value?.data)

useHead({
    title: item.value?.title,
    meta: [
        { name: 'description', content: item.value?.excerpt || '' },
        { property: 'og:title', content: item.value?.title || '' },
        { property: 'og:description', content: item.value?.excerpt || '' },
        { property: 'og:image', content: item.value?.thumbnail?.path || '' },
        { property: 'og:type', content: 'article' },
    ],
})


const isCopied = ref(false)
async function handleShare() {
    if (import.meta.client) {
        await navigator.clipboard.writeText(window.location.href)
        isCopied.value = true
        setTimeout(() => (isCopied.value = false), 2000)
    }
}
</script>

<template>
    <PublicContainer v-if="item">
        <PublicBreadcrumb :items="[{
            label: 'Post',
            to: '/post'
        }, {
            label: item.category?.name || item.title,
            to: `/${item.slug}`
        }]" />
        <div class="flex flex-col gap-md mt-lg">
            <header class="mb-lg">
                <div v-if="item.category"
                    class="inline-flex bg-secondary-container/30 text-on-secondary-container text-label-md rounded-full px-3 py-1 mb-3">
                    {{ item.category.name }}
                </div>
                <div class="flex items-start gap-4">
                    <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                    <div>
                        <span class="text-label-md uppercase tracking-widest text-secondary">Post</span>
                        <h1
                            class="text-display-lg-mobile lg:text-display-lg text-on-surface font-extrabold leading-tight mt-1">
                            {{ item.title }}
                        </h1>
                        <p class="text-body-md text-on-surface-variant mt-1 max-w-2xl">
                            {{ item.excerpt }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 mt-md text-label-md text-on-surface-variant">
                    <span v-if="item.publishedAt" class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar" size="14" />
                        {{ format(item.publishedAt, 'dd MMMM yyyy', { locale: id }) }}
                    </span>
                    <span v-if="item.author" class="flex items-center gap-1.5">
                        <Icon name="lucide:user" size="14" />
                        {{ item.author.name }}
                    </span>
                    <PublicShareOn :title="item.title" :url="item.path" />
                </div>
            </header>

            <div v-if="item.thumbnail" class="aspect-video rounded overflow-hidden mb-lg shadow-layer-1">
                <img :src="item.thumbnail.path" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <PublicRichContent :content="item.content" />

            <div v-if="item.related?.length" class="mt-xl pt-lg border-t border-outline-variant">
                <span class="text-label-md uppercase tracking-widest text-secondary">Baca Juga</span>
                <h2 class="text-headline-md text-on-surface mt-1 mb-md">Post Terkait</h2>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <PublicPostCard v-for="related in item.related" :key="related.id" :post="related" />
                </div>
            </div>
        </div>
    </PublicContainer>
</template>