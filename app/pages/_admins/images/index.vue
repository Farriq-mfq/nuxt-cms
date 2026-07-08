<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
    layout: 'admin'
})

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadedUrl = ref('')

async function handleUpload() {
    const file = fileInput.value?.files?.[0]

    const formData = new FormData()
    formData.append('file', file)

    uploading.value = true
    try {
        const res = await $fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
        })
        uploadedUrl.value = res.data.path
    } catch (err) {
        console.error(err)
    } finally {
        uploading.value = false
    }
}

</script>

<template>
    <!-- <div class="p-md bg-surface border border-outline-variant rounded shadow-layer-1">
        <label class="text-label-md uppercase tracking-wide text-on-surface-variant">
            Upload Gambar
        </label>
        <input ref="fileInput" type="file" accept="image/*" class="mt-sm block" />
        <button @click="handleUpload" :disabled="uploading"
            class="mt-md bg-secondary text-on-secondary rounded px-6 py-3 disabled:opacity-50">
            {{ uploading ? 'Mengupload...' : 'Upload' }}
        </button>

        <img v-if="uploadedUrl" :src="uploadedUrl" class="mt-md rounded max-w-xs" />
    </div> -->
</template>