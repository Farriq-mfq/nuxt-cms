<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Popup' })

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'image', label: 'Preview', width: '72px' },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'isActive', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deletePopup,
    confirmHeader: 'Hapus Popup',
    confirmMessage: 'Popup ini akan dihapus permanen. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Popup berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus popup',
    onSuccess: handleRefresh,
})

const modes = {
    create: {
        title: 'Tambah Popup',
        successMessage: 'Popup berhasil dibuat',
        errorMessage: 'Gagal membuat popup',
        submitLabel: 'Simpan',
        fields: [
            { name: 'title', label: 'Judul (internal)', type: 'text', required: true },
            { name: 'image', label: 'Gambar Popup', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: true },
            { name: 'linkUrl', label: 'Link Tujuan', type: 'text', required: false, placeholder: 'https://... (opsional)' },
            { name: 'startDate', label: 'Tampil Mulai', type: 'date', required: false },
            { name: 'endDate', label: 'Tampil Sampai', type: 'date', required: false },
            { name: 'is_active', label: 'Aktifkan', type: 'switch', required: false },
        ],
        mutation: createPopup,
    },
    edit: {
        title: 'Edit Popup',
        successMessage: 'Popup berhasil diperbarui',
        errorMessage: 'Gagal memperbarui popup',
        submitLabel: 'Update',
        fields: [
            { name: 'title', label: 'Judul (internal)', type: 'text', required: true },
            { name: 'image', label: 'Gambar Popup', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
            { name: 'linkUrl', label: 'Link Tujuan', type: 'text', required: false },
            { name: 'startDate', label: 'Tampil Mulai', type: 'date', required: false },
            { name: 'endDate', label: 'Tampil Sampai', type: 'date', required: false },
            { name: 'is_active', label: 'Aktifkan', type: 'switch', required: false },
        ],
        mutation: updatePopup,
        transformForm: (formData: any) => ({ id: formData.id, ...formData }),
        transformData: (row: any) => ({
            id: row.id,
            title: row.title,
            image: row.image?.path,
            linkUrl: row.linkUrl ?? '',
            startDate: row.startDate?.slice(0, 10) ?? '',
            endDate: row.endDate?.slice(0, 10) ?? '',
            is_active: Boolean(row.isActive),
        }),
    },
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Popup</h1>
        </div>

        <div
            class="bg-secondary-container/20 border border-secondary/30 rounded px-4 py-3 flex items-start gap-2 text-body-md text-on-surface">
            <Icon name="lucide:info" size="16" class="shrink-0 mt-0.5 text-secondary" />
            Hanya 1 popup yang bisa aktif ditampilkan ke pengunjung dalam satu waktu — kalau lebih dari satu diaktifkan,
            yang paling baru dibuat yang akan tampil.
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/popups" :columns="columns"
            search-placeholder="Cari popup...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Popup
                </button>
            </template>

            <template #cell-image="{ value }">
                <img v-if="value" :src="value.path"
                    class="w-12 h-12 object-cover rounded border border-outline-variant" />
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