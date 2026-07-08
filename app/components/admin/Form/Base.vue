<script setup lang="ts">
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

const props = defineProps<{
    fields: FieldConfig[]
    submitLabel?: string
    cancelLabel?: string
    mutation: (payload: any) => Promise<any>
    transformForm?: (formData: Record<string, any>) => any
    initialData?: Record<string, any>
    successMessage?: string
    errorMessage?: string
    showCancel?: boolean
}>()

const emit = defineEmits<{
    (e: 'success', result: any): void
    (e: 'cancel'): void
}>()

const formData = reactive<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const toast = useToast()

function defaultValueFor(field: FieldConfig) {
    if (field.type === 'combobox') return field.multi ? [] : null
    if (field.type === 'checkbox' || field.type === 'switch') return false
    return ''
}

function initForm() {
    Object.keys(formData).forEach((key) => delete formData[key])

    if (props.initialData) {
        Object.assign(formData, props.initialData)
    } else {
        for (const field of props.fields) {
            formData[field.name] = defaultValueFor(field)
        }
    }
}

initForm()

watch(() => props.initialData, () => {
    initForm()
})

async function handleSubmit() {
    fieldErrors.value = {}
    generalError.value = ''
    isSubmitting.value = true

    try {
        const payload = props.transformForm ? props.transformForm(formData) : { ...formData }
        const result = await props.mutation(payload)

        if (props.successMessage) {
            toast.success({ title: 'Berhasil', message: props.successMessage })
        }

        emit('success', result)
    } catch (err: any) {
        const errors = extractFieldErrors(err)

        if (errors?.length) {
            fieldErrors.value = Object.fromEntries(errors.map((e) => [e.field, e.message]))
        } else {
            const message = extractGeneralMessage(err) || props.errorMessage || 'Terjadi kesalahan'
            generalError.value = message

            if (props.errorMessage) {
                toast.error({ title: 'Gagal', message: props.errorMessage })
            }
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

defineExpose({ resetForm: initForm })
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-md">
        <div v-if="generalError"
            class="flex items-center gap-2 bg-error-container text-on-error-container rounded px-4 py-2 text-body-md">
            <Icon name="lucide:alert-circle" size="16" class="shrink-0" />
            {{ generalError }}
        </div>

        <AdminFormFields :fields="fields" :form-data="formData" :field-errors="fieldErrors"
            :is-submitting="isSubmitting" ref="formFieldsRef" />

        <div class="flex items-center justify-end gap-2 pt-sm">
            <button v-if="showCancel" type="button" :disabled="isSubmitting"
                class="px-4 py-2 rounded text-body-md border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="emit('cancel')">
                {{ cancelLabel ?? 'Batal' }}
            </button>
            <button type="submit" :disabled="isSubmitting"
                class="flex items-center gap-2 bg-secondary text-on-secondary rounded px-6 py-2 text-body-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Icon v-if="isSubmitting" name="lucide:loader-2" size="16" class="animate-spin" />
                {{ submitLabel ?? 'Simpan' }}
            </button>
        </div>
    </form>
</template>