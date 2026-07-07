<script setup lang="ts">
interface FieldConfig {
    name: string
    label: string
    type: 'text' | 'password' | 'number' | 'textarea' | 'select' | 'combobox' | 'checkbox' | 'date' | 'icon' | 'editor'
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
    formData: Record<string, any>
    fieldErrors: Record<string, string>
    isSubmitting: boolean
}>()

function fieldError(name: string) {
    return props.fieldErrors[name]
}


</script>

<template>
    <div class="space-y-md">
        <div v-for="field in fields" :key="field.name">
            <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-error">*</span>
            </label>

            <input v-if="field.type === 'text' || field.type === 'password' || field.type === 'number'"
                v-model="formData[field.name]" :type="field.type" :placeholder="field.placeholder"
                :disabled="isSubmitting"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />

            <textarea v-else-if="field.type === 'textarea'" v-model="formData[field.name]"
                :placeholder="field.placeholder" :disabled="isSubmitting" rows="4"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />

            <select v-else-if="field.type === 'select'" v-model="formData[field.name]" :disabled="isSubmitting"
                class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="fieldError(field.name) ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'">
                <option value="" disabled>{{ field.placeholder ?? 'Pilih...' }}</option>
                <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>

            <label v-else-if="field.type === 'checkbox'" class="flex items-center gap-2"
                :class="isSubmitting && 'opacity-50 cursor-not-allowed'">
                <input type="checkbox" v-model="formData[field.name]" :disabled="isSubmitting"
                    class="w-4 h-4 rounded border-outline-variant text-secondary" />
                <span class="text-body-md text-on-surface">{{ field.placeholder ?? field.label }}</span>
            </label>

            <AdminFormCombobox v-else-if="field.type === 'combobox'" v-model="formData[field.name]"
                :endpoint="field.apiUrl!" :multi="field.multi" :label-key="field.labelKey ?? 'name'"
                :value-key="field.valueKey ?? 'id'" :placeholder="field.placeholder" :disabled="isSubmitting" />

            <AdminFormIconPicker v-else-if="field.type === 'icon'" v-model="formData[field.name]"
                :disabled="isSubmitting" :placeholder="field.placeholder" />

            <AdminFormEditor v-else-if="field.type === 'editor'" v-model="formData[field.name]" :disabled="isSubmitting"
                :placeholder="field.placeholder" />

            <p v-if="fieldError(field.name)" class="text-label-md text-error mt-1">
                {{ fieldError(field.name) }}
            </p>
        </div>
    </div>
</template>