<script setup lang="ts">
const { data } = await useAsyncData('home-latest-news', () =>
    $fetch('/api/public/news', { query: { limit: 8 } })
)

const allNews = computed(() => data.value?.data ?? [])
const featuredNews = computed(() => allNews.value.slice(0, 2))
const listNews = computed(() => allNews.value.slice(2))
</script>

<template>
    <section v-if="allNews.length" class="py-xl">
        <div class="flex items-end justify-between mb-md">
            <div>
                <span class="text-label-md uppercase tracking-widest text-secondary">Terkini</span>
                <h2 class="text-headline-lg text-on-surface mt-1">Berita Terbaru</h2>
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

            <div v-if="listNews.length" class="bg-white border border-outline-variant rounded shadow-layer-1 p-5">
                <span
                    class="text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-1">
                    <Icon name="lucide:newspaper" size="14" />
                    Berita Lainnya
                </span>

                <div class="divide-y divide-outline-variant">
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