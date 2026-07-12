<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

const { setting } = useSetting()
const { menu } = usePublicMenu()

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const router = useRouter()
const route = useRoute()


const openMobileGroups = ref<Set<number>>(new Set())

function toggleMobileGroup(id: number) {
    if (openMobileGroups.value.has(id)) {
        openMobileGroups.value.delete(id)
    } else {
        openMobileGroups.value.add(id)
    }
    openMobileGroups.value = new Set(openMobileGroups.value)
}

const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

function handleScroll() {
    isScrolled.value = window.scrollY > 10
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})


watch(isMobileMenuOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) openMobileGroups.value = new Set()
})

async function openSearch() {
    isSearchOpen.value = true
    isMobileMenuOpen.value = false
    await nextTick()
    searchInputRef.value?.focus()
}

function closeSearch() {
    isSearchOpen.value = false
    searchQuery.value = ''
}

function submitSearch() {
    if (!searchQuery.value.trim()) return
    router.push({ path: '/berita', query: { search: searchQuery.value.trim() } })
    closeSearch()
}

function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeSearch()
}
</script>
<!-- lg:bg-black lg:bg-opacity-10 lg:backdrop-filter lg:backdrop-blur-lg -->
<template>
    <header class="sticky top-0 z-40 bg-primary transition-shadow" :class="isScrolled && 'shadow-layer-2'">
        <div class="max-w-7xl mx-auto px-md xs:px-0">
            <div class="flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between h-16 gap-4">
                <NuxtLink to="/" class="flex items-center gap-2 shrink-0 lg:justify-self-start"
                    @click="isMobileMenuOpen = false">
                    <img v-if="setting?.appLogoHeader || setting?.appLogo"
                        :src="setting.appLogoHeader || setting.appLogo!" :alt="setting?.appName"
                        class="h-9 w-auto object-contain" />
                    <span v-else class="text-headline-md text-on-primary whitespace-nowrap">
                        {{ setting?.appName }}
                    </span>
                    <!-- <UIThemeSwitcher /> -->
                </NuxtLink>

                <nav :key="route.fullPath" class="hidden lg:flex items-center gap-1 lg:justify-self-center">
                    <NuxtLink to="/"
                        class="px-4 py-2 text-body-md text-white/70 hover:text-white transition-colors relative whitespace-nowrap after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
                        Beranda
                    </NuxtLink>

                    <PublicNavItem v-for="item in menu" :key="item.id" :item="item" :depth="0" />
                </nav>

                <div class="flex items-center gap-2 lg:gap-1 shrink-0 lg:justify-self-end">
                    <button
                        class="hidden lg:flex p-2 rounded text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10 transition-colors"
                        title="Cari Berita" @click="openSearch">
                        <Icon name="lucide:search" size="18" />
                    </button>

                    <button class="lg:hidden p-2 text-on-primary" @click="openSearch">
                        <Icon name="lucide:search" size="20" />
                    </button>

                    <button class="lg:hidden text-on-primary relative z-50"
                        @click="isMobileMenuOpen = !isMobileMenuOpen">
                        <Icon :name="isMobileMenuOpen ? 'lucide:x' : 'lucide:menu'" size="24" />
                    </button>
                </div>
            </div>
        </div>

        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 top-16 z-40 bg-black/40"
                @click.self="isMobileMenuOpen = false">
                <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2">
                    <div class="px-6 py-6 space-y-2 bg-primary">
                        <NuxtLink to="/"
                            class="flex items-center min-h-[44px] px-4 text-body-md text-white hover:bg-white/10 active:bg-white/15 transition-colors"
                            @click="isMobileMenuOpen = false">
                            Beranda
                        </NuxtLink>

                        <div class="h-px bg-white/10 my-3"></div>

                        <PublicMobileNavItem v-for="item in menu" :key="item.id" :item="item"
                            @navigate="isMobileMenuOpen = false" />
                    </div>
                </transition>
            </div>
        </transition>

        <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isSearchOpen"
                class="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-24 px-margin"
                @click.self="closeSearch">
                <div class="w-full max-w-xl bg-surface rounded shadow-layer-2 p-4">
                    <div class="flex items-center gap-3">
                        <Icon name="lucide:search" size="20" class="text-on-surface-variant shrink-0" />
                        <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Cari berita..."
                            class="flex-1 bg-transparent outline-none text-body-lg text-on-surface min-w-0"
                            @keyup.enter="submitSearch" @keydown="handleSearchKeydown" />
                        <button class="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
                            @click="closeSearch">
                            <Icon name="lucide:x" size="20" />
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </header>
</template>