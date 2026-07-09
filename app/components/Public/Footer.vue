<script setup lang="ts">
const { setting } = useSetting()

const { data: relatedLinksData } = await useAsyncData(
    'public-related-links',
    () => $fetch('/api/public/related-links', { query: { limit: 20 } })
)

const relatedLinks = computed(() => relatedLinksData.value?.data ?? [])

const socialPlatforms = [
    { key: 'facebook', icon: 'lucide:facebook' },
    { key: 'instagram', icon: 'lucide:instagram' },
    { key: 'twitter', icon: 'lucide:twitter' },
    { key: 'youtube', icon: 'lucide:youtube' },
    { key: 'linkedin', icon: 'lucide:linkedin' },
    { key: 'tiktok', icon: 'lucide:music-2' },
] as const

const activeSocials = computed(() => {
    if (!setting.value?.socialLinks) return []
    return socialPlatforms.filter((p) => setting.value?.socialLinks?.[p.key])
})
</script>

<template>
    <footer class="bg-primary text-on-primary mt-xl">
        <div class="max-w-7xl mx-auto px-margin py-xl">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-lg">
                <div class="md:col-span-2">
                    <div class="flex items-center gap-2 mb-sm">
                        <img v-if="setting?.appLogo" :src="setting.appLogo" :alt="setting?.appName"
                            class="h-10 w-auto object-contain" />
                        <span class="text-headline-md">{{ setting?.appName }}</span>
                    </div>
                    <p class="text-body-md text-on-primary/70 max-w-md">{{ setting?.appDescription }}</p>

                    <div v-if="activeSocials.length" class="flex items-center gap-2 mt-md">
                        <a v-for="social in activeSocials" :key="social.key" :href="setting?.socialLinks?.[social.key]"
                            target="_blank" rel="noopener noreferrer"
                            class="w-9 h-9 flex items-center justify-center rounded-full bg-on-primary/10 hover:bg-on-primary/20 transition-colors">
                            <Icon :name="social.icon" size="16" />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 class="text-label-md uppercase tracking-wide text-on-primary/50 mb-sm">Kontak</h3>
                    <ul class="space-y-2 text-body-md text-on-primary/80">
                        <li v-if="setting?.address" class="flex items-start gap-2">
                            <Icon name="lucide:map-pin" size="16" class="shrink-0 mt-0.5" />
                            <span>{{ setting.address }}</span>
                        </li>
                        <li v-if="setting?.contactEmail" class="flex items-center gap-2">
                            <Icon name="lucide:mail" size="16" class="shrink-0" />
                            <a :href="`mailto:${setting.contactEmail}`"
                                class="hover:text-on-primary transition-colors">{{
                                    setting.contactEmail }}</a>
                        </li>
                        <li v-if="setting?.contactPhone" class="flex items-center gap-2">
                            <Icon name="lucide:phone" size="16" class="shrink-0" />
                            <a :href="`tel:${setting.contactPhone}`" class="hover:text-on-primary transition-colors">{{
                                setting.contactPhone }}</a>
                        </li>
                        <li v-if="setting?.contactWhatsapp" class="flex items-center gap-2">
                            <Icon name="lucide:message-circle" size="16" class="shrink-0" />
                            <a :href="`https://wa.me/${setting.contactWhatsapp.replace(/\D/g, '')}`" target="_blank"
                                class="hover:text-on-primary transition-colors">
                                {{ setting.contactWhatsapp }}
                            </a>
                        </li>
                    </ul>
                </div>

                <div v-if="relatedLinks.length">
                    <h3 class="text-label-md uppercase tracking-wide text-on-primary/50 mb-sm">Tautan Terkait</h3>
                    <ul class="space-y-2 text-body-md text-on-primary/80">
                        <li v-for="link in relatedLinks" :key="link.id">
                            <a :href="link.url" target="_blank" rel="noopener noreferrer"
                                class="flex items-center gap-2 hover:text-on-primary transition-colors">
                                <Icon v-if="link.icon" :name="link.icon" size="14" />
                                {{ link.title }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-on-primary/10 mt-lg pt-md text-center">
                <p class="text-label-md text-on-primary/50">
                    {{ setting?.footerText || `© ${new Date().getFullYear()} ${setting?.appName}. All rights reserved.`
                    }}
                </p>
            </div>
        </div>
    </footer>
</template>