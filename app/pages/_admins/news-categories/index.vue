<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
useHead({ title: 'Kategori Berita' })

const tableRef = ref()
const formDialogRef = ref()

const columns = [
    { key: 'name', label: 'Nama', sortable: true },
    { key: 'action', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const modes = {
    create: {
        title: 'Tambah Kategori',
        successMessage: 'Kategori berhasil dibuat',
        errorMessage: 'Terjadi kesalahan saat membuat kategori',
        submitLabel: 'Simpan',
        fields: [
            { name: 'name', label: 'Nama', type: 'text', required: true },
        ],
        mutation: createNewsCategories
    },
    edit: {
        title: 'Edit Kategori',
        successMessage: 'Kategori berhasil diubah',
        errorMessage: 'Terjadi kesalahan saat mengubah kategori',
        submitLabel: 'Update',
        fields: [
            { name: 'name', label: 'Nama', type: 'text', required: true },
        ],
        mutation: updateNewsCategories,
        transformForm: (data) => {
            return {
                id: data.id,
                data: {
                    name: data.name
                }
            }
        }
    }
}


const {
    execute: executeDelete,
    isPending
} = useConfirmMutation({
    confirmFn: deleteNewsCategories,
    confirmHeader: "Hapus Kategori Berita",
    confirmMessage: "Kategori yang dihapus tidak bisa dikembalikan. Lanjutkan?",
    confirmLabel: "Ya, Hapus",
    danger: true,
    successMessage: "Kategori berhasil dihapus",
    errorMessage: "Terjadi kesalahan saat menghapus kategori",
    onSuccess: () => {
        tableRef.value?.refresh()
    }
})

</script>

<template>
    <AdminDataTable ref="tableRef" endpoint="/api/news-categories" :columns="columns"
        :search-placeholder="'Cari Kategori Berita...'" row-key="id">
        <template #toolbar>
            <button @click="formDialogRef.open('create')" type="button"
                class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3">
                <Icon name="lucide:plus" size="18" />
                Tambah Kategori
            </button>
        </template>
        <template #cell-action="{ row, refresh }">
            <div class="flex items-center justify-end gap-2">
                <button class="text-secondary hover:underline text-label-md" @click="formDialogRef?.open('edit', row)">
                    <Icon name="lucide:edit" size="18" />
                </button>
                <button :disabled="isPending" class="text-error hover:underline text-label-md"
                    @click="executeDelete(row.id, refresh)">
                    <Icon name="lucide:trash-2" size="18" />
                </button>
            </div>
        </template>

    </AdminDataTable>
    <AdminFormDialog ref="formDialogRef" title="Form Kategori" :modes="modes" @refresh="tableRef?.refresh()" />
</template>