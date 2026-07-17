<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Album Video' })

const router = useRouter()
const route = useRoute()
const formRef = ref()
const toast = useToast()
const confirm = useConfirm()

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Album video tidak ditemukan', fatal: true })
}

const albumId = Number(route.params.id)

const { data: albumData, pending: albumPending, error: albumError, refresh: refreshAlbum } = await useFetch(`/api/_admins/video-albums/${albumId}`)

if (albumError.value) {
    throw createError({
        statusCode: albumError.value.statusCode ?? 404,
        statusMessage: albumError.value.statusMessage ?? 'Album video tidak ditemukan',
        fatal: true,
    })
}

const fields = [
    { name: 'title', label: 'Judul Album', type: 'text', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea', required: false },
    { name: 'cover', label: 'Cover', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
]

const initialData = computed(() => {
    const a = albumData.value?.data
    if (!a) return {}
    return {
        id: a.id,
        title: a.title,
        description: a.description ?? '',
        cover: a.coverImage?.path,
        is_active: Boolean(a.isActive),
    }
})

function handleFormSuccess() {
    toast.success({ title: 'Berhasil', message: 'Detail album berhasil diperbarui' })
    refreshAlbum()
}

// --- Video Manager ---
const newVideoTitle = ref('')
const newVideoUrl = ref('')
const isAddingVideo = ref(false)

async function handleAddVideo() {
    if (!newVideoTitle.value.trim() || !newVideoUrl.value.trim()) {
        toast.error({ title: 'Gagal', message: 'Judul dan URL video wajib diisi' })
        return
    }

    isAddingVideo.value = true

    try {
        await addVideo(albumId, { title: newVideoTitle.value, url: newVideoUrl.value })
        toast.success({ title: 'Berhasil', message: 'Video berhasil ditambahkan' })
        newVideoTitle.value = ''
        newVideoUrl.value = ''
        await refreshAlbum()
    } catch (err: any) {
        toast.error({ title: 'Gagal', message: err?.data?.data?.errors?.[0]?.message ?? 'Gagal menambahkan video' })
    } finally {
        isAddingVideo.value = false
    }
}

async function handleDeleteVideo(videoId: number) {
    const isConfirmed = await confirm.open({
        title: 'Hapus Video',
        message: 'Video ini akan dihapus dari album.',
        confirmLabel: 'Ya, Hapus',
        danger: true,
    })

    if (!isConfirmed) return

    try {
        await deleteVideo(videoId)
        toast.success({ title: 'Berhasil', message: 'Video berhasil dihapus' })
        await refreshAlbum()
    } catch {
        toast.error({ title: 'Gagal', message: 'Gagal menghapus video' })
    }
}

function youtubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}
</script>

<template>
    <div class="space-y-md">
        <div class="p-5 border border-outline-variant shadow-layer-1 rounded bg-white">
            <h1 class="text-headline-lg mb-md">Edit Album Video</h1>
            <AdminFormBase v-if="!albumPending" ref="formRef" :initial-data="initialData" :fields="fields"
                :mutation="updateVideoAlbum" submit-label="Update" success-message="Album video berhasil diperbarui"
                error-message="Gagal memperbarui album video" show-cancel cancel-label="Kembali ke Daftar"
                @success="handleFormSuccess" @cancel="router.push('/_admins/video-albums')" />
        </div>

        <div class="p-5 border border-outline-variant shadow-layer-1 rounded bg-white">
            <h2 class="text-headline-md mb-md">Video</h2>

            <!-- Form tambah video -->
            <div class="flex flex-col sm:flex-row gap-2 mb-lg">
                <input v-model="newVideoTitle" type="text" placeholder="Judul video"
                    class="flex-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-body-md focus:border-secondary outline-none" />
                <input v-model="newVideoUrl" type="text"
                    placeholder="URL YouTube (mis. https://youtube.com/watch?v=...)"
                    class="flex-[2] bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-body-md focus:border-secondary outline-none" />
                <button
                    class="flex items-center justify-center gap-1.5 bg-secondary text-on-secondary rounded px-4 py-2 text-body-md disabled:opacity-50 shrink-0"
                    :disabled="isAddingVideo" @click="handleAddVideo">
                    <Icon :name="isAddingVideo ? 'lucide:loader-2' : 'lucide:plus'" size="16"
                        :class="isAddingVideo && 'animate-spin'" />
                    Tambah
                </button>
            </div>

            <div v-if="!albumData?.data?.videos?.length" class="text-center py-lg text-on-surface-variant">
                <Icon name="lucide:video-off" size="32" class="mx-auto mb-2 opacity-50" />
                <p class="text-body-md">Belum ada video di album ini</p>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div v-for="video in albumData.data.videos" :key="video.id"
                    class="relative group border border-outline-variant rounded overflow-hidden">
                    <div class="relative aspect-video">
                        <img :src="youtubeThumbnail(video.videoId)" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Icon name="lucide:play-circle" size="32" class="text-white" />
                        </div>
                    </div>

                    <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="bg-error text-on-error rounded-full p-1.5" @click="handleDeleteVideo(video.id)">
                            <Icon name="lucide:trash-2" size="14" />
                        </button>
                    </div>

                    <div class="p-2 bg-surface-container-lowest">
                        <p class="text-label-md text-on-surface truncate">{{ video.title }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>