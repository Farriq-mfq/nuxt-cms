<script setup lang="ts">
const route = useRoute()
const router = useRouter()

useHead({ title: 'Post' })

const page = ref(Number(route.query.page) || 1)
const search = ref((route.query.search as string) || '')
const activeCategorySlug = ref((route.query.category as string) || '')

const { data: categoriesData } = await useAsyncData('public-post-categories', () =>
    $fetch('/api/public/posts-categories')
)
const categories = computed(() => categoriesData.value?.data ?? [])

const { data, pending, refresh } = await useAsyncData(
    'public-post-list',
    () => $fetch('/api/public/posts', {
        query: {
            page: page.value,
            limit: 9,
            search: search.value || undefined,
            categorySlug: activeCategorySlug.value || undefined,
        },
    }),
    { watch: [page, search, activeCategorySlug] }
)

const postItems = computed(() => data.value?.data ?? [])
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

</script>

<template>
    <PublicContainer>
        <PublicBreadcrumb :items="[{
            label: 'Post',
            to: '/post'
        }]" />
        <div class="flex flex-col gap-md mt-lg">
            <header class="flex items-start gap-4 mb-lg">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Daftar Post
                    </h1>
                </div>
            </header>

            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-lg">
                <div class="relative flex-1 max-w-md">
                    <input v-model="searchInput" type="text" placeholder="Cari post..."
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

            <div v-else-if="!postItems.length" class="text-center py-xl">
                <Icon name="lucide:postpaper" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Post tidak ditemukan</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                <PublicPostCard v-for="item in postItems" :key="item.id" :post="item" />
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