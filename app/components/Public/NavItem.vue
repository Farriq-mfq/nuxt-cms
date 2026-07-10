<script setup lang="ts">
import { computed } from 'vue' // Pastikan computed di-import jika tidak menggunakan auto-import
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

interface NavItem {
    id: number
    title: string
    url?: string | null
    slug?: string
    target?: string
    children: NavItem[]
}

const props = defineProps<{
    item: NavItem
    depth: number
}>()

function menuHref(item: NavItem): string {
    return item.url || `/#`
}

const COLUMN_COUNT = 4

const columns = computed(() => {
    if (props.depth !== 0) return [props.item.children]

    const children = props.item.children
    const perColumn = Math.ceil(children.length / COLUMN_COUNT)
    const result: NavItem[][] = []

    for (let i = 0; i < children.length; i += perColumn) {
        result.push(children.slice(i, i + perColumn))
    }

    return result
})
</script>

<template>
    <NuxtLink v-if="!item.children.length" :to="menuHref(item)" :target="item.target"
        class="text-body-md transition-colors whitespace-nowrap text-white/70 w-full flex items-center gap-2" :class="depth === 0
            ? 'px-4 py-2 text-white/70 hover:text-white relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform'
            : 'px-4 py-2.5 text-on-surface bg-primary-container/5 hover:bg-primary-container/10 hover:text-white'">
        {{ item.title }}
        <Icon v-if="item.target === '_blank'" name="lucide:square-arrow-out-up-right" size="14" />
    </NuxtLink>

    <Popover v-else class="relative" :class="depth > 0 && 'w-full'">
        <PopoverButton
            class="flex items-center gap-1 transition-colors whitespace-nowrap w-full text-white/70 focus:text-white"
            :class="depth === 0
                ? 'px-4 py-2 text-body-md text-white/70 hover:text-white justify-center'
                : 'px-4 py-2.5 text-body-md text-on-surface hover:bg-primary-container/10 hover:text-white bg-primary-container/5 justify-between'">
            <div class="flex items-center gap-3">
                {{ item.title }}
                <Icon v-if="item.target === '_blank'" name="lucide:square-arrow-out-up-right" size="14" />
            </div>
            <Icon :name="depth === 0 ? 'lucide:chevron-down' : 'lucide:chevron-right'" size="14" />
        </PopoverButton>

        <transition enter-active-class="transition duration-150 ease-out"
            :enter-from-class="depth === 0 ? 'opacity-0 -translate-y-1' : 'opacity-0 -translate-x-1'"
            :enter-to-class="depth === 0 ? 'opacity-100 translate-y-0' : 'opacity-100 translate-x-0'"
            leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
            leave-to-class="opacity-0">

            <PopoverPanel class="z-20 bg-primary shadow-layer-2 border border-surface/10 py-1" :class="depth === 0
                ? 'fixed left-0 right-0 top-16 w-screen border-x-0'
                : 'absolute -left-1 right-0 top-full min-w-[200px] ml-1'">

                <div v-if="depth === 0" class="max-w-7xl mx-auto px-margin py-md grid gap-x-xs"
                    :style="{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }">
                    <div v-for="(column, colIndex) in columns" :key="colIndex" class="space-y-1">
                        <PublicNavItem v-for="child in column" :key="child.id" :item="child" :depth="depth + 1" />
                    </div>
                </div>

                <div v-else class="flex flex-col min-w-full">
                    <PublicNavItem v-for="child in item.children" :key="child.id" :item="child" :depth="depth + 1" />
                </div>
            </PopoverPanel>
        </transition>
    </Popover>
</template>