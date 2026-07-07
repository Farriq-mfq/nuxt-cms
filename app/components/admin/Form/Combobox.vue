<script setup lang="ts">
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue'

interface Option {
    [key: string]: any
}

interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

interface ApiResponse {
    success: boolean
    message: string
    data: Option[]
    meta?: PaginationMeta
}

const props = withDefaults(defineProps<{
    endpoint: string
    labelKey?: string
    valueKey?: string
    placeholder?: string
    limit?: number
    extraQuery?: Record<string, any>
    disabled?: boolean
    clearable?: boolean
    multi?: boolean
}>(), {
    labelKey: 'name',
    valueKey: 'id',
    placeholder: 'Cari...',
    limit: 10,
    clearable: true,
    multi: false,
})

// Single mode: modelValue = Option | null
// Multi mode: modelValue = any[] (array of id/valueKey)
const modelValue = defineModel<any>({ default: null })

const query = ref('')
const page = ref(1)
const accumulated = ref<Option[]>([])
const meta = ref<PaginationMeta | null>(null)
const isLoadingMore = ref(false)
const labelCache = ref<Map<any, string>>(new Map())

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedQuery = ref('')

watch(query, (val) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        page.value = 1
        accumulated.value = []
        debouncedQuery.value = val
    }, 300)
})

const queryParams = computed(() => ({
    search: debouncedQuery.value || undefined,
    limit: props.limit,
    page: page.value,
    ...props.extraQuery,
}))

const { data, pending, execute } = await useFetch<ApiResponse>(
    () => props.endpoint,
    { query: queryParams, watch: false, immediate: true }
)

watch(queryParams, async () => {
    isLoadingMore.value = page.value > 1
    await execute()
}, { deep: true })

watch(data, (val) => {
    if (!val) return
    accumulated.value = page.value === 1 ? val.data : [...accumulated.value, ...val.data]
    meta.value = val.meta ?? null
    isLoadingMore.value = false

    for (const item of val.data) {
        labelCache.value.set(item[props.valueKey], item[props.labelKey])
    }
}, { immediate: true })

const options = computed(() => accumulated.value)

async function resolveInitialLabels() {
    if (!props.multi) return
    const ids: any[] = Array.isArray(modelValue.value) ? modelValue.value : []
    const unresolved = ids.filter((id) => !labelCache.value.has(id))
    if (!unresolved.length) return

    try {
        const res = await $fetch<ApiResponse>(props.endpoint, {
            query: { ids: unresolved.join(','), limit: unresolved.length, page: 1 },
        })
        for (const item of res.data ?? []) {
            labelCache.value.set(item[props.valueKey], item[props.labelKey])
        }
    } catch {
        // Diamkan — kalau backend belum support filter `ids`, tag fallback tampil "ID: x"
    }
}

onMounted(resolveInitialLabels)
watch(() => modelValue.value, resolveInitialLabels)

function labelFor(id: any): string {
    return labelCache.value.get(id) ?? `ID: ${id}`
}

const selectedTags = computed(() => {
    if (!props.multi) return []
    const ids = Array.isArray(modelValue.value) ? modelValue.value : []
    return ids.map((id) => ({ id, label: labelFor(id) }))
})

function isSelected(option: Option): boolean {
    const id = option[props.valueKey]
    if (props.multi) {
        return Array.isArray(modelValue.value) && modelValue.value.includes(id)
    }
    return modelValue.value?.[props.valueKey] === id
}

function handleSelectMulti(option: Option, event: Event) {
    event.preventDefault()
    const id = option[props.valueKey]
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : []
    const idx = current.indexOf(id)
    if (idx >= 0) {
        current.splice(idx, 1)
    } else {
        current.push(id)
    }
    modelValue.value = current
}

function removeTag(id: any, event: Event) {
    event.stopPropagation()
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : []
    modelValue.value = current.filter((v) => v !== id)
}

function displayValue(option: Option | null) {
    if (props.multi) return ''
    if (!option) return ''
    return option[props.labelKey] ?? ''
}

function handleChangeSingle(value: Option) {
    modelValue.value = value
    resetSearchState()
}

function resetSearchState() {
    clearTimeout(debounceTimer)
    query.value = ''
    debouncedQuery.value = ''
    page.value = 1
    accumulated.value = []
    meta.value = null
}

async function handleClear(event: Event) {
    event.stopPropagation()
    event.preventDefault()

    modelValue.value = props.multi ? [] : null
    resetSearchState()

    await nextTick()
    await execute()
}

const hasValue = computed(() => {
    if (props.multi) return Array.isArray(modelValue.value) && modelValue.value.length > 0
    return !!modelValue.value
})

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function observeSentinel() {
    if (!sentinel.value) return
    observer?.disconnect()
    const root = sentinel.value.closest('[data-combobox-scroll]') as HTMLElement | null
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && meta.value?.hasNextPage && !pending.value && !isLoadingMore.value) {
            page.value += 1
        }
    }, { root, threshold: 0.1 })
    observer.observe(sentinel.value)
}

watch(options, async () => {
    await nextTick()
    observeSentinel()
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <Combobox :model-value="modelValue" :disabled="disabled" @update:model-value="!multi && handleChangeSingle($event)">
        <div class="relative">
            <div
                class="relative w-full min-h-[42px] bg-surface-container-low border border-outline-variant rounded overflow-hidden focus-within:border-secondary transition-colors">

                <div v-if="multi" class="flex flex-wrap items-center gap-1.5 pl-9 pr-9 py-1.5">
                    <span v-for="tag in selectedTags" :key="tag.id"
                        class="flex items-center gap-1 bg-secondary-container/30 text-on-surface text-label-md rounded px-2 py-1">
                        {{ tag.label }}
                        <button type="button" @click="removeTag(tag.id, $event)"
                            class="hover:text-error transition-colors">
                            <Icon name="lucide:x" size="12" />
                        </button>
                    </span>
                    <ComboboxInput
                        class="flex-1 min-w-[80px] bg-transparent text-body-md outline-none disabled:opacity-50"
                        :placeholder="selectedTags.length ? '' : placeholder" @change="query = $event.target.value" />
                </div>

                <ComboboxInput v-else
                    class="w-full bg-transparent pl-9 pr-16 py-2 text-body-md outline-none disabled:opacity-50"
                    :placeholder="placeholder" :display-value="displayValue" @change="query = $event.target.value" />

                <Icon name="lucide:search" size="18"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />

                <button v-if="clearable && hasValue && !disabled" type="button"
                    class="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-outline-variant/40 transition-colors"
                    @click="handleClear">
                    <Icon name="lucide:x" size="16" class="text-on-surface-variant" />
                </button>

                <ComboboxButton class="absolute right-2 top-1/2 -translate-y-1/2">
                    <Icon name="lucide:chevron-down" size="16" class="text-on-surface-variant" />
                </ComboboxButton>
            </div>

            <transition enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0" @after-leave="!multi && (query = '')">
                <ComboboxOptions data-combobox-scroll
                    class="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-outline-variant rounded shadow-layer-2 py-1 focus:outline-none">

                    <div v-if="pending && page === 1"
                        class="flex items-center justify-center gap-2 px-4 py-3 text-body-md text-on-surface-variant">
                        <Icon name="lucide:loader-2" size="16" class="animate-spin" />
                        Memuat...
                    </div>

                    <div v-else-if="!options.length"
                        class="flex items-center gap-2 px-4 py-3 text-body-md text-on-surface-variant">
                        <Icon name="lucide:search-x" size="16" />
                        Tidak ada hasil
                    </div>

                    <template v-else>
                        <template v-for="option in options" :key="option[valueKey]">
                            <ComboboxOption v-if="!multi" v-slot="{ active, selected }" :value="option" as="template">
                                <li class="flex items-center justify-between px-4 py-2 text-body-md cursor-pointer"
                                    :class="active ? 'bg-secondary-container/20 text-on-surface' : 'text-on-surface'">
                                    <span>{{ option[labelKey] }}</span>
                                    <Icon v-if="selected" name="lucide:check" size="16" class="text-secondary" />
                                </li>
                            </ComboboxOption>

                            <li v-else
                                class="flex items-center justify-between px-4 py-2 text-body-md cursor-pointer hover:bg-secondary-container/20 text-on-surface"
                                @click="handleSelectMulti(option, $event)">
                                <span>{{ option[labelKey] }}</span>
                                <Icon v-if="isSelected(option)" name="lucide:check" size="16" class="text-secondary" />
                            </li>
                        </template>

                        <div ref="sentinel" class="h-1"></div>

                        <div v-if="isLoadingMore"
                            class="flex items-center justify-center gap-2 px-4 py-2 text-label-md text-on-surface-variant">
                            <Icon name="lucide:loader-2" size="14" class="animate-spin" />
                            Memuat lebih banyak...
                        </div>
                    </template>
                </ComboboxOptions>
            </transition>
        </div>
    </Combobox>
</template>