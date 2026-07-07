export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends Required<ConfirmOptions> {
  isOpen: boolean;
}

const state = reactive<ConfirmState>({
  isOpen: false,
  title: "Konfirmasi",
  message: "Apakah kamu yakin?",
  confirmLabel: "Ya, Lanjutkan",
  cancelLabel: "Batal",
  danger: false,
});

let resolvePromise: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function open(options: ConfirmOptions = {}): Promise<boolean> {
    state.title = options.title ?? "Konfirmasi";
    state.message = options.message ?? "Apakah kamu yakin?";
    state.confirmLabel = options.confirmLabel ?? "Ya, Lanjutkan";
    state.cancelLabel = options.cancelLabel ?? "Batal";
    state.danger = options.danger ?? false;
    state.isOpen = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function confirm() {
    state.isOpen = false;
    resolvePromise?.(true);
    resolvePromise = null;
  }

  function cancel() {
    state.isOpen = false;
    resolvePromise?.(false);
    resolvePromise = null;
  }

  return { state, open, confirm, cancel };
}
