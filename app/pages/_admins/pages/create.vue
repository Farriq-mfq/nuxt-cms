<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const router = useRouter()
const formRef = ref()

function handleSuccess(result: any) {
    // router.push('/_admins/menus')
    formRef.value?.resetForm()
}

const fields = [
    { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Judul halaman' },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
    { name: 'meta_title', label: 'Meta Title', type: 'text', required: false },
    { name: 'meta_description', label: 'Meta Description', type: 'textarea', required: false },
    {
        name: 'meta_image', label: 'Meta Image', type: 'file',
        accept: 'image/png,image/jpeg,image/webp',
        required: false,
    },
    { name: 'is_published', label: 'Published', type: 'switch', required: false },
]

</script>

<template>
    <div class="max-w-full p-5 border border-surface-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Tambah Halaman</h1>
        <AdminFormBase ref="formRef" :fields="fields" :mutation="createPage" success-message="Halaman berhasil dibuat"
            error-message="Gagal membuat halaman" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>