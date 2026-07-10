<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { setting } = useSetting()

const { data, error } = await useAsyncData(`public-page-${slug}`, () =>
    $fetch(`/api/public/pages/${slug}`)
)

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Halaman tidak ditemukan',
        fatal: true,
    })
}

const page = computed(() => data.value?.data)

useHead({
    title: page.value?.metaTitle || page.value?.title,
    meta: [
        { name: 'description', content: page.value?.metaDescription || '' },
        { property: 'og:title', content: page.value?.metaTitle || page.value?.title || '' },
        { property: 'og:description', content: page.value?.metaDescription || '' },
        { property: 'og:image', content: page.value?.metaImage || '' },
    ],
})

const toc = ref<{ id: string; text: string; level: 2 | 3 }[]>([])

function handleToc(items: typeof toc.value) {
    toc.value = items
}

function scrollToHeading(id: string) {
    const el = document.getElementById(id)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

function formatDate(date: string | undefined): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function handlePrint() {
    window.print()
}

const isCopied = ref(false)
async function handleShare() {
    if (import.meta.client) {
        await navigator.clipboard.writeText(window.location.href)
        isCopied.value = true
        setTimeout(() => (isCopied.value = false), 2000)
    }
}
</script>

<template>
    <div v-if="page" class="bg-surface-container-lowest">
        <PublicBreadcrumb :items="[{ label: 'Beranda', to: '/' }, { label: page.title }]" />

        <div class="max-w-6xl mx-auto px-margin py-xl">
            <header class="mb-xl">
                <div class="flex items-start gap-4">
                    <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                    <div>
                        <span class="text-label-md uppercase tracking-widest text-secondary">Halaman</span>
                        <h1
                            class="text-display-lg-mobile lg:text-display-lg text-on-surface font-extrabold leading-tight mt-1">
                            {{ page.title }}
                        </h1>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 mt-md pl-5 text-label-md text-on-surface-variant">
                    <span v-if="page.updatedAt" class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar-clock" size="14" />
                        Diperbarui {{ formatDate(page.updatedAt) }}
                    </span>
                    <button class="flex items-center gap-1.5 hover:text-secondary transition-colors"
                        @click="handlePrint">
                        <Icon name="lucide:printer" size="14" />
                        Cetak
                    </button>
                    <button class="flex items-center gap-1.5 hover:text-secondary transition-colors"
                        @click="handleShare">
                        <Icon :name="isCopied ? 'lucide:check' : 'lucide:link'" size="14" />
                        {{ isCopied ? 'Tersalin' : 'Bagikan' }}
                    </button>
                </div>
            </header>

            <div class="grid lg:grid-cols-[1fr_260px] gap-xl items-start">
                <div class="order-2 lg:order-1">
                    <PublicRichContent :content="page.content" generate-toc @toc="handleToc" />
                </div>

                <aside v-if="toc.length" class="order-1 lg:order-2 lg:sticky lg:top-24">
                    <div class="border border-outline-variant rounded bg-white p-4 shadow-layer-1">
                        <span
                            class="text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                            <Icon name="lucide:list" size="14" />
                            Daftar Isi
                        </span>

                        <nav class="mt-3 space-y-0.5">
                            <button v-for="item in toc" :key="item.id"
                                class="block w-full text-left text-body-md text-on-surface-variant hover:text-secondary transition-colors py-1.5"
                                :class="item.level === 3 && 'pl-4 text-label-md'" @click="scrollToHeading(item.id)">
                                {{ item.text }}
                            </button>
                        </nav>
                    </div>
                </aside>
            </div>

            <div
                class="mt-xl pt-md border-t border-outline-variant flex items-center gap-2 text-label-md text-on-surface-variant">
                <Icon name="lucide:info" size="14" />
                Informasi pada halaman ini dikelola resmi oleh {{ setting.appName }}.
            </div>
        </div>
    </div>
</template>

<style>
@media print {

    header nav,
    aside,
    .border-b {
        display: none !important;
    }
}
</style>