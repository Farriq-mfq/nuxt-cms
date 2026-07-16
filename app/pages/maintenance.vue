<script setup lang="ts">
definePageMeta({ layout: false })

useHead({ title: 'Sedang Pemeliharaan' })

const { setting } = useSetting()
</script>


<template>
    <div class="min-h-screen flex items-center justify-center bg-surface-container-lowest px-margin">
        <div class="w-full max-w-md text-center">
            <div class="flex flex-col items-center mb-lg">
                <img v-if="setting?.appLogo" :src="setting.appLogo" :alt="setting?.appName"
                    class="h-14 w-auto object-contain mb-md" />
                <span v-else class="text-headline-md text-on-surface font-bold mb-md">
                    {{ setting?.appName ?? 'Website' }}
                </span>
            </div>

            <div
                class="w-20 h-20 mx-auto mb-md rounded-full bg-secondary-container/30 flex items-center justify-center">
                <Icon name="lucide:wrench" size="36" class="text-secondary" />
            </div>

            <h1 class="text-headline-lg text-on-surface mb-sm">Sedang Pemeliharaan</h1>
            <p class="text-body-md text-on-surface-variant leading-relaxed">
                {{ setting?.maintenanceMessage }}
            </p>

            <div v-if="setting?.contactEmail || setting?.contactWhatsapp"
                class="mt-lg pt-md border-t border-outline-variant">
                <p class="text-label-md text-on-surface-variant uppercase tracking-wide mb-2">
                    Butuh bantuan?
                </p>
                <div class="flex items-center justify-center gap-3">
                    <a v-if="setting?.contactEmail" :href="`mailto:${setting.contactEmail}`"
                        class="flex items-center gap-1.5 text-body-md text-secondary hover:underline">
                        <Icon name="lucide:mail" size="16" />
                        {{ setting.contactEmail }}
                    </a>
                    <a v-if="setting?.contactWhatsapp"
                        :href="`https://wa.me/${setting.contactWhatsapp.replace(/\D/g, '')}`" target="_blank"
                        class="flex items-center gap-1.5 text-body-md text-secondary hover:underline">
                        <Icon name="lucide:message-circle" size="16" />
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>