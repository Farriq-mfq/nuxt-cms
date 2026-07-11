<script setup lang="ts">
const route = useRoute()
const router = useRouter()

useHead({ title: 'Galeri' })

const page = ref(Number(route.query.page) || 1)
const search = ref('')
const searchInput = ref('')

const { data, pending } = await useAsyncData(
    'public-albums-list',
    () => $fetch('/api/public/albums', { query: { page: page.value, limit: 12, search: search.value || undefined } }),
    { watch: [page, search] }
)

const albumsList = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

let searchDebounce: ReturnType<typeof setTimeout>
watch(searchInput, (val) => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        search.value = val
        page.value = 1
    }, 400)
})

watch(page, () => {
    router.replace({ query: page.value > 1 ? { page: page.value } : {} })
})

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
    <div class="bg-surface-container-lowest">

        <div class="max-w-7xl mx-auto px-margin py-xl">
            <header class="flex items-start gap-4 mb-lg">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary">Dokumentasi</span>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Galeri Kegiatan
                    </h1>
                </div>
            </header>

            <div class="relative max-w-md mb-lg">
                <Icon name="lucide:search" size="18"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input v-model="searchInput" type="text" placeholder="Cari album..."
                    class="w-full bg-white border border-outline-variant rounded pl-10 pr-4 py-2.5 text-body-md focus:border-secondary outline-none" />
            </div>

            <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
                <div v-for="i in 8" :key="i" class="aspect-square rounded bg-surface-container animate-pulse"></div>
            </div>

            <div v-else-if="!albumsList.length" class="text-center py-xl">
                <Icon name="lucide:image-off" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Tidak ada album ditemukan</p>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
                <NuxtLink v-for="album in albumsList" :key="album.id" :to="`/galeri/${album.slug}`"
                    class="group relative aspect-square rounded overflow-hidden bg-surface-container shadow-layer-1 hover:shadow-layer-2 transition-shadow">
                    <img v-if="album.coverImage" :src="album.coverImage.path" :alt="album.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-surface-container">
                        <Icon name="lucide:image" size="28" class="text-on-surface-variant opacity-40" />
                    </div>

                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-3.5">
                        <span class="inline-flex self-start items-center gap-1 text-white/80 text-label-md mb-1">
                            <Icon name="lucide:image" size="10" />
                            {{ album.photoCount }} Foto
                        </span>
                        <h3 class="text-body-md text-white font-semibold leading-snug line-clamp-2">
                            {{ album.title }}
                        </h3>
                        <span class="text-label-md text-white/60 mt-0.5">
                            {{ formatDate(album.createdAt) }}
                        </span>
                    </div>
                </NuxtLink>
            </div>

            <div v-if="meta && meta.totalPages > 1" class="flex items-center justify-center gap-2 mt-xl">
                <button :disabled="!meta.hasPrevPage"
                    class="px-4 py-2 rounded border border-outline-variant text-body-md disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    @click="page--">
                    <Icon name="lucide:chevron-left" size="16" />
                </button>
                <span class="text-body-md text-on-surface-variant px-3">Halaman {{ meta.page }} dari {{ meta.totalPages
                    }}</span>
                <button :disabled="!meta.hasNextPage"
                    class="px-4 py-2 rounded border border-outline-variant text-body-md disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    @click="page++">
                    <Icon name="lucide:chevron-right" size="16" />
                </button>
            </div>
        </div>
    </div>
</template>