<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})

useHead({ title: 'Edit Halaman' })

const router = useRouter()
const route = useRoute()
const formRef = ref()

function handleSuccess(result: any) {
    router.push('/_admins/pages')
}

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
}

const {
    data: page,
    pending: pagePending,
    error: pageError
} = await useFetch(`/api/_admins/pages/${route.params.id}`)

if (pageError.value) {
    throw createError({
        statusCode: pageError.value.statusCode ?? 404,
        statusMessage: pageError.value.statusMessage ?? 'Halaman tidak ditemukan',
        fatal: true,
    })
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
        <h1 class="text-headline-lg mb-md">Edit Halaman</h1>
        <AdminFormBase ref="formRef" :initial-data="{
            id: page.data.id,
            title: page.data.title,
            content: page.data.content,
            meta_title: page.data.metaTitle,
            meta_description: page.data.metaDescription,
            meta_image: page.data.metaImage,
            is_published: Boolean(page.data.isPublished)
        }" :fields="fields" :mutation="updatePage" success-message="Halaman berhasil diupdate" submit-label="Update"
            error-message="Gagal update halaman" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>