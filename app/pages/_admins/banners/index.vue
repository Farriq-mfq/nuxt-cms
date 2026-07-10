<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Banner' })

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'image', label: 'Preview', width: '96px' },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'order', label: 'Urutan', align: 'center' as const },
    { key: 'isActive', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteBanner,
    confirmHeader: 'Hapus Banner',
    confirmMessage: 'Banner ini akan dihapus permanen. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Banner berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus banner',
    onSuccess: handleRefresh,
})

const modes = {
    create: {
        title: 'Tambah Banner',
        successMessage: 'Banner berhasil dibuat',
        errorMessage: 'Gagal membuat banner',
        submitLabel: 'Simpan',
        fields: [
            { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Judul banner (internal, tidak tampil publik)' },
            { name: 'description', label: 'Deskripsi', type: 'textarea', required: false, placeholder: 'Deskripsi singkat (opsional)' },

            { name: 'image', label: 'Gambar Banner', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: true },
            { name: 'linkUrl', label: 'Link Tujuan', type: 'text', required: false, placeholder: 'https://... (opsional)' },
            { name: 'order', label: 'Urutan', type: 'number', required: false },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: createBanner,
    },
    edit: {
        title: 'Edit Banner',
        successMessage: 'Banner berhasil diperbarui',
        errorMessage: 'Gagal memperbarui banner',
        submitLabel: 'Update',
        fields: [
            { name: 'title', label: 'Judul', type: 'text', required: true },
            { name: 'description', label: 'Deskripsi', type: 'textarea', required: false },
            { name: 'image', label: 'Gambar Banner', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
            { name: 'linkUrl', label: 'Link Tujuan', type: 'text', required: false },
            { name: 'order', label: 'Urutan', type: 'number', required: false },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: updateBanner,
        transformForm: (formData: any) => ({
            id: formData.id,
            title: formData.title,
            description: formData.description,
            image: formData.image,
            linkUrl: formData.linkUrl,
            order: formData.order,
            is_active: formData.is_active,
        }),
        transformData: (row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description ?? '',
            image: row.image?.path,
            linkUrl: row.linkUrl ?? '',
            order: row.order,
            is_active: Boolean(row.isActive),
        }),
    },
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Banner</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/banners" :columns="columns"
            search-placeholder="Cari banner..." default-sort-by="order">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Banner
                </button>
            </template>

            <template #cell-image="{ value }">
                <img :src="value?.path" class="w-20 h-10 object-cover rounded border border-outline-variant" />
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