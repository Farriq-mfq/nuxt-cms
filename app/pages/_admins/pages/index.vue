<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const tableRef = ref()
const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'is_published', label: 'Publish' },
    { key: 'action', label: 'Aksi', align: 'right' as const, width: '120px' },
]
</script>

<template>
    <AdminDataTable ref="tableRef" endpoint="/api/pages" :columns="columns" :search-placeholder="'Cari Halaman...'"
        default-sort-by="created_at" default-sort-order="desc" row-key="id">
        <template #toolbar>
            <button @click="$router.push('/_admins/pages/create')"
                class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3">
                <Icon name="lucide:plus" size="18" />
                Tambah Halaman
            </button>
        </template>
        <template #cell-is_published="{ row, refresh }">
            <UIBadge variant="success" v-if="row.is_published">
                <Icon name="lucide:check" size="14" />
                Published
            </UIBadge>
            <UIBadge variant="secondary" v-else>
                <Icon name="lucide:lock" size="14" />
                Draft
            </UIBadge>
        </template>
        <template #cell-action="{ row, refresh }">
            <button>
                Copy Link
            </button>
        </template>
    </AdminDataTable>
</template>