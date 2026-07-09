import { eq } from "drizzle-orm";
import { galleries } from "~~/server/db/schema/album-gallery";
import { db } from "~~/server/db";
import { updateGallerySchema } from "~~/server/validators/album";
import { z } from "zod";

const paramGalleryIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramGalleryIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Item galeri tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select({ id: galleries.id })
    .from(galleries)
    .where(eq(galleries.id, id))
    .limit(1);

  if (!existing[0]) {
    return errorResponse(404, "Item galeri tidak ditemukan");
  }

  const body = await readBody(event);
  const parsed = updateGallerySchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  await db.update(galleries).set(parsed.data).where(eq(galleries.id, id));

  return successResponse({ id }, "Item galeri berhasil diperbarui");
});
