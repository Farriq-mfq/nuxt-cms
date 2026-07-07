<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { ResizableImage } from './Editor/resizable-image'

import Placeholder from '@tiptap/extension-placeholder'

const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
    disabled?: boolean
    placeholder?: string
}>(), {
    placeholder: 'Tulis konten di sini...',
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadError = ref('')

const editor = useEditor({
    content: modelValue.value,
    extensions: [
        StarterKit,
        Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-secondary underline' } }),
        ResizableImage.configure({ HTMLAttributes: { class: 'rounded max-w-full' } }), // ← ganti dari Image
        Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editable: !props.disabled,
    editorProps: {
        attributes: {
            class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-body-md text-on-surface',
        },
        handleDrop: (view, event) => {
            const file = event.dataTransfer?.files?.[0]
            if (file && file.type.startsWith('image/')) {
                event.preventDefault()
                uploadAndInsert(file)
                return true
            }
            return false
        },
        handlePaste: (view, event) => {
            const file = Array.from(event.clipboardData?.items ?? [])
                .find((item) => item.type.startsWith('image/'))
                ?.getAsFile()
            if (file) {
                event.preventDefault()
                uploadAndInsert(file)
                return true
            }
            return false
        },
    },
    onUpdate: ({ editor }) => {
        modelValue.value = editor.getHTML()
    },
})

watch(() => props.disabled, (val) => {
    editor.value?.setEditable(!val)
})

watch(modelValue, (val) => {
    const current = editor.value?.getHTML()
    if (val !== current) {
        editor.value?.commands.setContent(val, false)
    }
})

function toggleBold() { editor.value?.chain().focus().toggleBold().run() }
function toggleItalic() { editor.value?.chain().focus().toggleItalic().run() }
function toggleStrike() { editor.value?.chain().focus().toggleStrike().run() }
function toggleHeading(level: 1 | 2 | 3) { editor.value?.chain().focus().toggleHeading({ level }).run() }
function toggleBulletList() { editor.value?.chain().focus().toggleBulletList().run() }
function toggleOrderedList() { editor.value?.chain().focus().toggleOrderedList().run() }
function toggleBlockquote() { editor.value?.chain().focus().toggleBlockquote().run() }
function setLink() {
    const url = window.prompt('Masukkan URL')
    if (url === null) return
    if (url === '') {
        editor.value?.chain().focus().unsetLink().run()
        return
    }
    editor.value?.chain().focus().setLink({ href: url }).run()
}
function undo() { editor.value?.chain().focus().undo().run() }
function redo() { editor.value?.chain().focus().redo().run() }

function isActive(name: string, attrs?: Record<string, any>) {
    return editor.value?.isActive(name, attrs) ?? false
}

function triggerFilePicker() {
    fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    await uploadAndInsert(file)

    if (fileInputRef.value) fileInputRef.value.value = ''
}

async function uploadAndInsert(file: File) {
    uploadError.value = ''

    if (!file.type.startsWith('image/')) {
        uploadError.value = 'File harus berupa gambar'
        return
    }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
        uploadError.value = 'Ukuran gambar melebihi batas 5MB'
        return
    }

    isUploading.value = true

    try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await $fetch<{ success: boolean; data: { id: number; path: string } }>('/api/upload/image', {
            method: 'POST',
            body: formData,
        })

        editor.value?.chain().focus().setImage({
            src: res.data.path,
            alt: file.name,
            // @ts-expect-error — id bukan bagian dari tipe bawaan setImage, tapi valid karena kita extend attribute-nya
            id: res.data.id,
        }).run()
    } catch (err: any) {
        uploadError.value = err?.data?.data?.message ?? err?.data?.message ?? 'Gagal mengunggah gambar'
    } finally {
        isUploading.value = false
    }
}

onBeforeUnmount(() => {
    editor.value?.destroy()
})
</script>

<template>
    <div>
        <div class="border rounded overflow-hidden transition-colors"
            :class="disabled ? 'border-outline-variant opacity-50' : 'border-outline-variant focus-within:border-secondary'">
            <div v-if="editor"
                class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant bg-surface-container-low">
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('bold') && 'toolbar-btn-active'" @click="toggleBold">
                    <Icon name="lucide:bold" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('italic') && 'toolbar-btn-active'" @click="toggleItalic">
                    <Icon name="lucide:italic" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('strike') && 'toolbar-btn-active'" @click="toggleStrike">
                    <Icon name="lucide:strikethrough" size="16" />
                </button>

                <div class="w-px h-5 bg-outline-variant mx-1"></div>

                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('heading', { level: 1 }) && 'toolbar-btn-active'" @click="toggleHeading(1)">
                    <Icon name="lucide:heading-1" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('heading', { level: 2 }) && 'toolbar-btn-active'" @click="toggleHeading(2)">
                    <Icon name="lucide:heading-2" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('heading', { level: 3 }) && 'toolbar-btn-active'" @click="toggleHeading(3)">
                    <Icon name="lucide:heading-3" size="16" />
                </button>

                <div class="w-px h-5 bg-outline-variant mx-1"></div>

                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('bulletList') && 'toolbar-btn-active'" @click="toggleBulletList">
                    <Icon name="lucide:list" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('orderedList') && 'toolbar-btn-active'" @click="toggleOrderedList">
                    <Icon name="lucide:list-ordered" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('blockquote') && 'toolbar-btn-active'" @click="toggleBlockquote">
                    <Icon name="lucide:quote" size="16" />
                </button>

                <div class="w-px h-5 bg-outline-variant mx-1"></div>

                <button type="button" :disabled="disabled" class="toolbar-btn"
                    :class="isActive('link') && 'toolbar-btn-active'" @click="setLink">
                    <Icon name="lucide:link" size="16" />
                </button>

                <button type="button" :disabled="disabled || isUploading" class="toolbar-btn"
                    @click="triggerFilePicker">
                    <Icon v-if="isUploading" name="lucide:loader-2" size="16" class="animate-spin" />
                    <Icon v-else name="lucide:image-plus" size="16" />
                </button>

                <div class="w-px h-5 bg-outline-variant mx-1"></div>

                <button type="button" :disabled="disabled" class="toolbar-btn" @click="undo">
                    <Icon name="lucide:undo-2" size="16" />
                </button>
                <button type="button" :disabled="disabled" class="toolbar-btn" @click="redo">
                    <Icon name="lucide:redo-2" size="16" />
                </button>
            </div>

            <EditorContent :editor="editor" />
        </div>

        <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden"
            @change="handleFileChange" />

        <p v-if="uploadError" class="text-label-md text-error mt-1 flex items-center gap-1">
            <Icon name="lucide:alert-circle" size="14" />
            {{ uploadError }}
        </p>
    </div>
</template>

<style scoped>
.toolbar-btn {
    @apply p-1.5 rounded text-on-surface-variant hover:bg-outline-variant/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.toolbar-btn-active {
    @apply bg-secondary-container/40 text-secondary;
}
</style>