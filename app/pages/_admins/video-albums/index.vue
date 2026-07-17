<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Album Video' })

const router = useRouter()
const tableRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'coverImage', label: 'Cover', width: '64px' },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'isActive', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '140px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteVideoAlbum,
    confirmHeader: 'Hapus Album Video',
    confirmMessage: 'Semua video dalam album ini akan ikut terhapus. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Album video berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus album video',
    onSuccess: handleRefresh,
})
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Album Video</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/video-albums" :columns="columns"
            search-placeholder="Cari album video...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="router.push('/_admins/video-albums/create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Album
                </button>
            </template>

            <template #cell-coverImage="{ value }">
                <img v-if="value" :src="value.path"
                    class="w-10 h-10 object-cover rounded border border-outline-variant" />
                <div v-else class="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                    <Icon name="lucide:video" size="16" class="text-on-surface-variant" />
                </div>
            </template>

            <template #cell-isActive="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md"
                    :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                    {{ value ? 'Aktif' : 'Nonaktif' }}
                </span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-3">
                    <button class="text-secondary hover:underline text-label-md"
                        @click="router.push(`/_admins/video-albums/${row.id}/edit`)">
                        <Icon name="lucide:pencil" size="18" />
                    </button>
                    <button class="text-error hover:underline text-label-md" :disabled="deleting"
                        @click="executeDelete(row.id)">
                        <Icon name="lucide:trash-2" size="18" />
                    </button>
                </div>
            </template>
        </AdminDataTable>
    </div>
</template>