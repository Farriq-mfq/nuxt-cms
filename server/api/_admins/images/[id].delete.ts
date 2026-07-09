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
  const parsedParams = paramImageIdSchema.safeParse(getRouterParams(event));

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
    await unlink(join(process.cwd(), "public", image.path));
  } catch {
    // diamkan kalau file sudah tidak ada
  }

  await db.delete(images).where(eq(images.id, id));

  return successResponse({ id }, "Gambar berhasil dihapus");
});
