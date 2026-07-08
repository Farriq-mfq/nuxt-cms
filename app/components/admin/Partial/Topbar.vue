<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const { isOpen, toggle } = useSidebar()
const route = useRoute()

const pageTitle = computed(() => {
    return (route.meta.title as string) ?? route.name?.toString().split('-').join(' ') ?? 'Dashboard'
})

async function handleLogout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/_admins/login')
}
</script>

<template>
    <header
        class="fixed top-0 right-0 h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-md z-10 transition-all duration-200"
        :class="isOpen ? 'left-64' : 'left-16'">
        <div class="flex items-center gap-3">
            <button type="button" class="md:hidden p-2 rounded hover:bg-surface-container-low transition-colors"
                @click="toggle">
                <Icon name="lucide:menu" size="20" />
            </button>
            <h1 class="text-headline-md text-inverse-surface capitalize">{{ pageTitle }}</h1>
        </div>

        <div class="flex items-center gap-4">
            <button type="button"
                class="relative p-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant">
                <Icon name="lucide:bell" size="20" />
                <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-error"></span>
            </button>

            <Menu as="div" class="relative">
                <MenuButton
                    class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <div
                        class="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-label-md font-semibold">
                        A
                    </div>
                    <Icon name="lucide:chevron-down" size="16" class="text-on-surface-variant" />
                </MenuButton>

                <transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <MenuItems
                        class="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded shadow-layer-2 py-1 z-30 focus:outline-none">
                        <MenuItem v-slot="{ active }">
                            <NuxtLink to="/_admins/profile"
                                class="flex items-center gap-2 px-4 py-2 text-body-md text-on-surface"
                                :class="active && 'bg-surface-container-low'">
                                <Icon name="lucide:user" size="16" />
                                Profil
                            </NuxtLink>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                            <button type="button"
                                class="w-full flex items-center gap-2 px-4 py-2 text-body-md text-error"
                                :class="active && 'bg-error-container/20'" @click="handleLogout">
                                <Icon name="lucide:log-out" size="16" />
                                Logout
                            </button>
                        </MenuItem>
                    </MenuItems>
                </transition>
            </Menu>
        </div>
    </header>
</template>