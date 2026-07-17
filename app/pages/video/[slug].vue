<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useAsyncData(`public-video-album-${slug}`, () =>
    $fetch(`/api/public/video-albums/${slug}`)
)

if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Album video tidak ditemukan', fatal: true })
}

const album = computed(() => data.value?.data)

useHead({
    title: album.value?.title,
    meta: [{ name: 'description', content: album.value?.description || '' }],
})
</script>

<template>
    <PublicContainer v-if="album" class="bg-surface-container-lowest">
        <PublicBreadcrumb :items="[{ label: 'Album Video', to: '/video' }, { label: album.title }]" />
        <div class="mt-lg">
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

                <p v-if="album.description" class="text-body-md text-on-surface-variant mt-md pl-5 max-w-2xl">
                    {{ album.description }}
                </p>

                <span class="flex items-center gap-1.5 text-label-md text-on-surface-variant mt-3 pl-5">
                    <Icon name="lucide:video" size="14" />
                    {{ album.videos.length }} Video
                </span>
            </header>

            <div v-if="!album.videos.length" class="text-center py-xl">
                <Icon name="lucide:video-off" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Belum ada video di album ini</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                <div v-for="video in album.videos" :key="video.id">
                    <PublicVideoPlayer :video-id="video.videoId" :title="video.title" />
                    <h3 class="text-body-md text-on-surface mt-2 line-clamp-2">{{ video.title }}</h3>
                </div>
            </div>
        </div>
    </PublicContainer>
</template>