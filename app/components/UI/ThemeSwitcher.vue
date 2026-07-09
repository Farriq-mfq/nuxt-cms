<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { BASE_THEMES, getBaseThemeName, isDarkTheme, buildThemeName } from '~~/server/utils/theme'

const { isDark, toggleDarkMode } = useTheme()

const currentIsDark = computed(() => isDark.value)
</script>

<template>
    <button type="button"
        class="flex items-center gap-1.5 justify-center h-7 w-7 rounded text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors text-on-surface-variant"
        @click="toggleDarkMode">
        <Icon :name="currentIsDark ? 'lucide:moon' : 'lucide:sun'" size="14" />
    </button>
</template>