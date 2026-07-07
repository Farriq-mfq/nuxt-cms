<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import type { Node } from '@tiptap/pm/model'

const props = defineProps<{
    node: Node & { attrs: { src: string; alt?: string; title?: string; width?: string; align?: string } }
    updateAttributes: (attrs: Record<string, any>) => void
    deleteNode: () => void
    selected: boolean
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const alignClass = computed(() => {
    switch (props.node.attrs.align) {
        case 'left': return 'float-left mr-4 mb-2'
        case 'right': return 'float-right ml-4 mb-2'
        default: return 'mx-auto block'
    }
})

const widthStyle = computed(() => {
    return props.node.attrs.width ? { width: props.node.attrs.width } : {}
})

function setAlign(align: 'left' | 'center' | 'right') {
    props.updateAttributes({ align })
}

function startResize(event: PointerEvent) {
    event.preventDefault()
    isResizing.value = true
    startX.value = event.clientX
    startWidth.value = imgRef.value?.offsetWidth ?? 0

    window.addEventListener('pointermove', onResize)
    window.addEventListener('pointerup', stopResize)
}

function onResize(event: PointerEvent) {
    if (!isResizing.value) return
    const delta = event.clientX - startX.value
    const newWidth = Math.max(80, startWidth.value + delta)
    props.updateAttributes({ width: `${newWidth}px` })
}

function stopResize() {
    isResizing.value = false
    window.removeEventListener('pointermove', onResize)
    window.removeEventListener('pointerup', stopResize)
}

const confirm = useConfirm()
const toast = useToast()
const isDeleting = ref(false)

async function remove() {
    const imageId = props.node.attrs.id

    if (!imageId) {
        props.deleteNode()
        return
    }

    const isConfirmed = await confirm.open({
        title: 'Hapus Gambar',
        message: 'Yakin ingin menghapus gambar ini?',
        confirmLabel: 'Ya, Hapus',
        danger: true,
    })

    if (!isConfirmed) return

    isDeleting.value = true

    try {
        await $fetch(`/api/upload/image/${imageId}`, { method: 'DELETE' })
        toast.success({ title: 'Berhasil', message: 'Gambar berhasil dihapus' })
        props.deleteNode()
    } catch (err: any) {
        toast.error({
            title: 'Gagal',
            message: err?.data?.data?.message ?? 'Gagal menghapus gambar dari server',
        })
    } finally {
        isDeleting.value = false
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onResize)
    window.removeEventListener('pointerup', stopResize)
})
</script>

<template>
    <NodeViewWrapper as="div" class="relative inline-block" :class="alignClass" :style="widthStyle">
        <div class="relative" :class="selected && 'ring-2 ring-secondary rounded'">
            <img ref="imgRef" :src="node.attrs.src" :alt="node.attrs.alt" :title="node.attrs.title"
                class="rounded max-w-full block select-none" draggable="false" />

            <div v-if="selected"
                class="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-outline-variant rounded shadow-layer-2 px-1 py-1 z-10">
                <button type="button" class="p-1 rounded hover:bg-surface-container-low transition-colors"
                    :class="node.attrs.align === 'left' && 'bg-secondary-container/40'" @click="setAlign('left')">
                    <Icon name="lucide:align-left" size="14" />
                </button>
                <button type="button" class="p-1 rounded hover:bg-surface-container-low transition-colors"
                    :class="node.attrs.align === 'center' && 'bg-secondary-container/40'" @click="setAlign('center')">
                    <Icon name="lucide:align-center" size="14" />
                </button>
                <button type="button" class="p-1 rounded hover:bg-surface-container-low transition-colors"
                    :class="node.attrs.align === 'right' && 'bg-secondary-container/40'" @click="setAlign('right')">
                    <Icon name="lucide:align-right" size="14" />
                </button>

                <div class="w-px h-4 bg-outline-variant mx-0.5"></div>

                <button type="button" class="p-1 rounded hover:bg-error-container text-error transition-colors"
                    @click="remove">
                    <Icon name="lucide:trash-2" size="14" />
                </button>
            </div>

            <div v-if="selected"
                class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-white rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 shadow-layer-1"
                @pointerdown="startResize"></div>
        </div>
    </NodeViewWrapper>
</template>