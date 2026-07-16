<script setup lang="ts">
const props = withDefaults(defineProps<{
    title?: string
    url?: string
}>(), {
    title: '',
})

const route = useRoute()
const toast = useToast()

const shareUrl = computed(() => {
    if (props.url) return props.url
    if (import.meta.client) return window.location.href
    return route.fullPath
})

const shareTitle = computed(() => props.title || document?.title || '')

const platforms = [
    {
        key: 'twitter',
        icon: 'lucide:twitter',
        label: 'Twitter/X',
        hoverClass: 'hover:bg-black hover:text-white',
        getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle.value)}&url=${encodeURIComponent(shareUrl.value)}`,
    },
    {
        key: 'facebook',
        icon: 'lucide:facebook',
        label: 'Facebook',
        hoverClass: 'hover:bg-[#1877F2] hover:text-white',
        getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`,
    },
    {
        key: 'whatsapp',
        icon: 'lucide:message-circle',
        label: 'WhatsApp',
        hoverClass: 'hover:bg-[#25D366] hover:text-white',
        getUrl: () => `https://wa.me/?text=${encodeURIComponent(`${shareTitle.value} - ${shareUrl.value}`)}`,
    },
    {
        key: 'linkedin',
        icon: 'lucide:linkedin',
        label: 'LinkedIn',
        hoverClass: 'hover:bg-[#0A66C2] hover:text-white',
        getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`,
    },
]

function openShare(getUrl: () => string) {
    window.open(getUrl(), '_blank', 'noopener,noreferrer,width=600,height=500')
}

const isCopied = ref(false)

async function copyLink() {
    try {
        await navigator.clipboard.writeText(shareUrl.value)
        isCopied.value = true
        toast.success({ title: 'Berhasil', message: 'Tautan disalin ke clipboard' })
        setTimeout(() => (isCopied.value = false), 2000)
    } catch {
        toast.error({ title: 'Gagal', message: 'Tidak bisa menyalin tautan' })
    }
}
</script>

<template>
    <div class="flex items-center gap-3 flex-wrap">
        <span class="flex items-center gap-1.5 text-label-md uppercase tracking-wide text-on-surface-variant">
            <Icon name="lucide:share-2" size="14" />
            Bagikan
        </span>

        <div class="flex items-center gap-2">
            <button v-for="platform in platforms" :key="platform.key" type="button"
                :title="`Bagikan ke ${platform.label}`"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-all duration-200 hover:scale-110 hover:shadow-layer-1"
                :class="platform.hoverClass" @click="openShare(platform.getUrl)">
                <Icon :name="platform.icon" size="16" />
            </button>

            <button type="button" title="Salin tautan"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-all duration-200 hover:scale-110 hover:shadow-layer-1 hover:bg-secondary hover:text-on-secondary relative"
                @click="copyLink">
                <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-50"
                    enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150"
                    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-50" mode="out-in">
                    <Icon v-if="!isCopied" key="link" name="lucide:link" size="16" />
                    <Icon v-else key="check" name="lucide:check" size="16" class="text-green-600" />
                </transition>
            </button>
        </div>
    </div>
</template>