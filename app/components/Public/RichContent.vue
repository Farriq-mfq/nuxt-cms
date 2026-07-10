<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'

export interface TocItem {
    id: string
    text: string
    level: 2 | 3
}

const props = withDefaults(defineProps<{
    content: string
    generateToc?: boolean
    proseSize?: 'sm' | 'base' | 'lg'
}>(), {
    generateToc: false,
    proseSize: 'lg',
})

const emit = defineEmits<{
    (e: 'toc', items: TocItem[]): void
}>()

const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 's', 'u', 'a', 'img',
        'h1', 'h2', 'h3', 'h4',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div',
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'title', 'width', 'height',
        'style', 'class', 'data-align', 'data-image-id', 'id',
        'colspan', 'rowspan',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
}

function slugifyHeading(text: string, index: number): string {
    const base = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
    return base ? `${base}-${index}` : `heading-${index}`
}

const sanitized = computed(() => DOMPurify.sanitize(props.content ?? '', SANITIZE_CONFIG))

const finalHtml = ref('')

watchEffect(() => {
    if (!sanitized.value) {
        finalHtml.value = ''
        if (props.generateToc) emit('toc', [])
        return
    }

    if (!props.generateToc || import.meta.server) {
        finalHtml.value = sanitized.value
        return
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized.value, 'text/html')
    const headings = doc.querySelectorAll('h2, h3')
    const items: TocItem[] = []

    headings.forEach((heading, index) => {
        const id = slugifyHeading(heading.textContent ?? '', index)
        heading.setAttribute('id', id)
        items.push({
            id,
            text: heading.textContent ?? '',
            level: heading.tagName === 'H2' ? 2 : 3,
        })
    })

    emit('toc', items)
    finalHtml.value = doc.body.innerHTML
})

const proseClass = computed(() => {
    switch (props.proseSize) {
        case 'sm': return 'prose-sm text-on-surface'
        case 'base': return 'prose text-on-surface'
        default: return 'prose-lg text-on-surface'
    }
})
</script>

<template>
    <article class="prose max-w-none" :class="proseClass" v-html="finalHtml"></article>
</template>