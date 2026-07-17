<script setup lang="ts">
const { data } = await useAsyncData('public-popup', () => $fetch('/api/public/popup'))
const popup = computed(() => data.value?.data)

const isVisible = ref(false)
const STORAGE_KEY = 'popup-dismissed-id'

onMounted(() => {
    if (!popup.value) return

    const dismissedId = sessionStorage.getItem(STORAGE_KEY)
    if (dismissedId === String(popup.value.id)) return

    setTimeout(() => {
        isVisible.value = true
        document.body.style.overflow = 'hidden'
    }, 800)
})

function close() {
    isVisible.value = false
    document.body.style.overflow = ''
    if (popup.value) {
        sessionStorage.setItem(STORAGE_KEY, String(popup.value.id))
    }
}
</script>

<template>
    <Teleport to="body">
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isVisible && popup"
                class="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-margin" @click.self="close">
                <div class="relative max-w-md w-full bg-white rounded shadow-layer-2 overflow-hidden">
                    <button
                        class="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                        @click="close">
                        <Icon name="lucide:x" size="16" />
                    </button>

                    <component :is="popup.linkUrl ? 'a' : 'div'" :href="popup.linkUrl ?? undefined" target="_blank"
                        rel="noopener noreferrer">
                        <img v-if="popup.image" :src="popup.image.path" :alt="popup.title" class="w-full h-auto" />
                    </component>
                </div>
            </div>
        </transition>
    </Teleport>
</template>