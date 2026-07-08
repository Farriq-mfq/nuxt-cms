<script setup lang="ts">
const { theme, setTheme } = useTheme()

const themes: { label: string; value: ThemeName; icon: string }[] = [
    { label: 'Academic Precision', value: 'academic-precision', icon: 'lucide:sun' },
    { label: 'Academic Precision Dark', value: 'academic-precision-dark', icon: 'lucide:moon' },
    { label: 'Forest', value: 'forest', icon: 'lucide:sun' },
    { label: 'Forest Dark', value: 'forest-dark', icon: 'lucide:moon' },
    { label: 'Sunset', value: 'sunset', icon: 'lucide:sun' },
    { label: 'Sunset Dark', value: 'sunset-dark', icon: 'lucide:moon' },
    { label: 'Ocean', value: 'ocean', icon: 'lucide:sun' },
    { label: 'Ocean Dark', value: 'ocean-dark', icon: 'lucide:moon' },
    { label: 'Rose', value: 'rose', icon: 'lucide:sun' },
    { label: 'Rose Dark', value: 'rose-dark', icon: 'lucide:moon' },
    { label: 'Lavender', value: 'lavender', icon: 'lucide:sun' },
    { label: 'Lavender Dark', value: 'lavender-dark', icon: 'lucide:moon' },
    { label: 'Slate', value: 'slate', icon: 'lucide:sun' },
    { label: 'Slate Dark', value: 'slate-dark', icon: 'lucide:moon' },
    { label: 'Crimson', value: 'crimson', icon: 'lucide:sun' },
    { label: 'Crimson Dark', value: 'crimson-dark', icon: 'lucide:moon' },
    { label: 'Amber', value: 'amber', icon: 'lucide:sun' },
    { label: 'Amber Dark', value: 'amber-dark', icon: 'lucide:moon' },
    { label: 'High Contrast', value: 'high-contrast', icon: 'lucide:sun' },
    { label: 'High Contrast Dark', value: 'high-contrast-dark', icon: 'lucide:moon' },
    { label: 'Indigo', value: 'indigo', icon: 'lucide:sun' },
    { label: 'Indigo Dark', value: 'indigo-dark', icon: 'lucide:moon' },
    { label: 'Emerald', value: 'emerald', icon: 'lucide:sun' },
    { label: 'Emerald Dark', value: 'emerald-dark', icon: 'lucide:moon' },
    { label: 'Coral', value: 'coral', icon: 'lucide:sun' },
    { label: 'Coral Dark', value: 'coral-dark', icon: 'lucide:moon' },
    { label: 'Plum', value: 'plum', icon: 'lucide:sun' },
    { label: 'Plum Dark', value: 'plum-dark', icon: 'lucide:moon' },
    { label: 'Steel', value: 'steel', icon: 'lucide:sun' },
    { label: 'Steel Dark', value: 'steel-dark', icon: 'lucide:moon' },
    { label: 'Olive', value: 'olive', icon: 'lucide:sun' },
    { label: 'Olive Dark', value: 'olive-dark', icon: 'lucide:moon' },
]

const COLOR_TOKENS = [
    'surface', 'surface-dim', 'surface-bright',
    'surface-container-lowest', 'surface-container-low', 'surface-container',
    'surface-container-high', 'surface-container-highest',
    'on-surface', 'on-surface-variant',
    'inverse-surface', 'inverse-on-surface',
    'outline', 'outline-variant',
    'primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
    'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
    'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
    'error', 'on-error', 'error-container', 'on-error-container',
    'background', 'on-background', 'surface-variant',
]

const currentDataTheme = ref('')
const resolvedValues = ref<Record<string, string>>({})

function refreshDebugInfo() {
    if (!import.meta.client) return

    currentDataTheme.value = document.documentElement.getAttribute('data-theme') ?? '(kosong)'

    const styles = getComputedStyle(document.documentElement)
    const result: Record<string, string> = {}
    for (const token of COLOR_TOKENS) {
        const raw = styles.getPropertyValue(`--color-${token}`).trim()
        result[token] = raw || '(tidak terdefinisi)'
    }
    resolvedValues.value = result
}

onMounted(() => {
    refreshDebugInfo()
})

watch(theme, () => {
    nextTick(refreshDebugInfo)
})

function handleSetTheme(t: ThemeName) {
    setTheme(t)
    nextTick(refreshDebugInfo)
}

function rgbToCss(raw: string): string {
    if (raw === '(tidak terdefinisi)') return 'transparent'
    return `rgb(${raw})`
}

function isMissing(raw: string): boolean {
    return raw === '(tidak terdefinisi)'
}
const hideInfo = ref(true)
</script>

<template>
    <div
        class="fixed bottom-0 right-0 z-[99999] w-96 max-h-[80vh] overflow-y-auto bg-white border-2 border-secondary shadow-layer-2 font-mono text-xs">
        <div class="sticky top-0 bg-secondary text-on-secondary px-3 py-2 flex items-center justify-between">
            <span class="font-bold">🐛 Theme Debugger</span>
            <div class="flex items-center gap-2">
                <button class="hover:opacity-70" @click="refreshDebugInfo">
                    <Icon name="lucide:refresh-cw" size="14" />
                </button>
                <button class="hover:opacity-70" @click="hideInfo = !hideInfo">
                    <Icon :name="hideInfo ? 'lucide:eye-off' : 'lucide:eye'" size="14" />
                </button>
            </div>
        </div>

        <div class="p-3 space-y-3" v-if="!hideInfo">
            <div class="space-y-1">
                <div class="font-bold text-on-surface">data-theme di &lt;html&gt;:</div>
                <div class="px-2 py-1 bg-surface-container-low rounded text-on-surface">
                    {{ currentDataTheme }}
                </div>
            </div>

            <div class="space-y-1">
                <div class="font-bold text-on-surface">Composable theme.value:</div>
                <div class="px-2 py-1 bg-surface-container-low rounded text-on-surface">
                    {{ theme }}
                </div>
            </div>

            <div v-if="currentDataTheme !== theme"
                class="flex items-center gap-1 px-2 py-1 bg-error-container text-on-error-container rounded">
                <Icon name="lucide:alert-triangle" size="14" />
                MISMATCH! attribute dan state tidak sinkron
            </div>

            <div class="space-y-1">
                <div class="font-bold text-on-surface">Switch tema:</div>
                <div class="flex gap-1 flex-wrap">
                    <button v-for="t in themes" :key="t.value"
                        class="flex items-center gap-1 px-2 py-1 rounded border transition-colors"
                        :class="theme === t.value ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'"
                        @click="handleSetTheme(t.value)">
                        <Icon :name="t.icon" size="12" />
                        {{ t.label }}
                    </button>
                </div>
            </div>

            <div class="space-y-1">
                <div class="font-bold text-on-surface">CSS Variables (resolved):</div>
                <div class="space-y-0.5">
                    <div v-for="token in COLOR_TOKENS" :key="token" class="flex items-center gap-2 px-1 py-0.5 rounded"
                        :class="isMissing(resolvedValues[token]) && 'bg-error-container/50'">
                        <div class="w-4 h-4 rounded border border-outline-variant shrink-0"
                            :style="{ backgroundColor: rgbToCss(resolvedValues[token]) }" />
                        <span class="w-40 shrink-0 text-on-surface-variant">--color-{{ token }}</span>
                        <span class="text-on-surface truncate"
                            :class="isMissing(resolvedValues[token]) && 'text-error font-bold'">
                            {{ resolvedValues[token] }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>