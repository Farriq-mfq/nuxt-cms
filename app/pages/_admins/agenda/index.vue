<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Agenda' })

import {
    format
} from 'date-fns'

import { id } from 'date-fns/locale'

const tableRef = ref()
const formDialogRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'thumbnail', label: '', width: '64px' },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'location', label: 'Lokasi' },
    { key: 'startDate', label: 'Tanggal', sortable: true },
    { key: 'endDate', label: 'Sampai', sortable: true },
    { key: 'isPublished', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteAgenda,
    confirmHeader: 'Hapus Agenda',
    confirmMessage: 'Agenda ini akan dihapus permanen. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Agenda berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus agenda',
    onSuccess: handleRefresh,
})

const modes = {
    create: {
        title: 'Tambah Agenda',
        successMessage: 'Agenda berhasil dibuat',
        errorMessage: 'Gagal membuat agenda',
        submitLabel: 'Simpan',
        fields: [
            { name: 'title', label: 'Judul Kegiatan', type: 'text', required: true },
            { name: 'description', label: 'Deskripsi', type: 'textarea', required: false },
            { name: 'location', label: 'Lokasi', type: 'text', required: false },
            { name: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true },
            { name: 'endDate', label: 'Tanggal Selesai', type: 'date', required: false },
            { name: 'thumbnail', label: 'Gambar', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
            { name: 'is_published', label: 'Tampilkan', type: 'switch', required: false },
        ],
        mutation: createAgenda,
    },
    edit: {
        title: 'Edit Agenda',
        successMessage: 'Agenda berhasil diperbarui',
        errorMessage: 'Gagal memperbarui agenda',
        submitLabel: 'Update',
        fields: [
            { name: 'title', label: 'Judul Kegiatan', type: 'text', required: true },
            { name: 'description', label: 'Deskripsi', type: 'textarea', required: false },
            { name: 'location', label: 'Lokasi', type: 'text', required: false },
            { name: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true },
            { name: 'endDate', label: 'Tanggal Selesai', type: 'date', required: false },
            { name: 'thumbnail', label: 'Gambar', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
            { name: 'is_published', label: 'Tampilkan', type: 'switch', required: false },
        ],
        mutation: updateAgenda,
        transformForm: (formData: any) => ({ id: formData.id, ...formData }),
        transformData: (row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description ?? '',
            location: row.location ?? '',
            startDate: row.startDate?.slice(0, 10),
            endDate: row.endDate?.slice(0, 10) ?? '',
            thumbnail: row.thumbnail?.path,
            is_published: Boolean(row.isPublished),
        }),
    },
}

function formatDate(date: string): string {
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Agenda</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/agenda" :columns="columns"
            search-placeholder="Cari agenda...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="formDialogRef.open('create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Agenda
                </button>
            </template>

            <template #cell-thumbnail="{ value }">
                <img v-if="value" :src="value.path"
                    class="w-10 h-10 object-cover rounded border border-outline-variant" />
                <div v-else class="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                    <Icon name="lucide:calendar" size="14" class="text-on-surface-variant" />
                </div>
            </template>

            <template #cell-startDate="{ value }">{{ formatDate(value) }}</template>
            <template #cell-endDate="{ value }">{{ value ? formatDate(value) : '-' }}</template>

            <template #cell-isPublished="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md"
                    :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                    {{ value ? 'Tampil' : 'Tersembunyi' }}
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