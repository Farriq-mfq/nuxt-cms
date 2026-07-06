<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const toast = useToast()
const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'category', label: 'Kategori', align: 'center' as const },
    // { key: 'isPublished', label: 'Status', align: 'center' as const },
    // { key: 'publishedAt', label: 'Tanggal Terbit', sortable: true },
    // { key: 'actions', label: 'Aksi', align: 'right' as const, width: '120px' },
]

onMounted(() => {
    toast.success({ title: 'Success!', message: 'Your action was completed successfully.' })
})
</script>

<template>
    <AdminDataTable endpoint="/api/news" :columns="columns" default-sort-by="createdAt"
        search-placeholder="Cari berita...">
        <template #cell-isPublished="{ value }">
            <span class="px-2 py-0.5 rounded-full text-label-md"
                :class="value ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'">
                {{ value ? 'Terbit' : 'Draft' }}
            </span>
        </template>
        <template #cell-category="{ value }">
            {{ value.name ?? '-' }}
        </template>

        <!-- <template #cell-actions="{ row, refresh }">
            <div class="flex justify-end gap-2">
                <button class="text-secondary hover:underline text-label-md">Edit</button>
                <button class="text-error hover:underline text-label-md" @click="handleDelete(row.id, refresh)">
                    Hapus
                </button>
            </div>
        </template> -->
    </AdminDataTable>
</template>