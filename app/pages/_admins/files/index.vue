<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'File Manager' })
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'icon', label: '', width: '48px' },
    { key: 'originalName', label: 'Nama File', sortable: true },
    { key: 'uploader', label: 'Diupload Oleh' },
    { key: 'size', label: 'Ukuran', align: 'center' as const },
    { key: 'createdAt', label: 'Diupload', sortable: true },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '100px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteFile,
    confirmHeader: 'Hapus File',
    confirmMessage: 'File yang dihapus tidak bisa dikembalikan. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'File berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus file',
    onSuccess: handleRefresh,
})

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function iconForMimeType(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'lucide:file-text'
    if (mimeType.includes('word')) return 'lucide:file-type-2'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'lucide:file-spreadsheet'
    return 'lucide:file'
}

const modes = {
    create: {
        title: 'Upload File',
        successMessage: 'File berhasil diupload',
        errorMessage: 'Gagal mengupload file',
        submitLabel: 'Upload',
        fields: [
            {
                name: 'file', label: 'Pilih File', type: 'file',
                accept: '.pdf,.doc,.docx', required: true,
            },
        ],
        mutation: uploadFile,
    },
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">File Manager</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/files" :columns="columns"
            search-placeholder="Cari file...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:upload" size="16" /> Upload File
                </button>
            </template>

            <template #cell-icon="{ row }">
                <Icon :name="iconForMimeType(row.mimeType)" size="24" class="text-on-surface-variant" />
            </template>

            <template #cell-uploader="{ value }">
                <span class="text-body-md">{{ value?.name ?? '—' }}</span>
            </template>

            <template #cell-size="{ value }">
                <span class="text-body-md">{{ formatSize(value) }}</span>
            </template>

            <template #cell-createdAt="{ value }">
                <span class="text-body-md">{{ format(new Date(value), 'dd MMMM yyyy', { locale: id }) }}</span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-3">
                    <a :href="row.path" target="_blank" class="text-secondary hover:underline text-label-md">
                        <Icon name="lucide:download" size="18" />
                    </a>
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