<script setup lang="ts">
useHead({ title: 'Agenda' })
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const { data, pending } = await useAsyncData('public-agenda-list', () =>
    $fetch('/api/public/agenda', { query: { limit: 50 } })
)

const now = new Date()
const allAgenda = computed(() => data.value?.data ?? [])
const upcoming = computed(() => allAgenda.value.filter((a: any) => new Date(a.startDate) >= now))
const past = computed(() => allAgenda.value.filter((a: any) => new Date(a.startDate) < now))

function formatDate(date: string): string {
    return format(new Date(date), 'dd MMMM yyyy', { locale: id })
}

function formatDay(date: string): string {
    return format(new Date(date), 'dd', { locale: id })
}

function formatMonth(date: string): string {
    return format(new Date(date), 'MMMM', { locale: id })
}
</script>

<template>
    <PublicContainer class="bg-surface-container-lowest">
        <PublicBreadcrumb :items="[{ label: 'Agenda' }]" />
        <div class="mt-lg">
            <header class="flex items-start gap-4 mb-lg">
                <div class="w-1 shrink-0 bg-secondary self-stretch min-h-[3.5rem]"></div>
                <div>
                    <span class="text-label-md uppercase tracking-widest text-secondary">Kalender</span>
                    <h1 class="text-display-lg-mobile text-on-surface font-extrabold leading-tight mt-1">Agenda Kegiatan
                    </h1>
                </div>
            </header>

            <div v-if="pending" class="space-y-3">
                <div v-for="i in 4" :key="i" class="h-24 rounded bg-surface-container animate-pulse"></div>
            </div>

            <div v-else-if="!allAgenda.length" class="text-center py-xl">
                <Icon name="lucide:calendar-x" size="40" class="mx-auto text-on-surface-variant opacity-40 mb-3" />
                <p class="text-body-lg text-on-surface-variant">Belum ada agenda tersedia</p>
            </div>

            <template v-else>
                <div v-if="upcoming.length" class="mb-xl">
                    <span
                        class="text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-3">
                        <Icon name="lucide:clock" size="14" />
                        Akan Datang
                    </span>

                    <div class="space-y-3">
                        <NuxtLink v-for="item in upcoming" :key="item.id" :to="`/agenda/${item.slug}`"
                            class="group flex gap-4 bg-white border border-outline-variant rounded shadow-layer-1 hover:shadow-layer-2 transition-shadow p-4">
                            <div
                                class="shrink-0 w-16 h-16 rounded bg-secondary-container/30 flex flex-col items-center justify-center">
                                <span class="text-label-md text-secondary font-semibold">{{ formatMonth(item.startDate)
                                }}</span>
                                <span class="text-headline-md text-secondary font-bold leading-none">{{
                                    formatDay(item.startDate) }}</span>
                            </div>

                            <div class="min-w-0 flex-1">
                                <h3
                                    class="text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                                    {{ item.title }}
                                </h3>
                                <div
                                    class="flex flex-wrap items-center gap-3 text-label-md text-on-surface-variant mt-1.5">
                                    <span class="flex items-center gap-1">
                                        <Icon name="lucide:calendar" size="12" />
                                        {{ formatDate(item.startDate) }} {{ item.endDate ? `-
                                        ${formatDate(item.endDate)}` : '' }}
                                    </span>
                                    <span v-if="item.location" class="flex items-center gap-1">
                                        <Icon name="lucide:map-pin" size="12" />
                                        {{ item.location }}
                                    </span>
                                </div>
                            </div>

                            <Icon name="lucide:chevron-right" size="18"
                                class="self-center text-on-surface-variant shrink-0" />
                        </NuxtLink>
                    </div>
                </div>

                <div v-if="past.length">
                    <span
                        class="text-label-md uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-3">
                        <Icon name="lucide:history" size="14" />
                        Sudah Berlalu
                    </span>

                    <div class="space-y-2">
                        <NuxtLink v-for="item in past" :key="item.id" :to="`/agenda/${item.slug}`"
                            class="flex items-center gap-3 py-2.5 opacity-70 hover:opacity-100 transition-opacity">
                            <span class="text-label-md text-on-surface-variant w-24 shrink-0">{{
                                formatDate(item.startDate) }}</span>
                            <span class="text-body-md text-on-surface line-clamp-1">{{ item.title }}</span>
                        </NuxtLink>
                    </div>
                </div>
            </template>
        </div>
    </PublicContainer>
</template>