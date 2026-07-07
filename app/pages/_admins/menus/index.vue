<script setup lang="ts">
useHead({ title: 'Menu' })

definePageMeta({
    layout: 'admin',
})

const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'icon', label: 'Icon', align: 'center' as const },
    { key: 'target', label: 'Target' },
    { key: 'url', label: 'URL' },
    { key: 'order', label: 'Urutan', sortable: true },
    { key: 'action', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const formDialogRef = ref()

const tableInstances = new Set<{ refresh: () => void }>()

function registerTable(instance: { refresh: () => void }) {
    tableInstances.add(instance)
}

function unregisterTable(instance: { refresh: () => void }) {
    tableInstances.delete(instance)
}

function refreshAll() {
    tableInstances.forEach((instance) => instance.refresh())
}

const modes = {
    create: {
        title: "Tambah Menu",
        successMessage: "Menu berhasil dibuat",
        errorMessage: "Terjadi kesalahan saat membuat menu",
        submitLabel: "Simpan",
        fields: [
            { name: 'icon', label: 'Icon (opsional)', type: 'icon', required: false },
            {
                name: 'parentId',
                label: 'Menu Induk (opsional)',
                type: 'combobox',
                apiUrl: '/api/select/menus',
                searchableColumns: ['title'],
                multi: false,
                required: false,
                labelKey: 'title',
                valueKey: 'id',
                placeholder: 'Pilih menu induk',
            },
            { name: 'title', label: 'Judul', type: 'text', required: true },
            { name: 'order', label: 'Urutan', type: 'number', required: true },
            {
                name: 'target',
                label: 'Target',
                type: 'select',
                options: [
                    { value: '_self', label: '_self' },
                    { value: '_blank', label: '_blank' },
                ],
                required: true,
            },
            { name: 'url', label: 'URL (opsional)', type: 'text', required: false },
        ],
        mutation: createMenu,
        transformForm: (data: any) => ({
            parentId: data.parentId?.id ?? undefined,
            title: data.title,
            order: data.order,
            target: data.target,
            url: data.url || undefined,
            icon: data.icon || undefined,
        }),
    },
    edit: {
        title: "Edit Menu",
        successMessage: "Menu berhasil diubah",
        errorMessage: "Terjadi kesalahan saat mengubah menu",
        submitLabel: "Update",
        fields: [
            { name: 'icon', label: 'Icon (opsional)', type: 'icon', required: false },
            {
                name: 'parentId',
                label: 'Menu Induk (opsional)',
                type: 'combobox',
                apiUrl: '/api/select/menus',
                searchableColumns: ['title'],
                multi: false,
                required: false,
                labelKey: 'title',
                valueKey: 'id',
                placeholder: 'Pilih menu induk',
            },
            { name: 'title', label: 'Judul', type: 'text', required: true },
            { name: 'order', label: 'Urutan', type: 'number', required: true },
            {
                name: 'target',
                label: 'Target',
                type: 'select',
                options: [
                    { value: '_self', label: '_self' },
                    { value: '_blank', label: '_blank' },
                ],
                required: true,
            },
            { name: 'url', label: 'URL (opsional)', type: 'text', required: false },
        ],
        mutation: updateMenu,
        transformData: (row: any) => ({
            id: row.id,
            parentId: row.parent ? { id: row.parent.id, title: row.parent.title } : null,
            title: row.title,
            order: row.order,
            target: row.target,
            url: row.url ?? '',
            icon: row.icon ?? '',
        }),
        transformForm: (data: any) => ({
            id: data.id,
            data: {
                parentId: data.parentId?.id ?? null,
                title: data.title,
                order: data.order,
                target: data.target,
                url: data.url || undefined,
                icon: data.icon || undefined,
            },
        }),
    },
}

const { execute: handleDelete, isPending } = useConfirmMutation({
    confirmFn: deleteMenu,
    confirmHeader: "Hapus Menu",
    confirmMessage: "Apakah anda yakin ingin menghapus menu ini?",
    successMessage: "Menu berhasil dihapus",
    errorMessage: "Terjadi kesalahan saat menghapus menu",
    onSuccess: () => {
        refreshAll()
    }
})

provide('menuFormDialog', formDialogRef)
provide('menuDelete', { handleDelete, isPending })
provide('menuTableRegistry', { registerTable, unregisterTable })
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg text-on-surface">Manajemen Menu</h1>
            <button @click="formDialogRef.open('create')"
                class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3">
                <Icon name="lucide:plus" size="18" />
                Tambah Menu
            </button>
        </div>

        <AdminMenuTable endpoint="/api/menus" :columns="columns" search-placeholder="Cari Menu..." />

        <AdminFormDialog ref="formDialogRef" title="Form Menu" :modes="modes" @refresh="refreshAll" />
    </div>
</template>