<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { BASE_THEMES, getBaseThemeName, isDarkTheme, buildThemeName } from '~~/server/utils/theme'

const { theme, setTheme } = useTheme()

const currentBase = computed(() => getBaseThemeName(theme.value))
const currentIsDark = computed(() => isDarkTheme(theme.value))

const currentThemeOption = computed(() =>
    BASE_THEMES.find((t) => t.name === currentBase.value) ?? BASE_THEMES[0]
)

function selectBaseTheme(name: string) {
    setTheme(buildThemeName(name, currentIsDark.value))
}

function toggleDarkMode() {
    setTheme(buildThemeName(currentBase.value, !currentIsDark.value))
}
</script>

<template>
    <button type="button"
        class="flex items-center gap-1.5 px-2 py-1 rounded text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors"
        @click="toggleDarkMode">
        <Icon :name="currentIsDark ? 'lucide:moon' : 'lucide:sun'" size="14" />
    </button>
</template>