<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CharacterCount } from '@tiptap/extension-character-count'
import { ResizableImage } from './Editor/resizable-image'
import { onClickOutside } from '@vueuse/core'


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
const isFullscreen = ref(false)
const showColorPicker = ref(false)

const colorPickerRef = ref<HTMLElement | null>(null)

onClickOutside(colorPickerRef, () => {
    showColorPicker.value = false
})

const TEXT_COLORS = [
    { label: 'Default', value: '' },
    { label: 'Merah', value: '#dc2626' },
    { label: 'Oranye', value: '#ea580c' },
    { label: 'Kuning', value: '#ca8a04' },
    { label: 'Hijau', value: '#16a34a' },
    { label: 'Biru', value: '#0061a5' },
    { label: 'Navy', value: '#002045' },
    { label: 'Ungu', value: '#9333ea' },
]

const editor = useEditor({
    content: modelValue.value,
    extensions: [
        StarterKit,
        Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-secondary underline' } }),
        ResizableImage.configure({ HTMLAttributes: { class: 'rounded max-w-full' } }),
        Placeholder.configure({ placeholder: props.placeholder }),
        Underline,
        Highlight.configure({ multicolor: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        TextStyle,
        Color,
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        CharacterCount,
    ],
    editable: !props.disabled,
    editorProps: {
        attributes: {
            class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-body-md text-on-surface',
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
function toggleUnderline() { editor.value?.chain().focus().toggleUnderline().run() }
function toggleStrike() { editor.value?.chain().focus().toggleStrike().run() }
function toggleHighlight() { editor.value?.chain().focus().toggleHighlight().run() }
function toggleHeading(level: 1 | 2 | 3) { editor.value?.chain().focus().toggleHeading({ level }).run() }
function toggleBulletList() { editor.value?.chain().focus().toggleBulletList().run() }
function toggleOrderedList() { editor.value?.chain().focus().toggleOrderedList().run() }
function toggleBlockquote() { editor.value?.chain().focus().toggleBlockquote().run() }
function toggleCodeBlock() { editor.value?.chain().focus().toggleCodeBlock().run() }
function setHorizontalRule() { editor.value?.chain().focus().setHorizontalRule().run() }
function setTextAlign(align: 'left' | 'center' | 'right' | 'justify') {
    editor.value?.chain().focus().setTextAlign(align).run()
}
function setColor(color: string) {
    if (!color) {
        editor.value?.chain().focus().unsetColor().run()
    } else {
        editor.value?.chain().focus().setColor(color).run()
    }
    showColorPicker.value = false
}
function setLink() {
    const url = window.prompt('Masukkan URL')
    if (url === null) return
    if (url === '') {
        editor.value?.chain().focus().unsetLink().run()
        return
    }
    editor.value?.chain().focus().setLink({ href: url }).run()
}
function insertTable() {
    editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
function undo() { editor.value?.chain().focus().undo().run() }
function redo() { editor.value?.chain().focus().redo().run() }

function isActive(name: string, attrs?: Record<string, any>) {
    return editor.value?.isActive(name, attrs) ?? false
}

const characterCount = computed(() => editor.value?.storage.characterCount.characters() ?? 0)
const wordCount = computed(() => editor.value?.storage.characterCount.words() ?? 0)

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
            // @ts-expect-error
            id: res.data.id,
        }).run()
    } catch (err: any) {
        uploadError.value = err?.data?.data?.message ?? err?.data?.message ?? 'Gagal mengunggah gambar'
    } finally {
        isUploading.value = false
    }
}

function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
}

function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isFullscreen.value) {
        isFullscreen.value = false
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
    editor.value?.destroy()
})
</script>

<template>
    <div>
        <Teleport to="body" :disabled="!isFullscreen">
            <div
                :class="isFullscreen ? 'fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-md' : ''">
                <div class="border rounded overflow-hidden transition-colors bg-surface flex flex-col" :class="[
                    disabled ? 'border-outline-variant opacity-50' : 'border-outline-variant focus-within:border-secondary',
                    isFullscreen ? 'w-full h-full max-w-5xl shadow-layer-2' : '',
                ]">
                    <div v-if="editor"
                        class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant bg-surface-container-low shrink-0">

                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('bold') && 'toolbar-btn-active'" @click="toggleBold">
                            <Icon name="lucide:bold" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('italic') && 'toolbar-btn-active'" @click="toggleItalic">
                            <Icon name="lucide:italic" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('underline') && 'toolbar-btn-active'" @click="toggleUnderline">
                            <Icon name="lucide:underline" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('strike') && 'toolbar-btn-active'" @click="toggleStrike">
                            <Icon name="lucide:strikethrough" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('highlight') && 'toolbar-btn-active'" @click="toggleHighlight">
                            <Icon name="lucide:highlighter" size="16" />
                        </button>

                        <div class="relative" ref="colorPickerRef">
                            <button type="button" :disabled="disabled" class="toolbar-btn"
                                @click="showColorPicker = !showColorPicker">
                                <Icon name="lucide:palette" size="16" />
                            </button>
                            <div v-if="showColorPicker"
                                class="absolute top-full left-0 mt-1 z-20 bg-surface border border-outline-variant rounded shadow-layer-2 p-2 flex gap-1 flex-wrap w-40">
                                <button v-for="c in TEXT_COLORS" :key="c.value" type="button"
                                    class="w-6 h-6 rounded-full border border-outline-variant"
                                    :style="{ backgroundColor: c.value || '#fff' }" :title="c.label"
                                    @click="setColor(c.value)">
                                    <Icon v-if="!c.value" name="lucide:slash" size="14"
                                        class="text-on-surface-variant m-auto" />
                                </button>
                            </div>
                        </div>

                        <div class="w-px h-5 bg-outline-variant mx-1"></div>

                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('heading', { level: 1 }) && 'toolbar-btn-active'"
                            @click="toggleHeading(1)">
                            <Icon name="lucide:heading-1" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('heading', { level: 2 }) && 'toolbar-btn-active'"
                            @click="toggleHeading(2)">
                            <Icon name="lucide:heading-2" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('heading', { level: 3 }) && 'toolbar-btn-active'"
                            @click="toggleHeading(3)">
                            <Icon name="lucide:heading-3" size="16" />
                        </button>

                        <div class="w-px h-5 bg-outline-variant mx-1"></div>

                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive({ textAlign: 'left' }) && 'toolbar-btn-active'"
                            @click="setTextAlign('left')">
                            <Icon name="lucide:align-left" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive({ textAlign: 'center' }) && 'toolbar-btn-active'"
                            @click="setTextAlign('center')">
                            <Icon name="lucide:align-center" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive({ textAlign: 'right' }) && 'toolbar-btn-active'"
                            @click="setTextAlign('right')">
                            <Icon name="lucide:align-right" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive({ textAlign: 'justify' }) && 'toolbar-btn-active'"
                            @click="setTextAlign('justify')">
                            <Icon name="lucide:align-justify" size="16" />
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
                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('codeBlock') && 'toolbar-btn-active'" @click="toggleCodeBlock">
                            <Icon name="lucide:code" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn" @click="setHorizontalRule">
                            <Icon name="lucide:minus" size="16" />
                        </button>

                        <div class="w-px h-5 bg-outline-variant mx-1"></div>

                        <button type="button" :disabled="disabled" class="toolbar-btn"
                            :class="isActive('link') && 'toolbar-btn-active'" @click="setLink">
                            <Icon name="lucide:link" size="16" />
                        </button>
                        <button type="button" :disabled="disabled" class="toolbar-btn" @click="insertTable">
                            <Icon name="lucide:table" size="16" />
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

                        <div class="flex-1"></div>

                        <button type="button" class="toolbar-btn" @click="toggleFullscreen"
                            :title="isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'">
                            <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" size="16" />
                        </button>
                    </div>

                    <div class="overflow-y-auto" :class="isFullscreen ? 'flex-1' : 'min-h-[200px]'">
                        <EditorContent :editor="editor" class="h-full" />
                    </div>

                    <div v-if="editor"
                        class="flex items-center justify-end gap-3 px-3 py-1.5 border-t border-outline-variant bg-surface-container-lowest shrink-0 text-label-md text-on-surface-variant">
                        <span>{{ wordCount }} kata</span>
                        <span>{{ characterCount }} karakter</span>
                    </div>
                </div>
            </div>
        </Teleport>

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