<script setup lang="ts">
interface Column {
    key: string
    label: string
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
    width?: string
}

interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

interface ApiResponse {
    success: boolean
    message: string
    data: Record<string, any>[]
    meta?: PaginationMeta
}

const props = withDefaults(defineProps<{
    endpoint: string
    columns: Column[]
    limit?: number
    defaultSortBy?: string
    defaultSortOrder?: 'asc' | 'desc'
    searchable?: boolean
    searchPlaceholder?: string
    emptyMessage?: string
    extraQuery?: Record<string, any>
    expandable?: boolean
    rowKey?: string
}>(), {
    limit: 10,
    defaultSortOrder: 'desc',
    searchable: true,
    searchPlaceholder: 'Cari data...',
    emptyMessage: 'Tidak ada data untuk ditampilkan',
    expandable: false,
    rowKey: 'id',
})

const page = ref(1)
const search = ref('')
const sortBy = ref(props.defaultSortBy ?? '')
const sortOrder = ref<'asc' | 'desc'>(props.defaultSortOrder)

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedSearch = ref('')

watch(search, (val) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        page.value = 1
        debouncedSearch.value = val
    }, 400)
})

const queryParams = computed(() => ({
    page: page.value,
    limit: props.limit,
    search: debouncedSearch.value || undefined,
    sortBy: sortBy.value || undefined,
    sortOrder: sortOrder.value,
    ...props.extraQuery,
}))

const { data, pending, error, refresh } = useFetch<ApiResponse>(
    () => props.endpoint,
    { query: queryParams, watch: [queryParams] }
)

const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

function handleSort(column: Column) {
    if (!column.sortable) return
    sortOrder.value = sortBy.value === column.key && sortOrder.value === 'asc' ? 'desc' : 'asc'
    sortBy.value = column.key
}

function sortIcon(column: Column) {
    if (sortBy.value !== column.key) return 'lucide:chevrons-up-down'
    return sortOrder.value === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'
}

function goToPage(newPage: number) {
    if (newPage < 1 || (meta.value && newPage > meta.value.totalPages)) return
    page.value = newPage
}

const paginationRange = computed(() => {
    if (!meta.value) return []
    const { page: currentPage, totalPages } = meta.value
    const delta = 1
    const range: (number | '...')[] = []

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i)
        } else if (range[range.length - 1] !== '...') {
            range.push('...')
        }
    }

    return range
})

const expandedRows = ref<Set<any>>(new Set())

function rowIdentifier(row: Record<string, any>, index: number) {
    return row[props.rowKey] ?? index
}

function toggleExpand(row: Record<string, any>, index: number) {
    const key = rowIdentifier(row, index)
    if (expandedRows.value.has(key)) {
        expandedRows.value.delete(key)
    } else {
        expandedRows.value.add(key)
    }
    expandedRows.value = new Set(expandedRows.value)
}

function isExpanded(row: Record<string, any>, index: number) {
    return expandedRows.value.has(rowIdentifier(row, index))
}

const colCount = computed(() => props.columns.length + (props.expandable ? 1 : 0))

watch(rows, () => {
    expandedRows.value = new Set()
})

defineExpose({ refresh })
</script>

<template>
    <div class="space-y-sm">
        <div v-if="searchable || $slots.toolbar"
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm">
            <div v-if="searchable" class="relative w-full sm:w-72">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    size="18" />
                <input v-model="search" :placeholder="searchPlaceholder"
                    class="w-full bg-surface-container-low border border-outline-variant rounded pl-9 pr-4 py-2 text-body-md focus:border-secondary outline-none" />
            </div>
            <div class="flex items-center gap-2">
                <slot name="toolbar" />
            </div>
        </div>

        <div v-if="error"
            class="flex items-center gap-2 bg-error-container text-on-error-container rounded px-md py-sm text-body-md">
            <Icon name="lucide:alert-circle" size="18" class="shrink-0" />
            <span>Gagal memuat data: {{ error.data?.data?.message ?? error.message }}</span>
            <button class="flex items-center gap-1 underline ml-auto" @click="refresh()">
                <Icon name="lucide:refresh-cw" size="14" />
                Coba lagi
            </button>
        </div>

        <div class="bg-surface border border-outline-variant rounded shadow-layer-1 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                            <th v-if="expandable" class="w-10 px-md py-sm"></th>
                            <th v-for="column in columns" :key="column.key"
                                :style="column.width ? { width: column.width } : {}"
                                class="px-md py-sm text-label-md uppercase tracking-wide text-on-surface-variant select-none"
                                :class="[
                                    column.align === 'center' && 'text-center',
                                    column.align === 'right' && 'text-right',
                                    column.sortable && 'cursor-pointer hover:text-secondary transition-colors',
                                ]" @click="handleSort(column)">
                                <div class="flex items-center gap-1"
                                    :class="column.align === 'center' && 'justify-center'">
                                    <span>{{ column.label }}</span>
                                    <Icon v-if="column.sortable" :name="sortIcon(column)" size="14"
                                        :class="sortBy === column.key ? 'text-secondary' : 'opacity-30'" />
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-if="pending">
                            <td :colspan="colCount" class="px-md py-lg text-center body-md">
                                <div class="flex items-center justify-center gap-2 text-on-surface-variant">
                                    <Icon name="lucide:loader-2" size="18" class="animate-spin" />
                                    Memuat data...
                                </div>
                            </td>
                        </tr>

                        <tr v-else-if="!rows.length">
                            <td :colspan="colCount" class="px-md py-lg text-center body-md">
                                <div class="flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                                    <Icon name="lucide:inbox" size="28" class="opacity-50" />
                                    <span>{{ emptyMessage }}</span>
                                </div>
                            </td>
                        </tr>

                        <template v-else v-for="(row, index) in rows" :key="row[rowKey] ?? index">
                            <tr class="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors"
                                :class="expandable && 'cursor-pointer'" @click="expandable && toggleExpand(row, index)">
                                <td v-if="expandable" class="px-md py-sm w-10">
                                    <Icon name="lucide:chevron-right" size="16"
                                        class="text-on-surface-variant transition-transform"
                                        :class="isExpanded(row, index) && 'rotate-90'" />
                                </td>
                                <td v-for="column in columns" :key="column.key"
                                    class="px-md py-sm body-md text-on-surface"
                                    :class="[column.align === 'center' && 'text-center', column.align === 'right' && 'text-right']"
                                    @click.stop="column.key === '__actions' && undefined">
                                    <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]"
                                        :refresh="refresh">
                                        {{ row[column.key] }}
                                    </slot>
                                </td>
                            </tr>

                            <tr v-if="expandable && isExpanded(row, index)"
                                class="border-b border-outline-variant last:border-b-0">
                                <td :colspan="colCount" class="px-md py-md bg-surface-container-lowest">
                                    <slot name="expander" :row="row" :refresh="refresh" />
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <div v-if="meta && meta.totalPages > 1"
                class="flex flex-col sm:flex-row items-center justify-between gap-sm px-md py-sm border-t border-outline-variant bg-surface-container-lowest">
                <span class="text-label-md text-on-surface-variant">
                    Menampilkan {{ (meta.page - 1) * meta.limit + 1 }}–{{ Math.min(meta.page * meta.limit, meta.total)
                    }}
                    dari {{ meta.total }} data
                </span>

                <div class="flex items-center gap-1">
                    <button :disabled="!meta.hasPrevPage"
                        class="flex items-center gap-1 px-3 py-1.5 rounded text-label-md border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-container/20 transition-colors"
                        @click="goToPage(meta.page - 1)">
                        <Icon name="lucide:chevron-left" size="14" />
                        Prev
                    </button>

                    <template v-for="(item, idx) in paginationRange" :key="idx">
                        <span v-if="item === '...'" class="px-1 text-on-surface-variant">
                            <Icon name="lucide:more-horizontal" size="16" />
                        </span>
                        <button v-else class="min-w-[32px] px-2 py-1.5 rounded text-label-md transition-colors"
                            :class="item === meta.page ? 'bg-secondary text-on-secondary' : 'border border-outline-variant hover:bg-secondary-container/20'"
                            @click="goToPage(item as number)">
                            {{ item }}
                        </button>
                    </template>

                    <button :disabled="!meta.hasNextPage"
                        class="flex items-center gap-1 px-3 py-1.5 rounded text-label-md border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-container/20 transition-colors"
                        @click="goToPage(meta.page + 1)">
                        Next
                        <Icon name="lucide:chevron-right" size="14" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>