<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Tambah Album Video' })

const router = useRouter()
const formRef = ref()

function handleSuccess(result: any) {
    router.push(`/_admins/video-albums/${result.data.id}/edit`)
}

const fields = [
    { name: 'title', label: 'Judul Album', type: 'text', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea', required: false },
    { name: 'cover', label: 'Cover', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
]
</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Tambah Album Video</h1>
        <AdminFormBase ref="formRef" :fields="fields" :mutation="createVideoAlbum"
            success-message="Album video berhasil dibuat" error-message="Gagal membuat album video" show-cancel
            cancel-label="Kembali" @success="handleSuccess" @cancel="router.back()" />
        <p class="text-label-md text-on-surface-variant mt-md">
            Setelah album dibuat, kamu akan diarahkan ke halaman edit untuk menambahkan video.
        </p>
    </div>
</template>