<script setup lang="ts">
interface Column {
    key: string
    label: string
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
    width?: string
}

const props = defineProps<{
    endpoint: string
    columns: Column[]
    searchPlaceholder?: string
}>()

const tableRef = ref()

const formDialogRef = inject<Ref<any>>('menuFormDialog')
const menuDelete = inject<{
    handleDelete: (id: any, refresh: () => void) => void
    isPending: Ref<boolean>
}>('menuDelete')
const registry = inject<{
    registerTable: (instance: { refresh: () => void }) => void
    unregisterTable: (instance: { refresh: () => void }) => void
}>('menuTableRegistry')

const selfInstance = { refresh: () => tableRef.value?.refresh() }

onMounted(() => registry?.registerTable(selfInstance))
onBeforeUnmount(() => registry?.unregisterTable(selfInstance))

defineExpose({ refresh: selfInstance.refresh })
</script>

<template>
    <AdminDataTable ref="tableRef" :endpoint="endpoint" :columns="columns"
        :search-placeholder="searchPlaceholder ?? 'Cari...'" default-sort-by="order" default-sort-order="asc" expandable
        row-key="id">
        <template #cell-icon="{ value }">
            <Icon v-if="value" :name="value" size="20" />
        </template>

        <template #cell-action="{ row, refresh }">
            <div class="flex justify-end gap-2">
                <button class="text-secondary hover:underline text-label-md" @click="formDialogRef?.open('edit', row)">
                    <Icon name="lucide:edit" size="18" />
                </button>
                <button class="text-error hover:underline text-label-md disabled:text-error-container"
                    :disabled="menuDelete?.isPending.value" @click="menuDelete?.handleDelete(row.id, refresh)">
                    <Icon v-if="menuDelete?.isPending.value" name="lucide:loader" class="animate-spin" size="18" />
                    <Icon v-else name="lucide:trash-2" size="18" />
                </button>
            </div>
        </template>

        <template #expander="{ row }">
            <AdminMenuTable :endpoint="`/api/menus/${row.id}`" :columns="columns"
                search-placeholder="Cari Submenu..." />
        </template>
    </AdminDataTable>
</template>