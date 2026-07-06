import type { ApiSuccessResponse } from "./types";

export function successResponse<T, M extends object = Record<string, unknown>>(
  data: T,
  message = "Berhasil",
  meta?: M,
) {
  return {
    success: true as const,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}
