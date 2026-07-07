<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { ICONS } from '~~/server/utils/constants/icons'

const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
    disabled?: boolean
    placeholder?: string
    clearable?: boolean
}>(), {
    placeholder: 'Pilih icon...',
    clearable: true,
})

const selected = computed(() => ICONS.find((i) => i.value === modelValue.value))

const buttonRef = ref<InstanceType<typeof ListboxButton> | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

function updatePosition() {
    const el = (buttonRef.value as any)?.$el ?? buttonRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    dropdownStyle.value = {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
    }
}

function handleOpen() {
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
}

function handleClose() {
    window.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition)
}

function handleClear(event: Event) {
    event.stopPropagation()
    event.preventDefault()
    modelValue.value = ''
}

onBeforeUnmount(handleClose)
</script>

<template>
    <Listbox :model-value="modelValue" :disabled="disabled" @update:model-value="(v) => (modelValue = v)"
        v-slot="{ open }">
        <div class="relative">
            <ListboxButton ref="buttonRef"
                class="w-full flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded px-4 py-2 text-body-md text-left disabled:opacity-50 disabled:cursor-not-allowed"
                @click="open ? handleClose() : handleOpen()">
                <Icon v-if="selected" :name="selected.value" size="18" />
                <span class="flex-1">{{ selected?.label ?? placeholder }}</span>

                <button v-if="clearable && modelValue && !disabled" type="button"
                    class="p-0.5 rounded hover:bg-outline-variant/40 transition-colors" @click="handleClear">
                    <Icon name="lucide:x" size="16" class="text-on-surface-variant" />
                </button>

                <Icon name="lucide:chevron-down" size="16" class="text-on-surface-variant" />
            </ListboxButton>

            <Teleport to="body">
                <transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0"
                    @after-leave="handleClose">
                    <ListboxOptions v-if="open" :style="dropdownStyle"
                        class="z-[9999] max-h-60 overflow-y-auto bg-white border border-outline-variant rounded shadow-layer-2 py-1 focus:outline-none">
                        <ListboxOption v-for="opt in ICONS" :key="opt.value" v-slot="{ active, selected: isSelected }"
                            :value="opt.value" as="template">
                            <li class="flex items-center gap-2 px-4 py-2 text-body-md cursor-pointer"
                                :class="active ? 'bg-secondary-container/20 text-on-surface' : 'text-on-surface'">
                                <Icon :name="opt.value" size="18" />
                                <span class="flex-1">{{ opt.label }}</span>
                                <Icon v-if="isSelected" name="lucide:check" size="16" class="text-secondary" />
                            </li>
                        </ListboxOption>
                    </ListboxOptions>
                </transition>
            </Teleport>
        </div>
    </Listbox>
</template>