import { z } from "zod";

interface ErrorDetail {
  field: string;
  message: string;
}

export function errorResponse(
  statusCode: number,
  message: string,
  errors?: ErrorDetail[],
) {
  throw createError({
    statusCode,
    statusMessage: message,
    data: {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
  });
}

export function zodErrorResponse(error: z.ZodError) {
  const errors: ErrorDetail[] = error.issues.map((err) => ({
    field: err.path.join(".") || "unknown",
    message: err.message,
  }));

  errorResponse(422, "Validasi gagal", errors);
}
