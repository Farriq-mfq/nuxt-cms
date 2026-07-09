import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { banners } from "~~/server/db/schema/banners";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Banner tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);
  const banner = existing[0];

  if (!banner) {
    return errorResponse(404, "Banner tidak ditemukan");
  }

  await db.delete(banners).where(eq(banners.id, id));

  const image = await db
    .select()
    .from(images)
    .where(eq(images.id, banner.imageId))
    .limit(1);
  if (image[0]) {
    try {
      await unlink(join(process.cwd(), "public", image[0].path));
    } catch {}
    await db.delete(images).where(eq(images.id, banner.imageId));
  }

  return successResponse({ id }, "Banner berhasil dihapus");
});
