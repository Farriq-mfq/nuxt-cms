<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

interface FieldConfig {
    name: string
    label: string
    type: 'text' | 'password' | 'number' | 'textarea' | 'select' | 'combobox' | 'checkbox' | 'date' | 'icon'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: any }[]
    apiUrl?: string
    searchableColumns?: string[]
    multi?: boolean
    labelKey?: string
    valueKey?: string
}

interface ModeConfig {
    title: string
    successMessage: string
    errorMessage: string
    submitLabel: string
    cancelLabel: string
    fields: FieldConfig[]
    mutation: (payload: any) => Promise<any>
    transformForm?: (formData: Record<string, any>) => any
    transformData?: (rowData: Record<string, any>) => Record<string, any>
}

const props = defineProps<{
    title?: string
    modes: Record<string, ModeConfig>
}>()

const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const isOpen = ref(false)
const currentModeKey = ref<string>('create')
const formData = reactive<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const currentMode = computed(() => props.modes[currentModeKey.value])

function defaultValueFor(field: FieldConfig) {
    if (field.type === 'combobox') return field.multi ? [] : null
    if (field.type === 'checkbox') return false
    return ''
}

function open(modeKey: string, rowData?: Record<string, any>) {
    currentModeKey.value = modeKey
    fieldErrors.value = {}
    generalError.value = ''

    Object.keys(formData).forEach((key) => delete formData[key])

    const mode = props.modes[modeKey]
    if (!mode) return

    if (rowData) {
        const initial = mode.transformData ? mode.transformData(rowData) : rowData
        Object.assign(formData, initial)
    } else {
        for (const field of mode.fields) {
            formData[field.name] = defaultValueFor(field)
        }
    }

    isOpen.value = true
}

function close() {
    isOpen.value = false
}

const toast = useToast()

async function handleSubmit() {
    if (!currentMode.value) return

    fieldErrors.value = {}
    generalError.value = ''
    isSubmitting.value = true

    try {
        const payload = currentMode.value.transformForm
            ? currentMode.value.transformForm(formData)
            : { ...formData }

        await currentMode.value.mutation(payload)

        toast.success({ title: 'Berhasil', message: currentMode.value.successMessage })

        emit('refresh')
        close()
    } catch (err: any) {
        const errors = extractFieldErrors(err)

        if (errors?.length) {
            fieldErrors.value = Object.fromEntries(errors.map((e) => [e.field, e.message]))
        } else {
            const message = extractGeneralMessage(err) || currentMode.value.errorMessage
            generalError.value = message
            toast.error({ title: 'Gagal', message: currentMode.value.errorMessage })
        }
    } finally {
        isSubmitting.value = false
    }
}

function extractFieldErrors(err: any): Array<{ field: string; message: string }> | undefined {
    return err?.data?.data?.errors ?? err?.data?.errors ?? undefined
}

function extractGeneralMessage(err: any): string | undefined {
    return err?.data?.data?.message ?? err?.data?.message ?? err?.message
}

defineExpose({ open, close })
</script>

<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" class="relative z-50" @close="close">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/40" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-md">
                    <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel class="w-full max-w-lg bg-surface rounded shadow-layer-2 overflow-hidden">
                            <div class="flex items-center justify-between px-md py-sm border-b border-outline-variant">
                                <DialogTitle class="text-headline-md text-on-surface">
                                    {{ currentMode?.title ?? title }}
                                </DialogTitle>
                                <button type="button"
                                    class="p-1 rounded hover:bg-surface-container-low transition-colors" @click="close">
                                    <Icon name="lucide:x" size="18" class="text-on-surface-variant" />
                                </button>
                            </div>

                            <form @submit.prevent="handleSubmit">
                                <div class="px-md py-md max-h-[60vh] overflow-y-auto space-y-md">
                                    <div v-if="generalError"
                                        class="flex items-center gap-2 bg-error-container text-on-error-container rounded px-4 py-2 text-body-md">
                                        <Icon name="lucide:alert-circle" size="16" class="shrink-0" />
                                        {{ generalError }}
                                    </div>

                                    <AdminFormFields :fields="currentMode?.fields ?? []" :form-data="formData"
                                        :field-errors="fieldErrors" :is-submitting="isSubmitting" />
                                </div>

                                <div
                                    class="flex items-center justify-end gap-2 px-md py-sm border-t border-outline-variant bg-surface-container-lowest">
                                    <button type="button" :disabled="isSubmitting"
                                        class="px-4 py-2 rounded text-body-md border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
                                        @click="close">
                                        {{ currentMode?.cancelLabel ?? 'Batal' }}
                                    </button>
                                    <button type="submit" :disabled="isSubmitting"
                                        class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-2 text-body-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <Icon v-if="isSubmitting" name="lucide:loader-2" size="16"
                                            class="animate-spin" />
                                        {{ currentMode?.submitLabel ?? 'Simpan' }}
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>