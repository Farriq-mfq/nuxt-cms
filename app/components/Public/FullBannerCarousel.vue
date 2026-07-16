<script setup lang="ts">
interface BannerItem {
    id: number
    title: string
    description: string | null
    linkUrl: string | null
    image: { path: string } | null
}

const AUTOPLAY_DURATION = 5000

const { data } = await useAsyncData('public-banners', () =>
    $fetch<{ success: boolean; data: BannerItem[] }>('/api/public/banners')
)

const banners = computed(() => data.value?.data ?? [])
const activeIndex = ref(0)
const isPaused = ref(false)
const progressKey = ref(0)

let autoplayTimer: ReturnType<typeof setTimeout> | null = null

function goTo(index: number) {
    activeIndex.value = index
    restartAutoplay()
}

function next() {
    activeIndex.value = (activeIndex.value + 1) % banners.value.length
    restartAutoplay()
}

function prev() {
    activeIndex.value = (activeIndex.value - 1 + banners.value.length) % banners.value.length
    restartAutoplay()
}

function restartAutoplay() {
    progressKey.value++
    stopAutoplay()
    startAutoplay()
}

function startAutoplay() {
    if (banners.value.length <= 1) return
    autoplayTimer = setTimeout(() => {
        if (!isPaused.value) next()
        else startAutoplay()
    }, AUTOPLAY_DURATION)
}

function stopAutoplay() {
    if (autoplayTimer) clearTimeout(autoplayTimer)
}

const indexLabel = computed(() => {
    const current = String(activeIndex.value + 1).padStart(2, '0')
    const total = String(banners.value.length).padStart(2, '0')
    return `${current} / ${total}`
})

onMounted(startAutoplay)
onBeforeUnmount(stopAutoplay)
</script>

<template>
    <section v-if="banners.length" class="relative w-full h-screen min-h-[560px] overflow-hidden bg-primary -mt-16"
        @mouseenter="isPaused = true" @mouseleave="isPaused = false">

        <transition mode="out-in" enter-active-class="transition duration-700 ease-out"
            enter-from-class="opacity-0 scale-105" enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <img v-if="banners[activeIndex].image" :key="activeIndex" :src="banners[activeIndex].image!.path"
                :alt="banners[activeIndex].title" class="absolute inset-0 w-full h-full object-cover" />
        </transition>

        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent hidden lg:block"></div>

        <!-- Konten -->
        <div class="relative z-10 h-full flex items-end lg:items-center">
            <div class="max-w-7xl mx-auto w-full px-margin pb-16 lg:pb-0">
                <div class="max-w-3xl">
                    <span class="inline-flex items-center gap-2 text-label-md uppercase tracking-[0.2em] text-white/60">
                        <span class="w-8 h-px bg-white/40"></span>
                        {{ indexLabel }}
                    </span>

                    <transition mode="out-in" enter-active-class="transition duration-500 ease-out"
                        enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
                        leave-to-class="opacity-0">
                        <div :key="activeIndex" class="mt-4">
                            <h1
                                class="text-headline-lg sm:text-display-lg-mobile lg:text-[64px] xl:text-[76px] font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-lg">
                                {{ banners[activeIndex].title }}
                            </h1>
                            <p v-if="banners[activeIndex].description"
                                class="text-body-lg sm:text-title-md lg:text-headline-sm text-white/80 mt-4 max-w-2xl leading-relaxed line-clamp-2 lg:line-clamp-3">
                                {{ banners[activeIndex].description }}
                            </p>

                            <a v-if="banners[activeIndex].linkUrl" :href="banners[activeIndex].linkUrl!" target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 mt-8 bg-secondary text-on-secondary rounded px-6 py-3 text-body-lg font-semibold hover:brightness-110 hover:gap-3 transition-all">
                                Selengkapnya
                                <Icon name="lucide:arrow-right" size="18" />
                            </a>
                        </div>
                    </transition>
                </div>

                <div v-if="banners.length > 1" class="flex items-center gap-1.5 mt-10 max-w-md">
                    <button v-for="(banner, index) in banners" :key="banner.id"
                        class="relative h-1 flex-1 rounded-full bg-white/20 overflow-hidden" @click="goTo(index)">
                        <span v-if="index === activeIndex" :key="`${activeIndex}-${progressKey}`"
                            class="absolute inset-y-0 left-0 bg-white rounded-full animate-[fillbar_5s_linear_forwards]"
                            :style="{ animationPlayState: isPaused ? 'paused' : 'running' }" />
                        <span v-else-if="index < activeIndex" class="absolute inset-0 bg-white/70 rounded-full" />
                    </button>
                </div>
            </div>
        </div>

        <div v-if="banners.length > 1" class="hidden lg:flex absolute bottom-10 right-margin items-center gap-2 z-10">
            <button
                class="w-11 h-11 flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                @click="prev">
                <Icon name="lucide:arrow-left" size="18" />
            </button>
            <button
                class="w-11 h-11 flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                @click="next">
                <Icon name="lucide:arrow-right" size="18" />
            </button>
        </div>
    </section>
</template>

<style scoped>
@keyframes fillbar {
    from {
        width: 0%;
    }

    to {
        width: 100%;
    }
}
</style>