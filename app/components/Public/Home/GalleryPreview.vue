<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
const { data } = await useAsyncData('home-albums', () =>
    $fetch('/api/public/albums', { query: { limit: 5 } })
)

const albumsList = computed(() => data.value?.data ?? [])
const featured = computed(() => albumsList.value[0])
const rest = computed(() => albumsList.value.slice(1))

</script>

<template>
    <section v-if="albumsList.length">
        <div class="flex items-end justify-between mb-md">
            <div class="flex items-start gap-4">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3rem]"></div>
                <div>
                    <h2 class="text-headline-lg text-on-surface mt-1">Galeri</h2>
                </div>
            </div>
            <NuxtLink to="/galeri"
                class="hidden sm:flex items-center gap-1 text-body-md text-secondary hover:underline shrink-0">
                Lihat Semua
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>

        <div class="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:gap-4 lg:aspect-[14/7]">
            <NuxtLink v-if="featured" :to="`/galeri/${featured.slug}`"
                class="group relative rounded overflow-hidden bg-surface-container shadow-layer-1 hover:shadow-layer-2 transition-shadow aspect-video lg:aspect-auto lg:col-span-2 lg:row-span-2">
                <img v-if="featured.coverImage" :src="featured.coverImage.path" :alt="featured.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div v-else class="w-full h-full flex items-center justify-center bg-surface-container">
                    <Icon name="lucide:image" size="40" class="text-on-surface-variant opacity-40" />
                </div>

                <div class="hidden lg:block absolute top-0 right-0 w-20 h-20 bg-secondary"
                    style="clip-path: polygon(100% 0, 100% 100%, 0 0);" />
                <Icon name="lucide:images" size="18" class="hidden lg:block absolute top-3 right-3 text-white z-10" />

                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <span
                        class="inline-flex self-start items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-label-md rounded-full px-3 py-1 mb-3">
                        <Icon name="lucide:image" size="12" />
                        {{ featured.photoCount }} Foto
                    </span>
                    <h3 class="text-headline-md text-white font-bold leading-snug line-clamp-2">
                        {{ featured.title }}
                    </h3>
                    <span class="flex items-center gap-1.5 text-label-md text-white/70 mt-2">
                        <Icon name="lucide:calendar" size="12" />
                        {{ format(featured.createdAt, 'dd MMMM yyyy', { locale: id }) }}
                    </span>
                </div>
            </NuxtLink>

            <div class="grid grid-cols-2 gap-3 lg:contents">
                <NuxtLink v-for="album in rest" :key="album.id" :to="`/galeri/${album.slug}`"
                    class="group relative rounded overflow-hidden bg-surface-container shadow-layer-1 hover:shadow-layer-2 transition-shadow aspect-square">
                    <img v-if="album.coverImage" :src="album.coverImage.path" :alt="album.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-surface-container">
                        <Icon name="lucide:image" size="24" class="text-on-surface-variant opacity-40" />
                    </div>

                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-3">
                        <span class="inline-flex self-start items-center gap-1 text-white/80 text-label-md mb-1">
                            <Icon name="lucide:image" size="10" />
                            {{ album.photoCount }}
                        </span>
                        <h4 class="text-label-md text-white font-medium leading-snug line-clamp-2">
                            {{ album.title }}
                        </h4>
                        <span class="text-label-md text-white/60 mt-0.5">
                            {{ format(album.createdAt, 'dd MMMM yyyy', { locale: id }) }}
                        </span>
                    </div>
                </NuxtLink>
            </div>
        </div>

        <div class="sm:hidden mt-md text-center">
            <NuxtLink to="/galeri" class="inline-flex items-center gap-1 text-body-md text-secondary hover:underline">
                Lihat Semua Album
                <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
        </div>
    </section>
</template>