<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const { isOpen, toggle } = useSidebar()
const route = useRoute()
const { user } = useUserSession()

const { clear: clearSession } = useUserSession()
const toast = useToast()
const isLoggingOut = ref(false)

async function handleLogout() {
    isLoggingOut.value = true

    try {
        await $fetch('/api/_admins/auth/logout', { method: 'POST' })
    } catch (err) {
        console.error('Logout endpoint error:', err)
    }

    await clearSession()
    isLoggingOut.value = false
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
        </div>

        <div class="flex items-center gap-4">
            <Menu as="div" class="relative">
                <MenuButton
                    class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <div
                        class="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-label-md font-semibold">
                        {{ user?.name?.charAt(0).toUpperCase() }}
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