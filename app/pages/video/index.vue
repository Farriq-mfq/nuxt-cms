<script setup lang="ts">
useHead({ title: 'Album Video' })

const { data, pending } = await useAsyncData('public-video-albums', () =>
    $fetch('/api/public/video-albums', { query: { limit: 20 } })
)

const albumsList = computed(() => data.value?.data ?? [])
</script>

<template>
    <PublicContainer>
        <PublicBreadcrumb :items="[{ label: 'Album Video' }]" />
        <div class="flex flex-col gap-md mt-lg">
            <header class="flex items-start gap-4 mb-md">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary">Dokumentasi</span>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Album Video
                    </h1>
                </div>
            </header>

            <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
                <div v-for="i in 8" :key="i" class="aspect-video rounded bg-surface-container animate-pulse"></div>
            </div>

            <div v-else-if="!albumsList.length" class="text-center py-xl">
                <Icon name="lucide:video-off" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Belum ada album video</p>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
                <NuxtLink v-for="album in albumsList" :key="album.id" :to="`/video/${album.slug}`"
                    class="group relative aspect-video rounded overflow-hidden bg-surface-container shadow-layer-1 hover:shadow-layer-2 transition-shadow">
                    <img v-if="album.coverImage" :src="album.coverImage.path" :alt="album.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-surface-container">
                        <Icon name="lucide:video" size="28" class="text-on-surface-variant opacity-40" />
                    </div>

                    <div
                        class="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                        <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Icon name="lucide:play" size="20" class="text-primary ml-0.5" />
                        </div>
                    </div>

                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                        <h3 class="text-body-md text-white font-semibold leading-snug line-clamp-2">
                            {{ album.title }}
                        </h3>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </PublicContainer>
</template>