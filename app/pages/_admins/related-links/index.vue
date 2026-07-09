<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Related Links' })

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'icon', label: '', width: '48px', align: 'center' as const },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'url', label: 'URL' },
    { key: 'order', label: 'Urutan', align: 'center' as const },
    { key: 'isActive', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteRelatedLink,
    confirmHeader: 'Hapus Related Link',
    confirmMessage: 'Link ini akan dihapus permanen. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Related link berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus related link',
    onSuccess: handleRefresh,
})

const modes = {
    create: {
        title: 'Tambah Related Link',
        successMessage: 'Related link berhasil dibuat',
        errorMessage: 'Gagal membuat related link',
        submitLabel: 'Simpan',
        fields: [
            { name: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Nama link' },
            { name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://...' },
            { name: 'icon', label: 'Icon', type: 'icon', required: false },
            { name: 'order', label: 'Urutan', type: 'number', required: false },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: createRelatedLink,
    },
    edit: {
        title: 'Edit Related Link',
        successMessage: 'Related link berhasil diperbarui',
        errorMessage: 'Gagal memperbarui related link',
        submitLabel: 'Update',
        fields: [
            { name: 'title', label: 'Judul', type: 'text', required: true },
            { name: 'url', label: 'URL', type: 'text', required: true },
            { name: 'icon', label: 'Icon', type: 'icon', required: false },
            { name: 'order', label: 'Urutan', type: 'number', required: false },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: updateRelatedLink,
        transformForm: (formData: any) => ({
            id: formData.id,
            data: {
                title: formData.title,
                url: formData.url,
                icon: formData.icon || undefined,
                order: formData.order,
                isActive: formData.is_active,
            },
        }),
        transformData: (row: any) => ({
            id: row.id,
            title: row.title,
            url: row.url,
            icon: row.icon ?? '',
            order: row.order,
            is_active: Boolean(row.isActive),
        }),
    },
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Related Links</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/related-links" :columns="columns"
            search-placeholder="Cari link..." default-sort-by="order">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Link
                </button>
            </template>

            <template #cell-icon="{ value }">
                <Icon v-if="value" :name="value" size="20" class="mx-auto text-on-surface-variant" />
                <span v-else class="text-on-surface-variant">—</span>
            </template>

            <template #cell-url="{ value }">
                <a :href="value" target="_blank"
                    class="text-secondary hover:underline text-body-md truncate block max-w-xs">
                    {{ value }}
                </a>
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