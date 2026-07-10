<script setup lang="ts">
const { setting } = useSetting()
</script>

<template>
    <PublicContainer>
        <section v-if="setting?.mapEmbedUrl || setting?.address" class="py-xl">
            <div class="grid lg:grid-cols-2 gap-lg items-center">
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary">Hubungi Kami</span>
                    <h2 class="text-headline-lg text-on-surface mt-1 mb-md">Lokasi & Kontak</h2>

                    <ul class="space-y-4">
                        <li v-if="setting?.address" class="flex items-start gap-3">
                            <div
                                class="w-9 h-9 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                <Icon name="lucide:map-pin" size="16" class="text-secondary" />
                            </div>
                            <span class="text-body-md text-on-surface-variant pt-1.5">{{ setting.address }}</span>
                        </li>
                        <li v-if="setting?.contactPhone" class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                <Icon name="lucide:phone" size="16" class="text-secondary" />
                            </div>
                            <a :href="`tel:${setting.contactPhone}`"
                                class="text-body-md text-on-surface-variant hover:text-secondary transition-colors">
                                {{ setting.contactPhone }}
                            </a>
                        </li>
                        <li v-if="setting?.contactEmail" class="flex items-center gap-3">
                            <div
                                class="w-9 h-9 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                <Icon name="lucide:mail" size="16" class="text-secondary" />
                            </div>
                            <a :href="`mailto:${setting.contactEmail}`"
                                class="text-body-md text-on-surface-variant hover:text-secondary transition-colors">
                                {{ setting.contactEmail }}
                            </a>
                        </li>
                    </ul>
                </div>

                <div v-if="setting?.mapEmbedUrl"
                    class="rounded overflow-hidden border border-outline-variant shadow-layer-1 aspect-video">
                    <iframe :src="setting.mapEmbedUrl" class="w-full h-full" loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade" />
                </div>
            </div>
        </section>
    </PublicContainer>
</template>