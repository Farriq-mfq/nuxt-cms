<script setup lang="ts">
import { format } from "date-fns";
import { id } from "date-fns/locale";

definePageMeta({
    layout: 'admin'
})

useHead({ title: 'Halaman' })

const tableRef = ref()
const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'is_published', label: 'Publish' },
    { key: 'created_at', label: 'Dibuat' },
    { key: 'action', label: 'Aksi', align: 'right' as const, width: '120px' },
]

const { execute: executeDelete, isPending: deleting } = useConfirmMutation({
    confirmFn: deletePage,
    confirmHeader: "Hapus Halaman",
    confirmMessage: "Halaman yang dihapus tidak bisa dikembalikan. Lanjutkan?",
    confirmLabel: "Ya, Hapus",
    danger: true,
    successMessage: "Halaman berhasil dihapus",
    errorMessage: "Terjadi kesalahan saat menghapus halaman",
    onSuccess: () => {
        tableRef.value?.refresh()
    }
})

</script>

<template>
    <div class="space-y-md">
        <div class="flex items-center justify-between">
            <h1 class="text-headline-lg">Halaman</h1>
        </div>
        <AdminDataTable ref="tableRef" endpoint="/api/_admins/pages" :columns="columns"
            :search-placeholder="'Cari Halaman...'" default-sort-by="created_at" default-sort-order="desc" row-key="id">
            <template #toolbar>
                <button @click="$router.push('/_admins/pages/create')"
                    class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3">
                    <Icon name="lucide:plus" size="18" />
                    Tambah Halaman
                </button>
            </template>
            <template #cell-title="{ row }">
                <NuxtLink class="text-secondary text-label-md underline" :to="`/_admins/pages/${row.id}/edit`">
                    {{ row.title }}
                </NuxtLink>
            </template>
            <template #cell-is_published="{ row, refresh }">
                <UIBadge variant="success" v-if="row.isPublished">
                    <Icon name="lucide:check" size="14" />
                    Published
                </UIBadge>
                <UIBadge variant="secondary" v-else>
                    <Icon name="lucide:lock" size="14" />
                    Draft
                </UIBadge>
            </template>
            <template #cell-created_at="{ row }">
                {{ format(new Date(row.createdAt), 'dd MMMM yyyy', { locale: id }) }}
            </template>
            <template #cell-action="{ row, refresh }">
                <div class="flex items-center justify-end gap-2">
                    <UIButtonCopy :text="`/p/${row.slug}`" :success-message="'Link berhasil disalin'" />
                    <NuxtLink class="text-secondary hover:underline text-label-md"
                        :to="`/_admins/pages/${row.id}/edit`">
                        <Icon name="lucide:edit" size="18" />
                    </NuxtLink>
                    <button class="text-error hover:underline text-label-md" :disabled="deleting"
                        @click="executeDelete(row.id, refresh)">
                        <Icon name="lucide:trash-2" size="18" />
                    </button>
                </div>
            </template>
        </AdminDataTable>
    </div>
</template>