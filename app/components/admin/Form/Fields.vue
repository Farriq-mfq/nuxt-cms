<script setup lang="ts">
import { Switch } from '@headlessui/vue'

interface FieldConfig {
    name: string
    label: string
    type: 'text' | 'password' | 'number' | 'textarea' | 'select' | 'combobox' | 'checkbox' | 'date' | 'icon' | 'editor' | 'file' | 'switch'
    required?: boolean
    placeholder?: string
    options?: { label: string; value: any }[]
    apiUrl?: string
    searchableColumns?: string[]
    multi?: boolean
    labelKey?: string
    valueKey?: string
    accept?: string
}

const props = defineProps<{
    fields: FieldConfig[]
    formData: Record<string, any>
    fieldErrors: Record<string, string>
    isSubmitting: boolean
}>()

function fieldError(name: string) {
    return props.fieldErrors[name]
}

// --- File field handling ---
const filePreviews = ref<Record<string, string>>({})
const fileInputRefs = ref<Record<string, HTMLInputElement>>({})

function setFileInputRef(fieldName: string, el: any) {
    if (el) fileInputRefs.value[fieldName] = el as HTMLInputElement
}

function handleFileChange(fieldName: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    props.formData[fieldName] = file

    if (filePreviews.value[fieldName]) {
        URL.revokeObjectURL(filePreviews.value[fieldName])
    }

    if (file.type.startsWith('image/')) {
        filePreviews.value[fieldName] = URL.createObjectURL(file)
    } else {
        delete filePreviews.value[fieldName]
    }
}

function clearFile(fieldName: string) {
    props.formData[fieldName] = null

    if (filePreviews.value[fieldName]) {
        URL.revokeObjectURL(filePreviews.value[fieldName])
        delete filePreviews.value[fieldName]
    }

    const inputEl = fileInputRefs.value[fieldName]
    if (inputEl) {
        inputEl.value = ''
    }
}

function existingFilePreview(fieldName: string): string | null {
    const value = props.formData[fieldName]
    if (typeof value === 'string' && value) return value
    return filePreviews.value[fieldName] ?? null
}

onBeforeUnmount(() => {
    Object.values(filePreviews.value).forEach((url) => URL.revokeObjectURL(url))
})

const editorRefs = ref<Record<string, any>>({})

function setEditorRef(fieldName: string, el: any) {
    if (el) editorRefs.value[fieldName] = el
}

async function confirmAllEditors() {
    await Promise.allSettled(
        Object.values(editorRefs.value).map((ed) => ed?.confirmSaved?.())
    )
}

async function discardAllEditors() {
    await Promise.allSettled(
        Object.values(editorRefs.value).map((ed) => ed?.discardSession?.())
    )
}

defineExpose({ confirmAllEditors, discardAllEditors })
</script>

<template>
    <div class="space-y-md">
        <div v-for="field in fields" :key="field.name">
            <label v-if="field.type !== 'switch'"
                class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-error">*</span>
            </label>

            <input v-if="field.type === 'text' || field.type === 'password' || field.type === 'number'"
                v-model="formData[field.name]" :type="field.type" :placeholder="field.placeholder"
                :disabled="isSubmitting"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />

            <textarea v-else-if="field.type === 'textarea'" v-model="formData[field.name]"
                :placeholder="field.placeholder" :disabled="isSubmitting" rows="4"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />

            <select v-else-if="field.type === 'select'" v-model="formData[field.name]" :disabled="isSubmitting"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'">
                <option value="" disabled>{{ field.placeholder ?? 'Pilih...' }}</option>
                <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>

            <input v-else-if="field.type === 'date'" v-model="formData[field.name]" type="date" :disabled="isSubmitting"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />

            <label v-else-if="field.type === 'checkbox'" class="flex items-center gap-2"
                :class="isSubmitting && 'opacity-50 cursor-not-allowed'">
                <input type="checkbox" v-model="formData[field.name]" :disabled="isSubmitting"
                    class="w-4 h-4 rounded border-outline-variant text-secondary" />
                <span class="text-body-md text-on-surface">{{ field.placeholder ?? field.label }}</span>
            </label>

            <Switch v-else-if="field.type === 'switch'" v-model="formData[field.name]" :disabled="isSubmitting"
                as="button" type="button" v-slot="{ checked }" class="flex items-center gap-3">
                <span
                    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
                    :class="checked ? 'bg-secondary' : 'bg-outline-variant'">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-surface transition-transform"
                        :class="checked ? 'translate-x-6' : 'translate-x-1'" />
                </span>
                <span class="text-body-md text-on-surface">{{ field.label }}</span>
            </Switch>

            <AdminFormCombobox v-else-if="field.type === 'combobox'" v-model="formData[field.name]"
                :endpoint="field.apiUrl!" :multi="field.multi" :label-key="field.labelKey ?? 'name'"
                :value-key="field.valueKey ?? 'id'" :placeholder="field.placeholder" :disabled="isSubmitting" />

            <AdminFormIconPicker v-else-if="field.type === 'icon'" v-model="formData[field.name]"
                :disabled="isSubmitting" :placeholder="field.placeholder" />

            <AdminFormEditor v-else-if="field.type === 'editor'" :ref="(el) => setEditorRef(field.name, el)"
                v-model="formData[field.name]" :disabled="isSubmitting" :placeholder="field.placeholder" />

            <div v-else-if="field.type === 'file'" class="space-y-2">
                <div v-if="existingFilePreview(field.name)" class="relative w-32 h-32">
                    <img :src="existingFilePreview(field.name)!"
                        class="w-full h-full object-cover rounded border border-outline-variant" />
                    <button type="button" :disabled="isSubmitting"
                        class="absolute -top-2 -right-2 bg-error text-on-error rounded-full p-1 shadow-layer-1 disabled:opacity-50"
                        @click="clearFile(field.name)">
                        <Icon name="lucide:x" size="12" />
                    </button>
                </div>

                <input :ref="(el) => setFileInputRef(field.name, el)" type="file" :accept="field.accept ?? 'image/*'"
                    :disabled="isSubmitting"
                    class="w-full text-body-md file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-secondary-container/40 file:text-on-secondary-container file:cursor-pointer disabled:opacity-50"
                    @change="handleFileChange(field.name, $event)" />
            </div>

            <p v-if="fieldError(field.name)" class="text-label-md text-error mt-1">
                {{ fieldError(field.name) }}
            </p>
        </div>
    </div>
</template>