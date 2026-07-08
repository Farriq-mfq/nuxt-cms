import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramImageIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramImageIdSchema.safeParse(params);

  if (!parsedParams.success) {
    return errorResponse(404, "Gambar tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(images)
    .where(eq(images.id, id))
    .limit(1);

  const image = existing[0];

  if (!image) {
    return errorResponse(404, "Gambar tidak ditemukan");
  }

  try {
    const filePath = join(process.cwd(), "public", image.path);
    await unlink(filePath);
  } catch {}

  if (image.path) {
    try {
      const thumbPath = join(process.cwd(), "public", image.path);
      await unlink(thumbPath);
    } catch {}
  }

  await db.delete(images).where(eq(images.id, id));

  return successResponse({ id }, "Gambar berhasil dihapus");
});
