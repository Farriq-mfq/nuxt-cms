<template>
    <div class="min-h-screen flex flex-col bg-background text-on-background">
        <PublicHeader />
        <main class="flex-1">
            <slot />
        </main>
        <PublicFooter />
    </div>
</template>