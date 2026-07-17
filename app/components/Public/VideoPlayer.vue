<script setup lang="ts">
const props = defineProps<{
    videoId: string
    title: string
}>()

const isPlaying = ref(false)

function thumbnailUrl(): string {
    return `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`
}
</script>

<template>
    <div class="relative aspect-video rounded overflow-hidden bg-black">
        <template v-if="!isPlaying">
            <img :src="thumbnailUrl()" :alt="title" class="w-full h-full object-cover" />
            <button
                class="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                @click="isPlaying = true">
                <div
                    class="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-colors">
                    <Icon name="lucide:play" size="28" class="text-primary ml-1" />
                </div>
            </button>
        </template>

        <iframe v-else :src="`https://www.youtube.com/embed/${videoId}?autoplay=1`" :title="title" class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen />
    </div>
</template>