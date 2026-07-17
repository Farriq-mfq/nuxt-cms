<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
const route = useRoute()
const router = useRouter()

useHead({ title: 'Pengumuman' })

const page = ref(Number(route.query.page) || 1)

const { data, pending } = await useAsyncData(
    'public-announcements-list',
    () => $fetch('/api/public/announcements', { query: { page: page.value, limit: 8 } }),
    { watch: [page] }
)

const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

watch(page, () => {
    router.replace({ query: page.value > 1 ? { page: page.value } : {} })
})

function formatDate(date: string | null): string {
    if (!date) return ''
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}
</script>

<template>
    <PublicContainer>
        <PublicBreadcrumb :items="[{ label: 'Pengumuman' }]" />

        <div class="flex flex-col gap-md mt-lg">
            <header class="flex items-start gap-4 mb-md">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary">Informasi Resmi</span>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Pengumuman</h1>
                </div>
            </header>

            <div v-if="pending" class="space-y-3">
                <div v-for="i in 4" :key="i" class="h-28 rounded bg-surface-container animate-pulse"></div>
            </div>

            <div v-else-if="!items.length" class="text-center py-xl">
                <Icon name="lucide:megaphone-off" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Belum ada pengumuman</p>
            </div>

            <div v-else class="space-y-3">
                <NuxtLink v-for="item in items" :key="item.id" :to="`/pengumuman/${item.slug}`"
                    class="group flex gap-4 bg-white border border-outline-variant rounded shadow-layer-1 hover:shadow-layer-2 transition-shadow overflow-hidden">
                    <div class="w-28 sm:w-40 shrink-0 bg-surface-container">
                        <img v-if="item.thumbnail" :src="item.thumbnail.path" :alt="item.title"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center min-h-[100px]">
                            <Icon name="lucide:megaphone" size="24" class="text-on-surface-variant opacity-40" />
                        </div>
                    </div>

                    <div class="min-w-0 flex-1 py-3 pr-4">
                        <h3
                            class="text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors line-clamp-2">
                            {{ item.title }}
                        </h3>
                        <span class="flex items-center gap-1.5 text-label-md text-on-surface-variant mt-2">
                            <Icon name="lucide:calendar" size="12" />
                            {{ formatDate(item.publishedAt) }}
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
    </PublicContainer>
</template>