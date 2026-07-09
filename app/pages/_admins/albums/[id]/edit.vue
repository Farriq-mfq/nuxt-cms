<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Album' })

const router = useRouter()
const route = useRoute()
const formRef = ref()
const toast = useToast()
const confirm = useConfirm()

if (!route.params.id) {
    throw createError({ statusCode: 404, statusMessage: 'Album tidak ditemukan', fatal: true })
}

const albumId = Number(route.params.id)

const { data: albumData, pending: albumPending, error: albumError, refresh: refreshAlbum } = await useFetch(`/api/_admins/albums/${albumId}`)

if (albumError.value) {
    throw createError({
        statusCode: albumError.value.statusCode ?? 404,
        statusMessage: albumError.value.statusMessage ?? 'Album tidak ditemukan',
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

// --- Gallery Manager ---
const galleryFileInput = ref<HTMLInputElement | null>(null)
const isUploadingGallery = ref(false)

function triggerGalleryUpload() {
    galleryFileInput.value?.click()
}

async function handleGalleryFilesSelected(event: Event) {
    const fileList = (event.target as HTMLInputElement).files
    if (!fileList || fileList.length === 0) return

    isUploadingGallery.value = true

    try {
        await uploadGalleryImages(albumId, Array.from(fileList))
        toast.success({ title: 'Berhasil', message: `${fileList.length} gambar ditambahkan ke album` })
        await refreshAlbum()
    } catch (err: any) {
        toast.error({ title: 'Gagal', message: err?.data?.data?.message ?? 'Gagal mengupload gambar' })
    } finally {
        isUploadingGallery.value = false
        if (galleryFileInput.value) galleryFileInput.value.value = ''
    }
}

async function handleDeleteGalleryItem(galleryId: number) {
    const isConfirmed = await confirm.open({
        title: 'Hapus Gambar',
        message: 'Gambar ini akan dihapus permanen dari album.',
        confirmLabel: 'Ya, Hapus',
        danger: true,
    })

    if (!isConfirmed) return

    try {
        await deleteGalleryItem(galleryId)
        toast.success({ title: 'Berhasil', message: 'Gambar berhasil dihapus' })
        await refreshAlbum()
    } catch (err: any) {
        toast.error({ title: 'Gagal', message: 'Gagal menghapus gambar' })
    }
}

const editingCaptionId = ref<number | null>(null)
const captionDraft = ref('')

function startEditCaption(item: any) {
    editingCaptionId.value = item.id
    captionDraft.value = item.caption ?? ''
}

async function saveCaption(item: any) {
    try {
        await updateGalleryItem({ id: item.id, caption: captionDraft.value })
        editingCaptionId.value = null
        await refreshAlbum()
    } catch {
        toast.error({ title: 'Gagal', message: 'Gagal menyimpan caption' })
    }
}
</script>

<template>
    <div class="space-y-md">
        <div class="p-5 border border-outline-variant shadow-layer-1 rounded bg-white">
            <h1 class="text-headline-lg mb-md">Edit Album</h1>
            <AdminFormBase v-if="!albumPending" ref="formRef" :initial-data="initialData" :fields="fields"
                :mutation="updateAlbum" submit-label="Update" success-message="Album berhasil diperbarui"
                error-message="Gagal memperbarui album" show-cancel cancel-label="Kembali ke Daftar"
                @success="handleFormSuccess" @cancel="router.push('/_admins/albums')" />
        </div>

        <div class="p-5 border border-outline-variant shadow-layer-1 rounded bg-white">
            <div class="flex items-center justify-between mb-md">
                <h2 class="text-headline-md">Galeri Foto</h2>
                <button
                    class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-4 py-2 text-body-md disabled:opacity-50"
                    :disabled="isUploadingGallery" @click="triggerGalleryUpload">
                    <Icon :name="isUploadingGallery ? 'lucide:loader-2' : 'lucide:upload'" size="16"
                        :class="isUploadingGallery && 'animate-spin'" />
                    Tambah Foto
                </button>
                <input ref="galleryFileInput" type="file" accept="image/png,image/jpeg,image/webp" multiple
                    class="hidden" @change="handleGalleryFilesSelected" />
            </div>

            <div v-if="!albumData?.data?.galleries?.length" class="text-center py-lg text-on-surface-variant">
                <Icon name="lucide:image-off" size="32" class="mx-auto mb-2 opacity-50" />
                <p class="text-body-md">Belum ada foto di album ini</p>
            </div>

            <div v-else class="flex flex-wrap gap-2">
                <div v-for="item in albumData.data.galleries" :key="item.id"
                    class="relative group border border-outline-variant rounded overflow-hidden shrink-0">
                    <img :src="item.image.path" class="w-full h-32 object-cover" />

                    <div
                        class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100">
                        <button class="bg-error text-on-error rounded-full p-1.5"
                            @click="handleDeleteGalleryItem(item.id)">
                            <Icon name="lucide:trash-2" size="14" />
                        </button>
                    </div>

                    <div class="p-2 bg-surface-container-lowest">
                        <input v-if="editingCaptionId === item.id" v-model="captionDraft"
                            class="w-full text-label-md border border-outline-variant rounded px-1.5 py-1"
                            placeholder="Caption..." @keyup.enter="saveCaption(item)" @blur="saveCaption(item)"
                            autofocus />
                        <p v-else class="text-label-md text-on-surface-variant truncate cursor-pointer"
                            @click="startEditCaption(item)">
                            {{ item.caption || 'Tambah caption...' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>