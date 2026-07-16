<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengumuman' })

import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const router = useRouter()
const tableRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'thumbnail', label: 'Thumbnail', width: '72px' },
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'isPublished', label: 'Status', align: 'center' as const },
    { key: 'publishedAt', label: 'Tanggal Terbit', sortable: true },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '140px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deleteAnnouncement,
    confirmHeader: 'Hapus Pengumuman',
    confirmMessage: 'Pengumuman yang dihapus tidak bisa dikembalikan. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Pengumuman berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus pengumuman',
    onSuccess: handleRefresh,
})

function formatDate(date: string | null): string {
    if (!date) return '—'
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Pengumuman</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/announcements" :columns="columns"
            search-placeholder="Cari pengumuman...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="router.push('/_admins/announcements/create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Pengumuman
                </button>
            </template>

            <template #cell-thumbnail="{ value }">
                <img v-if="value" :src="value.path"
                    class="w-12 h-12 object-cover rounded border border-outline-variant" />
                <div v-else class="w-12 h-12 rounded bg-surface-container flex items-center justify-center">
                    <Icon name="lucide:image" size="16" class="text-on-surface-variant" />
                </div>
            </template>

            <template #cell-isPublished="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md"
                    :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                    {{ value ? 'Terbit' : 'Draft' }}
                </span>
            </template>

            <template #cell-publishedAt="{ value }">
                {{ formatDate(value) }}
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-3">
                    <button class="text-secondary hover:underline text-label-md"
                        @click="router.push(`/_admins/announcements/${row.id}/edit`)">
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