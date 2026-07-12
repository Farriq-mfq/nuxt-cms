<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Admin' })

const { can } = useAuth()

if (!can('setting')) {
    throw createError({ statusCode: 403, statusMessage: 'Kamu tidak memiliki akses ke halaman ini', fatal: true })
}

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'name', label: 'Nama', sortable: true },
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role', align: 'center' as const },
    { key: 'isActive', label: 'Status', align: 'center' as const },
    { key: 'lastLoginAt', label: 'Login Terakhir' },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteAdmin,
    confirmHeader: 'Hapus Admin',
    confirmMessage: 'Admin ini akan dihapus permanen dan tidak bisa login lagi. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Admin berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus admin',
    onSuccess: handleRefresh,
})

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
]

const modes = {
    create: {
        title: 'Tambah Admin',
        successMessage: 'Admin berhasil dibuat',
        errorMessage: 'Gagal membuat admin',
        submitLabel: 'Simpan',
        fields: [
            { name: 'name', label: 'Nama Lengkap', type: 'text', required: true },
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Minimal 8 karakter' },
            { name: 'role', label: 'Role', type: 'select', options: roleOptions, required: true },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: createAdmin,
    },
    edit: {
        title: 'Edit Admin',
        successMessage: 'Admin berhasil diperbarui',
        errorMessage: 'Gagal memperbarui admin',
        submitLabel: 'Update',
        fields: [
            { name: 'name', label: 'Nama Lengkap', type: 'text', required: true },
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password', label: 'Password Baru', type: 'password', required: false, placeholder: 'Kosongkan jika tidak diubah' },
            { name: 'role', label: 'Role', type: 'select', options: roleOptions, required: true },
            { name: 'is_active', label: 'Aktif', type: 'switch', required: false },
        ],
        mutation: updateAdmin,
        transformForm: (formData: any) => ({
            id: formData.id,
            data: {
                name: formData.name,
                username: formData.username,
                password: formData.password || undefined,
                role: formData.role,
                isActive: formData.is_active,
            },
        }),
        transformData: (row: any) => ({
            id: row.id,
            name: row.name,
            username: row.username,
            password: '',
            role: row.role,
            is_active: Boolean(row.isActive),
        }),
    },
}

</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Admin</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/admins" :columns="columns"
            search-placeholder="Cari admin...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Admin
                </button>
            </template>

            <template #cell-role="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md capitalize"
                    :class="value === 'superadmin' ? 'bg-primary-container/30 text-primary' : 'bg-surface-container text-on-surface-variant'">
                    {{ value }}
                </span>
            </template>

            <template #cell-isActive="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md"
                    :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                    {{ value ? 'Aktif' : 'Nonaktif' }}
                </span>
            </template>

            <template #cell-lastLoginAt="{ value }">
                <span class="text-body-md text-on-surface-variant">{{ format(value, 'dd MMMM yyyy, HH:mm', {
                    locale: id
                }) }}</span>
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