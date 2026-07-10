<template>
    <div class="min-h-screen flex flex-col bg-background text-on-background">
        <PublicHeader />
        <main class="flex-1 bg-surface-container-high text-on-surface">
            <div class="max-w-7xl mx-auto p-sm xs:px-0">
                <slot />
            </div>
        </main>
        <PublicFooter />
    </div>
</template>