<script setup lang="ts">
definePageMeta({
    layout: 'auth',
})

useHead({ title: 'Login' })

const appConfig = useAppConfig()

const { fetch: refreshSession } = useUserSession()
const router = useRouter()

const username = ref('')
const password = ref('')
const fieldErrors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

function fieldError(name: string) {
    return fieldErrors.value[name]
}

async function handleSubmit() {
    fieldErrors.value = {}
    generalError.value = ''
    isSubmitting.value = true

    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { username: username.value, password: password.value },
        })

        await refreshSession()
        router.push('/_admins')
    } catch (err: any) {
        const errors = err?.data?.data?.errors ?? err?.data?.errors

        if (errors?.length) {
            fieldErrors.value = Object.fromEntries(errors.map((e: any) => [e.field, e.message]))
        } else {
            generalError.value = err?.data?.data?.message ?? err?.data?.message ?? 'Login gagal'
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div>
        <div class="mb-md text-center">
            <h1 class="text-headline-md text-on-surface">
                {{ appConfig.app.name }}
            </h1>
            <p class="text-body-md text-on-surface-variant mt-1">Silakan login untuk melanjutkan</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-md">
            <div v-if="generalError"
                class="flex items-center gap-2 bg-error-container text-on-error-container rounded px-4 py-2 text-body-md">
                <Icon name="lucide:alert-circle" size="16" class="shrink-0" />
                {{ generalError }}
            </div>

            <div>
                <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                    Username
                </label>
                <input v-model="username" type="text" placeholder="Masukkan username" :disabled="isSubmitting"
                    class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="fieldError('username') ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />
                <p v-if="fieldError('username')" class="text-label-md text-error mt-1">
                    {{ fieldError('username') }}
                </p>
            </div>

            <div>
                <label class="block text-label-md uppercase tracking-wide text-on-surface-variant mb-1">
                    Password
                </label>
                <input v-model="password" type="password" placeholder="Masukkan password" :disabled="isSubmitting"
                    class="w-full bg-surface-container-low border rounded px-4 py-2 text-body-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="fieldError('password') ? 'border-error focus:border-error' : 'border-outline-variant focus:border-secondary'" />
                <p v-if="fieldError('password')" class="text-label-md text-error mt-1">
                    {{ fieldError('password') }}
                </p>
            </div>

            <button type="submit" :disabled="isSubmitting"
                class="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded px-6 py-2.5 text-body-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Icon v-if="isSubmitting" name="lucide:loader-2" size="16" class="animate-spin" />
                Masuk
            </button>
        </form>
    </div>
</template>