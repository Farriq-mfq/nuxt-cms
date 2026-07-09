// server/api/_admins/images/[id].patch.ts
import { eq } from "drizzle-orm";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateImageSchema } from "~~/server/validators/image";
import { z } from "zod";

const paramImageIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramImageIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Gambar tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select({ id: images.id })
    .from(images)
    .where(eq(images.id, id))
    .limit(1);

  if (!existing[0]) {
    return errorResponse(404, "Gambar tidak ditemukan");
  }

  const body = await readBody(event);
  const parsed = updateImageSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  await db.update(images).set(parsed.data).where(eq(images.id, id));

  return successResponse({ id }, "Gambar berhasil diperbarui");
});
