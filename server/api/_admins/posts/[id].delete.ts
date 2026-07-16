import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { posts } from "~~/server/db/schema/posts";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramPostIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramPostIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Post tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  const existingPost = existing[0];

  if (!existingPost) {
    return errorResponse(404, "Post tidak ditemukan");
  }

  await db.delete(posts).where(eq(posts.id, id));

  if (existingPost.thumbnailId) {
    const thumbnailImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingPost.thumbnailId))
      .limit(1);

    if (thumbnailImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", thumbnailImage[0].path));
      } catch {
        // diamkan
      }
      await db.delete(images).where(eq(images.id, existingPost.thumbnailId));
    }
  }

  return successResponse({ id }, "Post berhasil dihapus");
});
