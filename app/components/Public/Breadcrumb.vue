<script setup lang="ts">
interface BreadcrumbItem {
    label: string
    to?: string
}

defineProps<{
    items: BreadcrumbItem[]
}>()
</script>

<template>
    <div class="border-b border-outline-variant bg-surface-container-low">
        <div class="max-w-6xl mx-auto px-margin py-3">
            <nav class="flex items-center gap-2 text-label-md text-on-surface-variant overflow-x-auto">
                <template v-for="(item, index) in items" :key="index">
                    <NuxtLink v-if="item.to" :to="item.to"
                        class="hover:text-secondary transition-colors whitespace-nowrap shrink-0">
                        {{ item.label }}
                    </NuxtLink>
                    <span v-else class="text-on-surface truncate">
                        {{ item.label }}
                    </span>

                    <Icon v-if="index < items.length - 1" name="lucide:chevron-right" size="12" class="shrink-0" />
                </template>
            </nav>
        </div>
    </div>
</template>