<template>
    <div class="min-h-screen flex flex-col bg-background text-on-background">
        <PublicHeader />
        <main class="flex-1 bg-surface-container-lowest text-on-surface">
            <!-- <PublicBreadcrumb :items="[{ label: 'Beranda', to: '/' }, { label: 'ok' }]" /> -->
            <slot />
        </main>
        <PublicFooter />
    </div>
</template>