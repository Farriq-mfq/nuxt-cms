<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`public-news-${slug}`, () =>
    $fetch(`/api/public/news/${slug}`)
)

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Berita tidak ditemukan',
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

function formatDate(date: string | null | undefined): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

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
        <div class="flex flex-col gap-md">
            <header class="mb-lg">
                <div v-if="item.category"
                    class="inline-flex bg-secondary-container/30 text-on-secondary-container text-label-md rounded-full px-3 py-1 mb-3">
                    {{ item.category.name }}
                </div>
                <div class="flex items-start gap-4">
                    <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                    <div>
                        <span class="text-label-md uppercase tracking-widest text-secondary">Berita</span>
                        <h1
                            class="text-display-lg-mobile lg:text-display-lg text-on-surface font-extrabold leading-tight mt-1">
                            {{ item.title }}
                        </h1>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 mt-md text-label-md text-on-surface-variant">
                    <span v-if="item.publishedAt" class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar" size="14" />
                        {{ formatDate(item.publishedAt) }}
                    </span>
                    <span v-if="item.author" class="flex items-center gap-1.5">
                        <Icon name="lucide:user" size="14" />
                        {{ item.author.name }}
                    </span>
                    <button class="flex items-center gap-1.5 hover:text-secondary transition-colors"
                        @click="handleShare">
                        <Icon :name="isCopied ? 'lucide:check' : 'lucide:link'" size="14" />
                        {{ isCopied ? 'Tersalin' : 'Bagikan' }}
                    </button>
                </div>
            </header>

            <div v-if="item.thumbnail" class="aspect-video rounded overflow-hidden mb-lg shadow-layer-1">
                <img :src="item.thumbnail.path" :alt="item.title" class="w-full h-full object-cover" />
            </div>

            <PublicRichContent :content="item.content" />

            <div v-if="item.related?.length" class="mt-xl pt-lg border-t border-outline-variant">
                <span class="text-label-md uppercase tracking-widest text-secondary">Baca Juga</span>
                <h2 class="text-headline-md text-on-surface mt-1 mb-md">Berita Terkait</h2>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <PublicNewsCard v-for="related in item.related" :key="related.id" :news="related" />
                </div>
            </div>
        </div>
    </PublicContainer>
</template>