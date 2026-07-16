<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
definePageMeta({
    layout: 'admin',
})

useHead({ title: 'Dashboard' })

const { user } = useUserSession()

const { data, pending } = await useAsyncData('dashboard', () => getDashboard())

const stats = computed(() => data.value?.data?.stats)
const recentPost = computed(() => data.value?.data?.recentPost ?? [])

const statCards = [
    { key: 'post', label: 'Post', icon: 'lucide:sticky-note-plus', color: 'secondary', to: '/_admins/posts' },
    { key: 'pages', label: 'Halaman', icon: 'lucide:file-text', color: 'primary', to: '/_admins/pages' },
    { key: 'albums', label: 'Album', icon: 'lucide:folder-open', color: 'primary', to: '/_admins/albums' },
    { key: 'agenda', label: 'Agenda', icon: 'lucide:calendar-days', color: 'secondary', to: '/_admins/agenda' },
    { key: 'announcement', label: 'Pengumuman', icon: 'lucide:megaphone', color: 'secondary', to: '/_admins/announcements' },
] as const

const colorClasses: Record<string, string> = {
    secondary: 'bg-secondary/10 text-secondary',
    primary: 'bg-primary/10 text-primary',
    tertiary: 'bg-tertiary/10 text-tertiary',
}

const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
})

const quickActions = [
    { label: 'Tambah Post', icon: 'lucide:sticky-note-plus', to: '/_admins/posts' },
    { label: 'Tambah Halaman', icon: 'lucide:file-text', to: '/_admins/pages' },
    { label: 'Tambah Menu', icon: 'lucide:menu', to: '/_admins/menus' },
    { label: 'Pengaturan', icon: 'lucide:settings', to: '/_admins/setting' },
]

</script>

<template>
    <div class="space-y-lg">
        <div class="bg-primary text-on-primary p-lg flex items-center justify-between flex-wrap gap-md">
            <div>
                <p class="text-body-md text-on-primary/70">{{ greeting }},</p>
                <h1 class="text-headline-lg font-bold">{{ user?.name ?? 'Admin' }}</h1>
                <div class="flex items-center gap-2 mt-2">
                    <UiBadge variant="secondary" size="sm">{{ user?.role }}</UiBadge>
                    <span class="text-label-md text-on-primary/60">@{{ user?.username }}</span>
                </div>
            </div>
            <Icon name="lucide:layout-dashboard" size="56" class="text-on-primary/20 hidden sm:block" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            <NuxtLink v-for="card in statCards" :key="card.key" :to="card.to"
                class="bg-surface border border-outline-variant rounded shadow-layer-1 p-md flex items-center gap-4 hover:shadow-layer-2 transition-shadow">
                <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    :class="colorClasses[card.color]">
                    <Icon :name="card.icon" size="22" />
                </div>
                <div class="min-w-0">
                    <p class="text-label-md text-on-surface-variant uppercase tracking-wide truncate">{{ card.label }}
                    </p>
                    <div v-if="pending" class="h-7 w-12 bg-surface-container-low rounded animate-pulse mt-1" />
                    <p v-else class="text-headline-md font-bold text-on-surface">
                        {{ stats?.[card.key] ?? 0 }}
                    </p>
                </div>
            </NuxtLink>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
            <div class="lg:col-span-2 bg-surface border border-outline-variant rounded shadow-layer-1 overflow-hidden">
                <div class="flex items-center justify-between px-md py-sm border-b border-outline-variant">
                    <h2 class="text-headline-md text-on-surface">Post Terbaru</h2>
                    <NuxtLink to="/_admins/posts"
                        class="text-label-md text-secondary hover:underline flex items-center gap-1">
                        Lihat semua
                        <Icon name="lucide:arrow-right" size="12" />
                    </NuxtLink>
                </div>

                <div v-if="pending" class="p-md space-y-3">
                    <div v-for="i in 3" :key="i" class="h-14 bg-surface-container-low rounded animate-pulse" />
                </div>

                <div v-else-if="!recentPost.length"
                    class="flex flex-col items-center justify-center gap-2 py-lg text-on-surface-variant">
                    <Icon name="lucide:inbox" size="28" class="opacity-50" />
                    <span class="text-body-md">Belum ada post</span>
                </div>

                <ul v-else class="divide-y divide-outline-variant">
                    <li v-for="item in recentPost" :key="item.id">
                        <NuxtLink to="/_admins/posts"
                            class="flex items-center gap-3 px-md py-sm hover:bg-surface-container-low transition-colors">
                            <div
                                class="w-10 h-10 rounded bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
                                <img v-if="item.thumbnail?.path" :src="item.thumbnail.path" :alt="item.title"
                                    class="w-full h-full object-cover" />
                                <Icon v-else name="lucide:image" size="16" class="text-on-surface-variant" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-body-md text-on-surface truncate">{{ item.title }}</p>
                                <p class="text-label-md text-on-surface-variant">
                                    {{ format(item.createdAt, 'dd MMMM yyyy', { locale: id }) }}
                                </p>
                            </div>
                            <UiBadge :variant="item.isPublished ? 'success' : 'neutral'" size="sm">
                                {{ item.isPublished ? 'Terbit' : 'Draft' }}
                            </UiBadge>
                        </NuxtLink>
                    </li>
                </ul>
            </div>

            <div class="bg-surface border border-outline-variant rounded shadow-layer-1 p-md">
                <h2 class="text-headline-md text-on-surface mb-sm">Aksi Cepat</h2>
                <div class="space-y-1">
                    <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to"
                        class="flex items-center gap-3 px-3 py-2.5 rounded text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                        <Icon :name="action.icon" size="18" class="text-secondary" />
                        {{ action.label }}
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>