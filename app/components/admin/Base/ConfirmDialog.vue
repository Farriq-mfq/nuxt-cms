<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

const { state, confirm, cancel } = useConfirm()
</script>

<template>
    <TransitionRoot appear :show="state.isOpen" as="template">
        <Dialog as="div" class="relative z-[60]" @close="cancel">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/40" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-md">
                    <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel class="w-full max-w-sm bg-white rounded shadow-layer-2 overflow-hidden">
                            <div class="px-md py-md">
                                <div class="flex items-start gap-3">
                                    <div class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                                        :class="state.danger ? 'bg-error-container text-on-error-container' : 'bg-secondary-container/40 text-on-secondary-container'">
                                        <Icon :name="state.danger ? 'lucide:trash-2' : 'lucide:help-circle'"
                                            size="20" />
                                    </div>

                                    <div class="flex-1 pt-1">
                                        <DialogTitle class="text-headline-md text-on-surface">
                                            {{ state.title }}
                                        </DialogTitle>
                                        <p class="text-body-md text-on-surface-variant mt-1">
                                            {{ state.message }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex items-center justify-end gap-2 px-md py-sm border-t border-outline-variant bg-surface-container-lowest">
                                <button type="button"
                                    class="px-4 py-2 rounded text-body-md border border-outline-variant hover:bg-surface-container-low transition-colors"
                                    @click="cancel">
                                    {{ state.cancelLabel }}
                                </button>
                                <button type="button" class="px-4 py-2 rounded text-body-md transition-colors" :class="state.danger
                                    ? 'bg-error text-on-error hover:brightness-90'
                                    : 'bg-secondary text-on-secondary hover:brightness-90'" @click="confirm">
                                    {{ state.confirmLabel }}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>