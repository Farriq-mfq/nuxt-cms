<script setup lang="ts">
interface MenuNode {
    id: number
    title: string
    slug: string
    url: string | null
    icon: string | null
    target: '_self' | '_blank'
    children: MenuNode[]
}

const props = defineProps<{
    item: MenuNode
    depth?: number
}>()

const emit = defineEmits<{ (e: 'navigate'): void }>()

const route = useRoute()
const depth = computed(() => props.depth ?? 0)

function menuHref(item: MenuNode): string {
    return item.url || `/${item.slug}`
}

function isHrefActive(href: string): boolean {
    if (!href || href.startsWith('http') || href.startsWith('//')) return false
    if (href === '/') return route.path === '/'
    return route.path === href || route.path.startsWith(href + '/')
}

function isItemActive(item: MenuNode): boolean {
    return isHrefActive(menuHref(item))
}

function isItemOrDescendantActive(item: MenuNode): boolean {
    if (!item.children.length) return isItemActive(item)
    return item.children.some((child) => isItemOrDescendantActive(child))
}

const active = computed(() => isItemOrDescendantActive(props.item))

const isOpen = ref(active.value)
</script>

<template>
    <NuxtLink v-if="!item.children.length" :to="menuHref(item)" :target="item.target"
        class="flex items-center min-h-[44px] px-4 text-body-md transition-colors" :class="[
            depth === 0 ? 'min-h-[44px]' : 'min-h-[40px]',
            active
                ? 'text-white bg-white/10 font-medium'
                : depth === 0
                    ? 'text-white hover:bg-white/10 active:bg-white/15'
                    : 'text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15'
        ]" @click="emit('navigate')">
        {{ item.title }}
    </NuxtLink>

    <div v-else>
        <button class="w-full flex items-center justify-between min-h-[44px] px-4 text-body-md transition-colors"
            :class="[
                depth === 0 ? 'min-h-[44px]' : 'min-h-[40px]',
                active
                    ? 'text-white bg-white/10 font-medium'
                    : depth === 0
                        ? 'text-white hover:bg-white/10 active:bg-white/15'
                        : 'text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15'
            ]" @click="isOpen = !isOpen">
            <span>{{ item.title }}</span>
            <Icon name="lucide:chevron-down" size="16" class="transition-transform shrink-0"
                :class="isOpen && 'rotate-180'" />
        </button>

        <div v-show="isOpen" class="mt-2 ml-4 pl-4 border-l-2 border-white/15 space-y-1.5">
            <PublicMobileNavItem v-for="child in item.children" :key="child.id" :item="child" :depth="depth + 1"
                @navigate="emit('navigate')" />
        </div>
    </div>
</template>