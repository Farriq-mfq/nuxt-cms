<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
    text: string
    label: string
    successMessage?: string
}>()

const toast = useToast()
const { copy, copied } = useClipboard({ source: props.text })

async function handleCopy() {
    await copy(props.text)
}

watch(copied, (val) => {
    if (val) {
        toast.success({ title: 'Berhasil', message: props.successMessage || 'Berhasil disalin' })
    }
})
</script>

<template>
    <button class="text-secondary hover:underline text-label-md" @click="handleCopy">
        <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" size="18" /> {{ label }}
    </button>
</template>