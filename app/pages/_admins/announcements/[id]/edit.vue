<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Pengumuman' })

const router = useRouter()
const route = useRoute()
const formRef = ref()

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Pengumuman tidak ditemukan', fatal: true })
}

const {
    data: announcementData,
    pending: announcementPending,
    error: announcementError,
} = await useFetch(`/api/_admins/announcements/${route.params.id}`)

if (announcementError.value) {
    throw createError({
        statusCode: announcementError.value.statusCode ?? 404,
        statusMessage: announcementError.value.statusMessage ?? 'Pengumuman tidak ditemukan',
        fatal: true,
    })
}

function handleSuccess() {
    router.push('/_admins/announcements')
}

const fields = [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'content', label: 'Konten', type: 'editor', required: true },
    { name: 'thumbnail', label: 'Thumbnail', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'is_published', label: 'Terbitkan', type: 'switch', required: false },
]

const initialData = computed(() => {
    const a = announcementData.value?.data
    if (!a) return {}

    return {
        id: a.id,
        title: a.title,
        content: a.content,
        thumbnail: a.thumbnail?.path,
        is_published: Boolean(a.isPublished),
    }
})
</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Edit Pengumuman</h1>
        <AdminFormBase v-if="!announcementPending" ref="formRef" :initial-data="initialData" :fields="fields"
            :mutation="updateAnnouncement" submit-label="Update" success-message="Pengumuman berhasil diperbarui"
            error-message="Gagal memperbarui pengumuman" show-cancel cancel-label="Kembali" @success="handleSuccess"
            @cancel="router.back()" />
    </div>
</template>