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
    <section v-if="banners.length" class="bg-primary">
        <div class="grid lg:grid-cols-[minmax(0,420px)_1fr] min-h-[420px] lg:min-h-[480px]"
            @mouseenter="isPaused = true" @mouseleave="isPaused = false">
            <div class="relative flex flex-col justify-between px-6 sm:px-10 py-10 lg:py-12 order-2 lg:order-1">
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary-fixe text-white/50">
                        {{ indexLabel }}
                    </span>

                    <transition mode="out-in" enter-active-class="transition duration-300 ease-out"
                        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100"
                        leave-to-class="opacity-0">
                        <div :key="activeIndex" class="mt-4">
                            <h2
                                class="text-headline-lg lg:text-display-lg-mobile font-extrabold text-white leading-tight">
                                {{ banners[activeIndex].title }}
                            </h2>
                            <p v-if="banners[activeIndex].description"
                                class="text-body-md text-white/70 mt-4 max-w-md line-clamp-3">
                                {{ banners[activeIndex].description }}
                            </p>


                            <a v-if="banners[activeIndex].linkUrl" :href="banners[activeIndex].linkUrl!" target="_blank"
                                rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-6 bg-secondary text-on-secondary rounded px-5
                                py-2.5 text-body-md hover:brightness-110 transition-all">
                                Selengkapnya
                                <Icon name="lucide:arrow-right" size="16" />
                            </a>
                        </div>
                    </transition>
                </div>

                <div v-if="banners.length > 1" class="flex items-center gap-1.5 mt-8">
                    <button v-for="(banner, index) in banners" :key="banner.id"
                        class="relative h-1 flex-1 rounded-full bg-white/15 overflow-hidden" @click="goTo(index)">
                        <span v-if="index === activeIndex" :key="`${activeIndex}-${progressKey}`"
                            class="absolute inset-y-0 left-0 bg-white rounded-full animate-[fillbar_5s_linear_forwards]"
                            :style="{ animationPlayState: isPaused ? 'paused' : 'running' }" />
                        <span v-else-if="index < activeIndex" class="absolute inset-0 bg-white/60 rounded-full" />
                    </button>
                </div>

                <div v-if="banners.length > 1" class="hidden lg:flex items-center gap-2 mt-4">
                    <button
                        class="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                        @click="prev">
                        <Icon name="lucide:arrow-left" size="16" />
                    </button>
                    <button
                        class="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                        @click="next">
                        <Icon name="lucide:arrow-right" size="16" />
                    </button>
                </div>
            </div>

            <div class="relative order-1 lg:order-2 overflow-hidden min-h-[240px]">
                <transition mode="out-in" enter-active-class="transition duration-500 ease-out"
                    enter-from-class="opacity-0 scale-105" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100"
                    leave-to-class="opacity-0">
                    <img v-if="banners[activeIndex].image" :key="activeIndex" :src="banners[activeIndex].image!.path"
                        :alt="banners[activeIndex].title" class="w-full h-full object-cover absolute inset-0" />
                </transition>

                <div class="hidden lg:block absolute top-0 bottom-0 left-0 w-16 bg-primary"
                    style="clip-path: polygon(0 0, 100% 0, 0 100%);" />
            </div>
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