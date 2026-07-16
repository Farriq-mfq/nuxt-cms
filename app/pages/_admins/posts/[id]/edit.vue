<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Post' })

const router = useRouter()
const route = useRoute()
const formRef = ref()

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Post tidak ditemukan', fatal: true })
}

const {
    data: postData,
    pending: postPending,
    error: postError
} = await useFetch(`/api/_admins/posts/${route.params.id}`)

if (postError.value) {
    throw createError({
        statusCode: postError.value.statusCode ?? 404,
        statusMessage: postError.value.statusMessage ?? 'Post tidak ditemukan',
        fatal: true,
    })
}

function handleSuccess() {
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

const initialData = computed(() => {
    const n = postData.value?.data
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
        <h1 class="text-headline-lg mb-md">Edit Post</h1>
        <AdminFormBase v-if="!postPending" ref="formRef" :initial-data="initialData" :fields="fields"
            :mutation="updatePost" submit-label="Update" success-message="Post berhasil diperbarui"
            error-message="Gagal memperbarui post" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>