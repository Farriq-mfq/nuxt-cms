<script setup lang="ts">
const route = useRoute()
const router = useRouter()

useHead({ title: 'Berita' })

const page = ref(Number(route.query.page) || 1)
const search = ref((route.query.search as string) || '')
const activeCategorySlug = ref((route.query.category as string) || '')

const { data: categoriesData } = await useAsyncData('public-news-categories', () =>
    $fetch('/api/public/news-categories')
)
const categories = computed(() => categoriesData.value?.data ?? [])

const { data, pending, refresh } = await useAsyncData(
    'public-news-list',
    () => $fetch('/api/public/news', {
        query: {
            page: page.value,
            limit: 9,
            search: search.value || undefined,
            categorySlug: activeCategorySlug.value || undefined,
        },
    }),
    { watch: [page, search, activeCategorySlug] }
)

const newsItems = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

watch([page, search, activeCategorySlug], () => {
    router.replace({
        query: {
            ...(page.value > 1 && { page: page.value }),
            ...(search.value && { search: search.value }),
            ...(activeCategorySlug.value && { category: activeCategorySlug.value }),
        },
    })
})

function selectCategory(slug: string) {
    activeCategorySlug.value = activeCategorySlug.value === slug ? '' : slug
    page.value = 1
}

let searchDebounce: ReturnType<typeof setTimeout>
const searchInput = ref(search.value)
watch(searchInput, (val) => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        search.value = val
        page.value = 1
    }, 400)
})

function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>

    <PublicContainer>
        <div class="flex flex-col gap-md">
            <header class="flex items-start gap-4 mb-lg">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Daftar Berita
                    </h1>
                </div>
            </header>

            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-lg">
                <div class="relative flex-1 max-w-md">
                    <input v-model="searchInput" type="text" placeholder="Cari berita..."
                        class="w-full bg-white border border-outline-variant rounded px-2 py-2.5 text-body-md focus:border-secondary outline-none" />
                </div>

                <div v-if="categories.length" class="flex items-center gap-2 overflow-x-auto pb-1">
                    <button v-for="cat in categories" :key="cat.id"
                        class="shrink-0 px-4 py-2 rounded-full text-label-md border transition-colors whitespace-nowrap"
                        :class="activeCategorySlug === cat.slug
                            ? 'bg-secondary text-on-secondary border-secondary'
                            : 'bg-white text-on-surface-variant border-outline-variant hover:border-secondary'"
                        @click="selectCategory(cat.slug)">
                        {{ cat.name }}
                    </button>
                </div>
            </div>

            <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                <div v-for="i in 6" :key="i" class="aspect-[4/3] rounded bg-surface-container animate-pulse"></div>
            </div>

            <div v-else-if="!newsItems.length" class="text-center py-xl">
                <Icon name="lucide:newspaper" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Berita tidak ditemukan</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                <PublicNewsCard v-for="item in newsItems" :key="item.id" :news="item" />
            </div>

            <div v-if="meta && meta.totalPages > 1" class="flex items-center justify-center gap-2 mt-xl">
                <button :disabled="!meta.hasPrevPage"
                    class="px-4 py-2 rounded border border-outline-variant text-body-md disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    @click="page--">
                    <Icon name="lucide:chevron-left" size="16" />
                </button>
                <span class="text-body-md text-on-surface-variant px-3">
                    Halaman {{ meta.page }} dari {{ meta.totalPages }}
                </span>
                <button :disabled="!meta.hasNextPage"
                    class="px-4 py-2 rounded border border-outline-variant text-body-md disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    @click="page++">
                    <Icon name="lucide:chevron-right" size="16" />
                </button>
            </div>
        </div>
    </PublicContainer>
</template>