import { eq } from "drizzle-orm";
import { videos } from "~~/server/db/schema/video-albums";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success) return errorResponse(404, "Video tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) return errorResponse(404, "Video tidak ditemukan");

  await db.delete(videos).where(eq(videos.id, id));
  return successResponse({ id }, "Video berhasil dihapus");
});
