<script setup lang="ts">
interface MenuItem {
    label: string
    icon?: string
    to?: string
    children?: MenuItem[]
}

const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'lucide:layout-dashboard', to: '/_admins' },
    { label: 'Menu', icon: 'lucide:menu', to: '/_admins/menus' },
    {
        label: 'Media',
        icon: 'lucide:image',
        children: [
            { label: 'Images', icon: 'lucide:image', to: '/_admins/images' },
            { label: 'Files', icon: 'lucide:file', to: '/_admins/files' },
            { label: 'Albums', icon: 'lucide:folder-open', to: '/_admins/albums' },
        ],
    },
    {
        label: 'Content',
        icon: 'lucide:file-text',
        children: [
            { label: 'Pages', icon: 'lucide:file-text', to: '/_admins/pages' },
            { label: 'News', icon: 'lucide:newspaper', to: '/_admins/news' },
            { label: 'Announcements', icon: 'lucide:megaphone', to: '/_admins/announcements' },
        ],
    },
    { label: 'Related Link', icon: 'lucide:link', to: '/_admins/related-links' },
    { label: 'Setting', icon: 'lucide:settings', to: '/_admins/setting' },
]

const route = useRoute()
const { isOpen, toggle } = useSidebar()

const openGroups = ref<Set<string>>(new Set())

function isChildActive(item: MenuItem): boolean {
    if (!item.children) return false
    return item.children.some((child) => child.to === route.path)
}

function isActive(to?: string): boolean {
    return !!to && route.path === to
}

function toggleGroup(label: string) {
    if (!isOpen.value) {
        isOpen.value = true
    }
    if (openGroups.value.has(label)) {
        openGroups.value.delete(label)
    } else {
        openGroups.value.add(label)
    }
}

function isGroupOpen(item: MenuItem): boolean {
    return isOpen.value && (openGroups.value.has(item.label) || isChildActive(item))
}

watchEffect(() => {
    for (const item of menuItems) {
        if (item.children && isChildActive(item)) {
            openGroups.value.add(item.label)
        }
    }
})
</script>

<template>
    <aside class="fixed left-0 top-0 h-screen bg-primary text-on-primary flex flex-col z-20 transition-all duration-200"
        :class="isOpen ? 'w-64' : 'w-16'">
        <div class="h-16 flex items-center border-b border-white/10 shrink-0"
            :class="isOpen ? 'justify-between px-md' : 'justify-center'">
            <span v-if="isOpen" class="text-headline-md font-bold whitespace-nowrap overflow-hidden">
                Admin Panel
            </span>
            <button type="button" class="p-1.5 rounded hover:bg-white/10 transition-colors" @click="toggle">
                <Icon :name="isOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'" size="20" />
            </button>
        </div>

        <nav class="flex-1 overflow-y-auto py-sm px-3 space-y-1">
            <template v-for="item in menuItems" :key="item.label">
                <NuxtLink v-if="!item.children" :to="item.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded text-body-md transition-colors" :class="[
                        isActive(item.to) ? 'bg-secondary text-on-secondary' : 'text-white/70 hover:text-white hover:bg-white/5',
                        !isOpen && 'justify-center',
                    ]">
                    <Icon :name="item.icon ?? 'lucide:circle'" size="18" class="shrink-0" />
                    <span v-if="isOpen" class="whitespace-nowrap overflow-hidden">{{ item.label }}</span>
                </NuxtLink>

                <div v-else>
                    <button type="button"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded text-body-md transition-colors"
                        :class="[
                            isChildActive(item) ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/5',
                            !isOpen && 'justify-center',
                        ]" @click="toggleGroup(item.label)">
                        <Icon :name="item.icon ?? 'lucide:circle'" size="18" class="shrink-0" />
                        <span v-if="isOpen" class="flex-1 text-left whitespace-nowrap overflow-hidden">{{ item.label
                        }}</span>
                        <Icon v-if="isOpen" name="lucide:chevron-right" size="16" class="transition-transform shrink-0"
                            :class="isGroupOpen(item) && 'rotate-90'" />
                    </button>

                    <div v-show="isGroupOpen(item)" class="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
                        <NuxtLink v-for="child in item.children" :key="child.label" :to="child.to"
                            class="flex items-center gap-3 px-3 py-2 rounded text-body-md transition-colors"
                            :class="isActive(child.to) ? 'bg-secondary text-on-secondary' : 'text-white/70 hover:text-white hover:bg-white/5'">
                            <Icon :name="child.icon ?? 'lucide:minus'" size="16" class="shrink-0" />
                            <span>{{ child.label }}</span>
                        </NuxtLink>
                    </div>
                </div>
            </template>
        </nav>
    </aside>
</template>