<script setup lang="ts">
interface BreadcrumbItem {
    label: string
    to?: string
    icon?: string
}

const props = defineProps<{
    items: BreadcrumbItem[]
}>()

const allItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Beranda', to: '/', icon: 'lucide:home' },
    ...props.items,
])
</script>

<template>
    <div class="border-b border-outline-variant bg-surface-container-low">
        <div class="px-sm py-3">
            <nav class="flex items-center gap-1.5 text-label-md text-on-surface-variant overflow-x-auto"
                aria-label="Breadcrumb">
                <template v-for="(item, index) in allItems" :key="index">
                    <NuxtLink v-if="item.to && index < allItems.length - 1" :to="item.to"
                        class="group flex items-center gap-1.5 px-2 py-1 whitespace-nowrap shrink-0 hover:text-secondary transition-colors">
                        <Icon v-if="item.icon" :name="item.icon" size="14"
                            class="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                        {{ item.label }}
                    </NuxtLink>

                    <span v-else
                        class="flex items-center gap-1.5 px-2 py-1 whitespace-nowrap shrink-0 text-secondary font-semibold">
                        <Icon v-if="item.icon" :name="item.icon" size="14" class="shrink-0" />
                        <span class="truncate max-w-[200px]">{{ item.label }}</span>
                    </span>

                    <Icon v-if="index < allItems.length - 1" name="lucide:chevron-right" size="13"
                        class="shrink-0 text-outline-variant" />
                </template>
            </nav>
        </div>
    </div>
</template>