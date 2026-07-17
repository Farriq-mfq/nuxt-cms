import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { announcements } from "~~/server/db/schema/announcements";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  const announcement = existing[0];

  if (!announcement) {
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  await db.delete(announcements).where(eq(announcements.id, id));

  if (announcement.thumbnailId) {
    const thumbnailImage = await db
      .select()
      .from(images)
      .where(eq(images.id, announcement.thumbnailId))
      .limit(1);
    if (thumbnailImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", thumbnailImage[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, announcement.thumbnailId));
    }
  }

  return successResponse({ id }, "Pengumuman berhasil dihapus");
});
