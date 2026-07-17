<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Post' })
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const router = useRouter()
const tableRef = ref()

function handleRefresh() {
    tableRef.value?.refresh()
}

const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'category', label: 'Kategori', align: 'center' as const },
    { key: 'isPublished', label: 'Status', align: 'center' as const },
    { key: 'publishedAt', label: 'Tanggal Terbit', sortable: true },
    { key: 'actions', label: 'Aksi', align: 'right' as const, width: '140px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deletePost,
    confirmHeader: 'Hapus Post',
    confirmMessage: 'Post yang dihapus tidak bisa dikembalikan. Lanjutkan?',
    confirmLabel: 'Ya, Hapus',
    danger: true,
    successMessage: 'Post berhasil dihapus',
    errorMessage: 'Terjadi kesalahan saat menghapus post',
    onSuccess: handleRefresh,
})
</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Post</h1>
        </div>

        <AdminDataTable ref="tableRef" endpoint="/api/_admins/posts" :columns="columns"
            search-placeholder="Cari post...">
            <template #toolbar>
                <button class="flex items-center gap-1.5 bg-secondary text-on-secondary rounded px-6 py-3"
                    @click="router.push('/_admins/posts/create')">
                    <Icon name="lucide:plus" size="16" /> Tambah Post
                </button>
            </template>

            <template #cell-category="{ value }">
                <span v-if="value" class="text-body-md">{{ value.name }}</span>
                <span v-else class="text-on-surface-variant text-label-md">—</span>
            </template>

            <template #cell-isPublished="{ value }">
                <span class="px-2 py-0.5 rounded-full text-label-md"
                    :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                    {{ value ? 'Terbit' : 'Draft' }}
                </span>
            </template>

            <template #cell-publishedAt="{ value }">
                <span class="text-body-md">{{ value ? format(new Date(value), 'dd MMMM yyyy', { locale: id }) : '—'
                }}</span>
            </template>

            <template #cell-actions="{ row }">
                <div class="flex justify-end gap-3">
                    <button class="text-secondary hover:underline text-label-md"
                        @click="router.push(`/_admins/posts/${row.id}/edit`)">
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