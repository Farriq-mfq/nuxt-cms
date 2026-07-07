<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const router = useRouter()

const fields = [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'isPublished', label: 'Terbit', type: 'checkbox', required: false },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
]

function handleSuccess(result: any) {
    router.push('/_admins/menus')
}
</script>

<template>
    <div class="max-w-full">
        <h1 class="text-headline-lg mb-md">Tambah Berita</h1>
        <div class="bg-surface-container-low shadow-layer-1 overflow-hidden border border-surface-variant p-4">
            <AdminFormBase :fields="fields" :mutation="createNews" success-message="Berita berhasil dibuat"
                error-message="Gagal membuat berita" show-cancel @success="handleSuccess" @cancel="router.back()" />
        </div>
    </div>
</template>