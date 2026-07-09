import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { news } from "~~/server/db/schema/news";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramNewsIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramNewsIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db.select().from(news).where(eq(news.id, id)).limit(1);
  const existingNews = existing[0];

  if (!existingNews) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  await db.delete(news).where(eq(news.id, id));

  if (existingNews.thumbnailId) {
    const thumbnailImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingNews.thumbnailId))
      .limit(1);

    if (thumbnailImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", thumbnailImage[0].path));
      } catch {
        // diamkan
      }
      await db.delete(images).where(eq(images.id, existingNews.thumbnailId));
    }
  }

  return successResponse({ id }, "Berita berhasil dihapus");
});
