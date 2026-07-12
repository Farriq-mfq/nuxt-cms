<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Setup Website' })

const currentStep = ref<1 | 2>(1)
const isSubmitting = ref(false)
const generalError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const settingForm = reactive({
    app_name: '',
    app_description: '',
})

const adminForm = reactive({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
})

function goToStep2() {
    if (!settingForm.app_name.trim() || !settingForm.app_description.trim()) {
        fieldErrors.value = {
            ...(!settingForm.app_name.trim() && { 'setting.app_name': 'Nama Website tidak boleh kosong' }),
            ...(!settingForm.app_description.trim() && { 'setting.app_description': 'Deskripsi tidak boleh kosong' }),
        }
        return
    }
    fieldErrors.value = {}
    currentStep.value = 2
}

function backToStep1() {
    currentStep.value = 1
    fieldErrors.value = {}
}

async function handleSubmit() {
    generalError.value = ''
    fieldErrors.value = {}
    isSubmitting.value = true

    try {
        await $fetch('/api/setup', {
            method: 'POST',
            body: { setting: settingForm, admin: adminForm },
        })

        const setupStatus = useState('setup-status')
        setupStatus.value = { isComplete: true }

        await navigateTo('/_admins/login')
    } catch (err: any) {
        const errors = err?.data?.data?.errors ?? err?.data?.errors

        if (errors?.length) {
            fieldErrors.value = Object.fromEntries(errors.map((e: any) => [e.field, e.message]))
            const hasStep1Error = errors.some((e: any) => e.field.startsWith('setting.'))
            if (hasStep1Error) currentStep.value = 1
        } else {
            generalError.value = err?.data?.data?.message ?? err?.data?.message ?? 'Terjadi kesalahan saat setup'
        }
    } finally {
        isSubmitting.value = false
    }
}

function fieldError(key: string) {
    return fieldErrors.value[key]
}
</script>

<template>
    <div class="min-h-screen bg-primary flex items-center justify-center p-margin">
        <div class="w-full max-w-lg bg-surface shadow-layer-2 overflow-hidden p-5 flex flex-col gap-4">
            <div class="bg-primary-container px-6 py-5">
                <span class="text-label-md uppercase tracking-widest text-on-primary-container/70">Setup Awal</span>
                <h1 class="text-headline-md text-on-primary-container mt-1">
                    {{ currentStep === 1 ? 'Informasi Website' : 'Buat Akun Admin' }}
                </h1>
            </div>

            <div class="flex items-center gap-2 px-6 pt-5">
                <div class="flex items-center gap-2 flex-1">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-label-md font-semibold shrink-0"
                        :class="currentStep >= 1 ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'">
                        <Icon v-if="currentStep > 1" name="lucide:check" size="14" />
                        <span v-else>1</span>
                    </div>
                    <div class="flex-1 h-0.5 rounded-full"
                        :class="currentStep > 1 ? 'bg-secondary' : 'bg-outline-variant'"></div>
                </div>

                <div class="w-7 h-7 rounded-full flex items-center justify-center text-label-md font-semibold shrink-0"
                    :class="currentStep >= 2 ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'">
                    2
                </div>
            </div>

            <div class="px-6 pb-6 pt-5">
                <div v-if="generalError"
                    class="flex items-center gap-2 bg-error-container text-on-error-container rounded px-4 py-2 text-body-md mb-md">
                    <Icon name="lucide:alert-circle" size="16" class="shrink-0" />
                    {{ generalError }}
                </div>

                <form v-if="currentStep === 1" class="space-y-md" @submit.prevent="goToStep2">
                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Nama Website <span class="text-error">*</span>
                        </label>
                        <input v-model="settingForm.app_name" type="text" placeholder="Contoh"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors"
                            :class="fieldError('setting.app_name') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('setting.app_name')" class="text-label-md text-error mt-1">{{
                            fieldError('setting.app_name') }}</p>
                    </div>

                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Deskripsi Website <span class="text-error">*</span>
                        </label>
                        <textarea v-model="settingForm.app_description" rows="3"
                            placeholder="Deskripsi singkat tentang institusi/Website ini"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors resize-none"
                            :class="fieldError('setting.app_description') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('setting.app_description')" class="text-label-md text-error mt-1">{{
                            fieldError('setting.app_description') }}</p>
                    </div>

                    <p class="text-label-md text-on-surface-variant">
                        Pengaturan lain (logo, kontak, sosial media, dll) bisa dilengkapi nanti lewat panel admin.
                    </p>

                    <button type="submit"
                        class="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3 text-body-md">
                        Lanjut
                        <Icon name="lucide:arrow-right" size="16" />
                    </button>
                </form>

                <form v-else class="space-y-md" @submit.prevent="handleSubmit">
                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Nama Lengkap <span class="text-error">*</span>
                        </label>
                        <input v-model="adminForm.name" type="text" placeholder="Nama" :disabled="isSubmitting"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50"
                            :class="fieldError('admin.name') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('admin.name')" class="text-label-md text-error mt-1">{{
                            fieldError('admin.name') }}</p>
                    </div>

                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Username <span class="text-error">*</span>
                        </label>
                        <input v-model="adminForm.username" type="text" placeholder="username_admin"
                            :disabled="isSubmitting"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50"
                            :class="fieldError('admin.username') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('admin.username')" class="text-label-md text-error mt-1">{{
                            fieldError('admin.username') }}</p>
                    </div>

                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Password <span class="text-error">*</span>
                        </label>
                        <input v-model="adminForm.password" type="password" placeholder="Minimal 8 karakter"
                            :disabled="isSubmitting"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50"
                            :class="fieldError('admin.password') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('admin.password')" class="text-label-md text-error mt-1">{{
                            fieldError('admin.password') }}</p>
                    </div>

                    <div>
                        <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                            Konfirmasi Password <span class="text-error">*</span>
                        </label>
                        <input v-model="adminForm.confirmPassword" type="password" :disabled="isSubmitting"
                            class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50"
                            :class="fieldError('admin.confirmPassword') ? 'border-error' : 'border-outline-variant focus:border-secondary'" />
                        <p v-if="fieldError('admin.confirmPassword')" class="text-label-md text-error mt-1">{{
                            fieldError('admin.confirmPassword') }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="button" :disabled="isSubmitting"
                            class="px-4 py-3 rounded border border-outline-variant text-body-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                            @click="backToStep1">
                            <Icon name="lucide:arrow-left" size="16" />
                        </button>
                        <button type="submit" :disabled="isSubmitting"
                            class="flex-1 flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded px-6 py-3 text-body-md disabled:opacity-50">
                            <Icon v-if="isSubmitting" name="lucide:loader-2" size="16" class="animate-spin" />
                            {{ isSubmitting ? 'Memproses...' : 'Selesaikan Setup' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>