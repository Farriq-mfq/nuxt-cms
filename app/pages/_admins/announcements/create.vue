<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Tambah Pengumuman' })

const router = useRouter()
const formRef = ref()

function handleSuccess() {
    formRef.value?.resetForm()
    router.push('/_admins/announcements')
}

const fields = [
    { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Judul pengumuman' },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
    { name: 'thumbnail', label: 'Thumbnail', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'is_published', label: 'Terbitkan', type: 'switch', required: false },
]
</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Tambah Pengumuman</h1>
        <AdminFormBase ref="formRef" :fields="fields" :mutation="createAnnouncement"
            success-message="Pengumuman berhasil dibuat" error-message="Gagal membuat pengumuman" show-cancel
            cancel-label="Kembali" @success="handleSuccess" @cancel="router.back()" />
    </div>
</template>