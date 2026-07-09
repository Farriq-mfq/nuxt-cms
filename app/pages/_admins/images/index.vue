<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Media Library' })

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'preview', label: 'Preview', width: '80px' },
    { key: 'fileName', label: 'Nama File', sortable: true },
    { key: 'altText', label: 'Alt Text' },
    { key: 'size', label: 'Ukuran', align: 'center' as const },
    { key: 'createdAt', label: 'Diupload', sortable: true },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteImage,
    confirmHeader: 'Hapus Gambar',
    confirmMessage: 'Gambar yang dihapus tidak bisa dikembalikan. Pastikan gambar ini tidak dipakai di tempat lain.',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Gambar berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus gambar',
    onSuccess: handleRefresh,
})

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const modes = {
    create: {
        title: 'Upload Gambar',
        successMessage: 'Gambar berhasil diupload',
        errorMessage: 'Gagal mengupload gambar',
        submitLabel: 'Upload',
        fields: [
            {
                name: 'file', label: 'File Gambar', type: 'file',
                accept: 'image/png,image/jpeg,image/webp,image/gif', required: true,
            },
            { name: 'altText', label: 'Alt Text', type: 'text', required: false, placeholder: 'Deskripsi singkat gambar (opsional)' },
        ],
        mutation: uploadImage,
    },
    edit: {
        title: 'Edit Gambar',
        successMessage: 'Gambar berhasil diperbarui',
        errorMessage: 'Gagal memperbarui gambar',
        submitLabel: 'Update',
        fields: [
            { name: 'altText', label: 'Alt Text', type: 'text', required: false, placeholder: 'Deskripsi singkat gambar' },
        ],
        mutation: updateImage,
        transformForm: (formData: any) => ({
            id: formData.id,
            data: { altText: formData.altText || undefined },
        }),
        transformData: (row: any) => ({
            id: row.id,
            altText: row.altText ?? '',
        }),
    },
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Media Library</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/images" :columns="columns"
            search-placeholder="Cari gambar...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:upload" size="16" /> Upload Gambar
                </button>
            </template>

            <template #cell-preview="{ row }">
                <img :src="row.path" class="w-12 h-12 object-cover rounded border border-outline-variant" />
            </template>

            <template #cell-altText="{ value }">
                <span class="text-body-md">{{ value || '—' }}</span>
            </template>

            <template #cell-size="{ value }">
                <span class="text-body-md">{{ formatSize(value) }}</span>
            </template>

            <template #cell-createdAt="{ value }">
                <span class="text-body-md">{{ new Date(value).toLocaleDateString('id-ID') }}</span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-3">
                    <button class="text-secondary hover:underline text-label-md"
                        @click="formDialogRef.open('edit', row)">
                        <Icon name="lucide:pencil" size="18" />
                    </button>
                    <button class="text-error hover:underline text-label-md" :disabled="deleting"
                        @click="executeDelete(row.id)">
                        <Icon name="lucide:trash-2" size="18" />
                    </button>
                </div>
            </template>
        </AdminDataTable>

        <AdminFormDialog ref="formDialogRef" :modes="modes" @refresh="handleRefresh" />
    </div>
</template>