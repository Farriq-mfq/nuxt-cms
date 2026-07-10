<script setup lang="ts">
const { data } = await useAsyncData('home-latest-news', () =>
    $fetch('/api/public/news', { query: { limit: 8 } })
)

const allNews = computed(() => data.value?.data ?? [])
const featuredNews = computed(() => allNews.value.slice(0, 2))
const listNews = computed(() => allNews.value.slice(2))
</script>

<template>
    <section v-if="allNews.length">
        <div class="flex items-end justify-between mb-md">
            <div class="flex items-start gap-4">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3rem]"></div>
                <div>
                    <h2 class="text-headline-lg text-on-surface mt-1">Berita Terbaru</h2>
                </div>
            </div>
            <NuxtLink to="/berita"
                class="hidden sm:flex items-center gap-1 text-body-md text-secondary hover:underline">
                Lihat Semua
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>

        <div class="grid lg:grid-cols-3 gap-lg items-start">
            <div class="lg:col-span-2 grid sm:grid-cols-2 gap-md">
                <PublicNewsCard v-for="item in featuredNews" :key="item.id" :news="item" />
            </div>

            <div v-if="listNews.length">
                <div class="divide-y divide-outline-variant max-w-xs">
                    <PublicNewsListItem v-for="item in listNews" :key="item.id" :news="item" />
                </div>
            </div>
        </div>

        <div class="sm:hidden mt-md text-center">
            <NuxtLink to="/berita" class="inline-flex items-center gap-1 text-body-md text-secondary hover:underline">
                Lihat Semua Berita
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>
    </section>
</template>