<script setup lang="ts">
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral'
type BadgeSize = 'sm' | 'md'

const props = withDefaults(defineProps<{
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
    outline?: boolean
}>(), {
    variant: 'neutral',
    size: 'md',
    dot: false,
    outline: false,
})

const variantClasses: Record<BadgeVariant, { solid: string; outline: string; dot: string }> = {
    primary: {
        solid: 'bg-primary text-on-primary',
        outline: 'border border-primary text-primary bg-transparent',
        dot: 'bg-primary',
    },
    secondary: {
        solid: 'bg-secondary text-on-secondary',
        outline: 'border border-secondary text-secondary bg-transparent',
        dot: 'bg-secondary',
    },
    success: {
        solid: 'bg-green-600 text-white',
        outline: 'border border-green-600 text-green-700 bg-transparent',
        dot: 'bg-green-600',
    },
    error: {
        solid: 'bg-error text-on-error',
        outline: 'border border-error text-error bg-transparent',
        dot: 'bg-error',
    },
    warning: {
        solid: 'bg-amber-500 text-white',
        outline: 'border border-amber-500 text-amber-700 bg-transparent',
        dot: 'bg-amber-500',
    },
    neutral: {
        solid: 'bg-outline-variant text-on-surface',
        outline: 'border border-outline-variant text-on-surface-variant bg-transparent',
        dot: 'bg-on-surface-variant',
    },
}

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-label-md px-2.5 py-1 gap-1.5',
}

const dotSizeClasses: Record<BadgeSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
}

const badgeClass = computed(() => [
    'inline-flex items-center rounded-full font-medium whitespace-nowrap select-none',
    sizeClasses[props.size],
    props.outline ? variantClasses[props.variant].outline : variantClasses[props.variant].solid,
])
</script>

<template>
    <span :class="badgeClass">
        <span v-if="dot" class="rounded-full shrink-0" :class="[dotSizeClasses[size], variantClasses[variant].dot]" />
        <slot />
    </span>
</template>