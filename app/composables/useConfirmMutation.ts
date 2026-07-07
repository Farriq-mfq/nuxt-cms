interface UseConfirmMutationOptions<T = any> {
  confirmFn: (payload: T) => Promise<any>;
  confirmHeader?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  danger?: boolean;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export function useConfirmMutation<T = any>(
  options: UseConfirmMutationOptions<T>,
) {
  const confirm = useConfirm();
  const toast = useToast();
  const isPending = ref(false);

  async function execute(payload: T) {
    const isConfirmed = await confirm.open({
      title: options.confirmHeader ?? "Konfirmasi",
      message: options.confirmMessage ?? "Apakah kamu yakin?",
      confirmLabel: options.confirmLabel ?? "Ya, Lanjutkan",
      cancelLabel: options.cancelLabel ?? "Batal",
      danger: options.danger ?? true,
    });

    if (!isConfirmed) return;

    isPending.value = true;

    try {
      await options.confirmFn(payload);

      toast.success({
        title: "Berhasil",
        message: options.successMessage ?? "Data berhasil diproses",
      });

      options.onSuccess?.();
    } catch (err: any) {
      const message =
        err?.data?.data?.message ??
        err?.data?.message ??
        options.errorMessage ??
        "Terjadi kesalahan";

      toast.error({
        title: "Gagal",
        message,
      });

      options.onError?.(err);
    } finally {
      isPending.value = false;
    }
  }

  return { execute, isPending };
}
