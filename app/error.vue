<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
    error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const isNotFound = computed(() => statusCode.value === 404)
const { setting } = useSetting()
const { currentDarkMode } = useTheme()


const heading = computed(() => {
    if (isNotFound.value) return 'Halaman Tidak Ditemukan'
    if (statusCode.value === 403) return 'Akses Ditolak'
    return 'Terjadi Kesalahan'
})

const description = computed(() => {
    if (isNotFound.value)
        return 'Foto atau halaman yang kamu cari sudah dipindahkan, dihapus, atau memang tidak pernah ada.'
    if (statusCode.value === 403)
        return 'Kamu tidak punya izin untuk membuka halaman ini.'
    return 'Ada yang tidak beres di sisi kami. Coba muat ulang, atau kembali beberapa saat lagi.'
})

const isDev = import.meta.dev

function goHome() {
    clearError({ redirect: '/' })
}

function reload() {
    reloadNuxtApp({ path: window.location.pathname })
}

useHead({
    title: `${statusCode.value} — ${heading.value}`,
    htmlAttrs: {
        lang: 'id',
        'data-theme': currentDarkMode(setting.value?.appTheme),
    },
})
</script>

<template>
    <div class="min-h-screen bg-surface-container-lowest flex items-center justify-center px-margin py-xl">
        <div class="max-w-md w-full text-center">
            <div class="relative mx-auto mb-lg w-32 h-32 flex items-center justify-center">
                <div
                    class="absolute inset-0 rounded bg-surface-container border border-outline-variant rotate-[-6deg] shadow-sm">
                </div>
                <div
                    class="absolute inset-0 rounded bg-surface-container-low border border-outline-variant rotate-[4deg] shadow-sm flex flex-col items-center justify-center gap-2 p-4">
                    <Icon name="lucide:image-off" size="34" class="text-on-surface-variant opacity-50" />
                    <div class="w-10 h-1.5 rounded-full bg-outline-variant opacity-50"></div>
                </div>
                <span
                    class="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-secondary flex items-center justify-center rotate-[8deg] shadow-md">
                    <Icon name="lucide:x" size="18" class="text-on-secondary" />
                </span>
            </div>

            <div class="flex items-start justify-center gap-4 mb-md">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div class="text-left">
                    <span class="text-label-md uppercase tracking-widest text-secondary">
                        Error {{ statusCode }}
                    </span>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">
                        {{ heading }}
                    </h1>
                </div>
            </div>

            <p class="text-body-md text-on-surface-variant mb-lg">
                {{ description }}
            </p>

            <div class="flex flex-wrap items-center justify-center gap-3">
                <button
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-on-secondary text-label-lg font-medium hover:opacity-90 transition-opacity"
                    @click="goHome">
                    <Icon name="lucide:home" size="16" />
                    Kembali ke Beranda
                </button>

                <button v-if="!isNotFound"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant text-label-lg font-medium hover:bg-surface-container transition-colors"
                    @click="reload">
                    <Icon name="lucide:refresh-cw" size="16" />
                    Coba Lagi
                </button>
            </div>

            <details v-if="isDev && error?.message" class="mt-xl text-left">
                <summary class="text-label-md text-on-surface-variant cursor-pointer select-none">
                    Detail teknis (hanya tampil di dev mode)
                </summary>
                <pre
                    class="mt-3 p-3 rounded bg-surface-container text-label-md text-on-surface-variant overflow-x-auto whitespace-pre-wrap">{{ error.message }}</pre>
            </details>
        </div>
    </div>
</template>