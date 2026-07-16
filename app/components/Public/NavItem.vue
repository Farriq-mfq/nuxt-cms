<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
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

const emit = defineEmits<{ (e: 'navigate'): void }>()

const route = useRoute()

function menuHref(item: NavItem): string {
    return item.url || `/${item.slug ?? ''}`
}

function handleNavigate() {
    emit('navigate')
}

function isHrefActive(href: string): boolean {
    if (!href || href.startsWith('http') || href.startsWith('//')) return false
    if (href === '/') return route.path === '/'
    return route.path === href || route.path.startsWith(href + '/')
}

function isItemActive(item: NavItem): boolean {
    return isHrefActive(menuHref(item))
}

function isItemOrDescendantActive(item: NavItem): boolean {
    if (!item.children.length) return isItemActive(item)
    return item.children.some((child) => isItemOrDescendantActive(child))
}

const active = computed(() => isItemOrDescendantActive(props.item))

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
        class="text-body-md transition-colors whitespace-nowrap w-full flex items-center gap-2" :class="[
            depth === 0
                ? 'px-4 py-2 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-white after:transition-transform'
                : 'px-4 py-2.5 hover:bg-primary-container/10',
            active
                ? depth === 0
                    ? 'text-surface-variant after:scale-x-100'
                    : 'text-surface-variant bg-primary-container/10'
                : depth === 0
                    ? 'text-surface-variant/70 hover:text-surface-variant after:scale-x-0 hover:after:scale-x-100'
                    : 'text-surface-variant bg-primary-container/5'
        ]" @click="handleNavigate">
        {{ item.title }}
        <Icon v-if="item.target === '_blank'" name="lucide:square-arrow-out-up-right" size="14" />
    </NuxtLink>

    <Popover v-else class="relative" :class="depth > 0 && 'w-full'">
        <PopoverButton
            class="flex items-center gap-1 transition-colors whitespace-nowrap w-full focus:text-surface-variant"
            :class="[
                depth === 0
                    ? 'px-4 py-2 text-body-md justify-center'
                    : 'px-4 py-2.5 text-body-md justify-between',
                active
                    ? depth === 0
                        ? 'text-surface-variant'
                        : 'text-surface-variant bg-primary-container/10'
                    : depth === 0
                        ? 'text-surface-variant/70 hover:text-surface-variant'
                        : 'text-on-surface bg-primary-container/5 hover:bg-primary-container/10 hover:text-surface-variant'
            ]">
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
                        <PublicNavItem v-for="child in column" :key="child.id" :item="child" :depth="depth + 1"
                            @navigate="handleNavigate" />
                    </div>
                </div>

                <div v-else class="flex flex-col min-w-full">
                    <PublicNavItem v-for="child in item.children" :key="child.id" :item="child" :depth="depth + 1"
                        @navigate="handleNavigate" />
                </div>
            </PopoverPanel>
        </transition>
    </Popover>
</template>