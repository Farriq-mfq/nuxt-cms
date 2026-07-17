import { eq, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const items = await db.query.videoAlbums.findMany({
    where: eq(videoAlbums.isActive, true),
    orderBy: desc(videoAlbums.createdAt),
    limit: parsed.data.limit,
    with: { coverImage: true },
  });

  return successResponse(items, "Daftar album video berhasil diambil");
});
