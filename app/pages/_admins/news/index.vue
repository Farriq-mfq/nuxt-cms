<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})

useHead({ title: 'Berita' })

const tableRef = ref()
const columns = [
    { key: 'title', label: 'Judul', sortable: true },
    { key: 'is_published', label: 'Publish' },
    { key: 'created_at', label: 'Dibuat' },
    { key: 'action', label: 'Aksi', align: 'right' as const, width: '120px' },
]


</script>
<template>
    <p>Halaman News</p>
</template>