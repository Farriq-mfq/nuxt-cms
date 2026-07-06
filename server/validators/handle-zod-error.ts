import { z } from "zod";

export function handleZodError(error: z.ZodError) {
  const formatted = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  throw createError({
    statusCode: 422,
    statusMessage: "Validasi gagal",
    data: formatted,
  });
}
