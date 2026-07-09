import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { albums, galleries } from "~~/server/db/schema/album-gallery";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramAlbumIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramAlbumIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(albums)
    .where(eq(albums.id, id))
    .limit(1);
  const album = existing[0];

  if (!album) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const galleryImages = await db.query.galleries.findMany({
    where: eq(galleries.albumId, id),
    with: { image: true },
  });

  await db.delete(albums).where(eq(albums.id, id));

  for (const g of galleryImages) {
    if (g.image) {
      try {
        await unlink(join(process.cwd(), "public", g.image.path));
      } catch {}
      await db.delete(images).where(eq(images.id, g.image.id));
    }
  }

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

  return successResponse({ id }, "Album berhasil dihapus");
});
