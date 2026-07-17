import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Album video tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(videoAlbums)
    .where(eq(videoAlbums.id, id))
    .limit(1);
  const album = existing[0];
  if (!album) return errorResponse(404, "Album video tidak ditemukan");

  // videos ikut terhapus otomatis via ON DELETE CASCADE
  await db.delete(videoAlbums).where(eq(videoAlbums.id, id));

  if (album.coverImageId) {
    const cover = await db
      .select()
      .from(images)
      .where(eq(images.id, album.coverImageId))
      .limit(1);
    if (cover[0]) {
      try {
        await unlink(join(process.cwd(), "public", cover[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, album.coverImageId));
    }
  }

  return successResponse({ id }, "Album video berhasil dihapus");
});
