<script setup lang="ts">
const isVisible = ref(false)
const scrollProgress = ref(0)

function handleScroll() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    isVisible.value = scrollTop > 400
    scrollProgress.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

let ticking = false
function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll()
            ticking = false
        })
        ticking = true
    }
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll()
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
})

const circumference = 2 * Math.PI * 18
const dashOffset = computed(() => circumference - (scrollProgress.value / 100) * circumference)
</script>

<template>
    <transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-50 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-50 translate-y-4">
        <button v-if="isVisible" type="button" title="Kembali ke atas"
            class="fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center group" @click="scrollToTop">
            <svg class="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" class="stroke-surface-container-high" stroke-width="2.5" />
                <circle cx="20" cy="20" r="18" fill="none" class="stroke-secondary transition-all duration-150"
                    stroke-width="2.5" stroke-linecap="round" :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset" />
            </svg>

            <div
                class="relative w-9 h-9 rounded-full bg-surface shadow-layer-2 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <Icon name="lucide:arrow-up" size="18" class="group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </button>
    </transition>
</template>