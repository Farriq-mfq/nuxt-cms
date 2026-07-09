<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Berita' })

const router = useRouter()
const route = useRoute()
const formRef = ref()

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Berita tidak ditemukan', fatal: true })
}

const {
    data: newsData,
    pending: newsPending,
    error: newsError
} = await useFetch(`/api/_admins/news/${route.params.id}`)

if (newsError.value) {
    throw createError({
        statusCode: newsError.value.statusCode ?? 404,
        statusMessage: newsError.value.statusMessage ?? 'Berita tidak ditemukan',
        fatal: true,
    })
}

function handleSuccess() {
    router.push('/_admins/news')
}

const fields = [
    {
        name: 'category', label: 'Kategori', type: 'combobox',
        apiUrl: '/api/_admins/news-categories', labelKey: 'name', valueKey: 'id',
        multi: false, required: false, placeholder: 'Pilih kategori',
    },
    { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Judul berita' },
    { name: 'excerpt', label: 'Ringkasan', type: 'textarea', required: false },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
    {
        name: 'thumbnail', label: 'Thumbnail', type: 'file',
        accept: 'image/png,image/jpeg,image/webp', required: false,
    },
    { name: 'is_published', label: 'Terbitkan', type: 'switch', required: false },
]

const initialData = computed(() => {
    const n = newsData.value?.data
    if (!n) return {}

    return {
        id: n.id,
        category: n.category,
        title: n.title,
        excerpt: n.excerpt ?? '',
        content: n.content,
        thumbnail: n.thumbnail?.path,
        is_published: Boolean(n.isPublished),
    }
})
</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Edit Berita</h1>
        <AdminFormBase v-if="!newsPending" ref="formRef" :initial-data="initialData" :fields="fields"
            :mutation="updateNews" submit-label="Update" success-message="Berita berhasil diperbarui"
            error-message="Gagal memperbarui berita" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>