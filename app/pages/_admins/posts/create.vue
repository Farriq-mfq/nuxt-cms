<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Tambah Post' })

const router = useRouter()
const formRef = ref()

function handleSuccess() {
    formRef.value?.resetForm()
    router.push('/_admins/posts')
}

const fields = [
    {
        name: 'category', label: 'Kategori', type: 'combobox',
        apiUrl: '/api/_admins/posts-categories', labelKey: 'name', valueKey: 'id',
        multi: false, required: false, placeholder: 'Pilih kategori',
    },
    { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Judul post' },
    { name: 'excerpt', label: 'Ringkasan', type: 'textarea', required: false },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
    {
        name: 'thumbnail', label: 'Thumbnail', type: 'file',
        accept: 'image/png,image/jpeg,image/webp', required: false,
    },
    { name: 'is_published', label: 'Terbitkan', type: 'switch', required: false },
]
</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Tambah Post</h1>
        <AdminFormBase ref="formRef" :fields="fields" :mutation="createPost" success-message="Post berhasil dibuat"
            error-message="Gagal membuat post" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>