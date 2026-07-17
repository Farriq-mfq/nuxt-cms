import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { popups } from "~~/server/db/schema/popups";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success) return errorResponse(404, "Popup tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(popups)
    .where(eq(popups.id, id))
    .limit(1);
  const popup = existing[0];
  if (!popup) return errorResponse(404, "Popup tidak ditemukan");

  await db.delete(popups).where(eq(popups.id, id));

  if (popup.imageId) {
    const image = await db
      .select()
      .from(images)
      .where(eq(images.id, popup.imageId))
      .limit(1);
    if (image[0]) {
      try {
        await unlink(join(process.cwd(), "public", image[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, popup.imageId));
    }
  }

  return successResponse({ id }, "Popup berhasil dihapus");
});
