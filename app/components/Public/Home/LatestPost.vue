<script setup lang="ts">
const { data } = await useAsyncData('home-latest-post', () =>
    $fetch('/api/public/posts', { query: { limit: 8 } })
)

const allPost = computed(() => data.value?.data ?? [])
const featuredPost = computed(() => allPost.value.slice(0, 2))
const listPost = computed(() => allPost.value.slice(2))
</script>

<template>
    <section v-if="allPost.length">
        <div class="flex items-end justify-between mb-md">
            <div class="flex items-start gap-4">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3rem]"></div>
                <div>
                    <h2 class="text-headline-lg text-on-surface mt-1">Post Terbaru</h2>
                </div>
            </div>
            <NuxtLink to="/post" class="hidden sm:flex items-center gap-1 text-body-md text-secondary hover:underline">
                Lihat Semua
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>

        <div class="grid lg:grid-cols-3 gap-lg items-start">
            <div class="lg:col-span-2 grid sm:grid-cols-2 gap-md">
                <PublicPostCard v-for="item in featuredPost" :key="item.id" :post="item" />
            </div>

            <div v-if="listPost.length">
                <div class="divide-y divide-outline-variant max-w-xs">
                    <PublicPostListItem v-for="item in listPost" :key="item.id" :post="item" />
                </div>
            </div>
        </div>

        <div class="sm:hidden mt-md text-center">
            <NuxtLink to="/post" class="inline-flex items-center gap-1 text-body-md text-secondary hover:underline">
                Lihat Semua Post
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>
    </section>
</template>