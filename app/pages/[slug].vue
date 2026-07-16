<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
const route = useRoute()
const slug = route.params.slug as string

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

const activeHeadingId = ref<string | null>(null)
const readProgress = ref(0)
let observer: IntersectionObserver | null = null

function setupScrollSpy() {
    observer?.disconnect()
    if (!toc.value.length) return

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activeHeadingId.value = entry.target.id
                }
            })
        },
        { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )

    toc.value.forEach((item) => {
        const el = document.getElementById(item.id)
        if (el) observer!.observe(el)
    })
}

function updateReadProgress() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    readProgress.value = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
}

watch(toc, async () => {
    await nextTick()
    setupScrollSpy()
    if (toc.value.length && !activeHeadingId.value) {
        activeHeadingId.value = toc.value[0].id
    }
})

onMounted(() => {
    window.addEventListener('scroll', updateReadProgress, { passive: true })
})

onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('scroll', updateReadProgress)
})

function scrollToHeading(id: string) {
    const el = document.getElementById(id)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}



</script>

<template>
    <div v-if="page">
        <PublicContainer>
            <PublicBreadcrumb :items="[{
                label: page.title,
                to: `/${page.slug}`
            }]" />
            <header class="mt-lg">
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

                <div class="flex flex-wrap items-center gap-4 mt-md text-label-md text-on-surface-variant">
                    <span v-if="page.updatedAt" class="flex items-center gap-1.5">
                        <Icon name="lucide:calendar-clock" size="14" />
                        Diperbarui {{ format(page.updatedAt, 'dd MMMM yyyy', { locale: id }) }}
                    </span>
                    <PublicShareOn :title="page.title" :url="page.path" />
                </div>
            </header>
            <PublicHr class="sm:hidden" />

            <div class="grid lg:grid-cols-[1fr_260px] gap-xl items-start sm:mt-lg mt-0">
                <div class="order-2 lg:order-1">
                    <PublicRichContent :content="page.content" generate-toc @toc="handleToc" />
                </div>

                <aside v-if="toc.length" class="order-1 lg:order-2 lg:sticky lg:top-24">
                    <div class="relative pl-5">
                        <div
                            class="absolute left-0 top-1 bottom-1 w-0.5 bg-outline-variant rounded-full overflow-hidden">
                            <div class="w-full bg-secondary rounded-full transition-all duration-300 ease-out"
                                :style="{ height: `${readProgress}%` }" />
                        </div>

                        <span
                            class="text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-3">
                            <Icon name="lucide:list" size="14" />
                            Daftar Isi
                        </span>

                        <nav class="space-y-1">
                            <button v-for="(item, index) in toc" :key="item.id"
                                class="group relative w-full text-left flex items-baseline gap-2.5 py-2 pr-2 rounded transition-colors"
                                :class="[
                                    item.level === 3 && 'pl-4',
                                    activeHeadingId === item.id ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface',
                                ]" @click="scrollToHeading(item.id)">
                                <span class="text-label-md tabular-nums shrink-0 transition-colors"
                                    :class="activeHeadingId === item.id ? 'text-secondary font-semibold' : 'text-on-surface-variant/50'">
                                    {{ String(index + 1).padStart(2, '0') }}
                                </span>

                                <span class="text-body-md leading-snug transition-all"
                                    :class="activeHeadingId === item.id ? 'font-semibold' : ''">
                                    {{ item.text }}
                                </span>

                                <span v-if="activeHeadingId === item.id"
                                    class="absolute -left-[22px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
                            </button>
                        </nav>
                    </div>
                </aside>
            </div>

        </PublicContainer>
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