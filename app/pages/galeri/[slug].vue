<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`public-album-${slug}`, () =>
    $fetch(`/api/public/albums/${slug}`)
)

if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Album tidak ditemukan', fatal: true })
}

const album = computed(() => data.value?.data)

useHead({
    title: album.value?.title,
    meta: [
        { name: 'description', content: album.value?.description || '' },
        { property: 'og:title', content: album.value?.title || '' },
        { property: 'og:image', content: album.value?.coverImage?.path || '' },
    ],
})

function formatDate(date: string | undefined): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const lightboxIndex = ref<number | null>(null)

function openLightbox(index: number) {
    lightboxIndex.value = index
    document.body.style.overflow = 'hidden'
}

function closeLightbox() {
    lightboxIndex.value = null
    document.body.style.overflow = ''
}

function nextImage() {
    if (lightboxIndex.value === null || !album.value) return
    lightboxIndex.value = (lightboxIndex.value + 1) % album.value.galleries.length
}

function prevImage() {
    if (lightboxIndex.value === null || !album.value) return
    lightboxIndex.value = (lightboxIndex.value - 1 + album.value.galleries.length) % album.value.galleries.length
}

function handleKeydown(event: KeyboardEvent) {
    if (lightboxIndex.value === null) return
    if (event.key === 'Escape') closeLightbox()
    if (event.key === 'ArrowRight') nextImage()
    if (event.key === 'ArrowLeft') prevImage()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
})
</script>

<template>
    <div v-if="album" class="bg-surface-container-lowest">
        <div class="max-w-7xl mx-auto px-margin py-xl">
            <header class="mb-lg">
                <div class="flex items-start gap-4">
                    <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                    <div>
                        <span class="text-label-md uppercase tracking-widest text-secondary">Album</span>
                        <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">
                            {{ album.title }}
                        </h1>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 mt-md pl-5 text-label-md text-on-surface-variant">
                    <span class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar" size="14" />
                        {{ formatDate(album.createdAt) }}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <Icon name="lucide:image" size="14" />
                        {{ album.galleries.length }} Foto
                    </span>
                </div>

                <p v-if="album.description" class="text-body-md text-on-surface-variant mt-md pl-5 max-w-2xl">
                    {{ album.description }}
                </p>
            </header>

            <div v-if="!album.galleries.length" class="text-center py-xl">
                <Icon name="lucide:image-off" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Belum ada foto di album ini</p>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <button v-for="(item, index) in album.galleries" :key="item.id"
                    class="group relative aspect-square rounded overflow-hidden bg-surface-container"
                    @click="openLightbox(index)">
                    <img :src="item.image.path" :alt="item.caption || album.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div
                        class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Icon name="lucide:expand" size="20"
                            class="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </button>
            </div>
        </div>

        <ClientOnly>
            <Teleport to="body">
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="lightboxIndex !== null" class="fixed inset-0 z-[9999] flex items-center justify-center">

                        <div class="absolute inset-0 bg-black/95 backdrop-blur-sm" @click="closeLightbox"></div>

                        <button
                            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            @click="closeLightbox">
                            <Icon name="lucide:x" size="20" />
                        </button>

                        <button v-if="album.galleries.length > 1"
                            class="absolute left-2 sm:left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            @click.stop="prevImage">
                            <Icon name="lucide:chevron-left" size="22" />
                        </button>

                        <div
                            class="relative z-10 max-w-4xl max-h-[85vh] px-14 flex flex-col items-center pointer-events-none">
                            <img :src="album.galleries[lightboxIndex].image.path"
                                :alt="album.galleries[lightboxIndex].caption || album.title"
                                class="max-w-full max-h-[75vh] object-contain rounded pointer-events-auto" />
                            <p v-if="album.galleries[lightboxIndex].caption"
                                class="text-white/80 text-body-md mt-3 text-center">
                                {{ album.galleries[lightboxIndex].caption }}
                            </p>
                            <span class="text-white/50 text-label-md mt-1">
                                {{ lightboxIndex + 1 }} / {{ album.galleries.length }}
                            </span>
                        </div>

                        <button v-if="album.galleries.length > 1"
                            class="absolute right-2 sm:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            @click.stop="nextImage">
                            <Icon name="lucide:chevron-right" size="22" />
                        </button>
                    </div>
                </transition>
            </Teleport>
        </ClientOnly>
    </div>
</template>