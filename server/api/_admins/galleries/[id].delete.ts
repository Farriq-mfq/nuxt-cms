import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { galleries } from "~~/server/db/schema/album-gallery";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
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

  const existing = await db.query.galleries.findFirst({
    where: eq(galleries.id, id),
    with: { image: true },
  });

  if (!existing) {
    return errorResponse(404, "Item galeri tidak ditemukan");
  }

  await db.delete(galleries).where(eq(galleries.id, id));

  if (existing.image) {
    try {
      await unlink(join(process.cwd(), "public", existing.image.path));
    } catch {}
    await db.delete(images).where(eq(images.id, existing.image.id));
  }

  return successResponse({ id }, "Gambar berhasil dihapus dari album");
});
