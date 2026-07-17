import { eq, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Album video tidak ditemukan");

  const result = await db.query.videoAlbums.findFirst({
    where: eq(videoAlbums.id, parsedParams.data.id),
    with: {
      coverImage: true,
      videos: { orderBy: (videos, { asc }) => [asc(videos.order)] },
    },
  });

  if (!result) return errorResponse(404, "Album video tidak ditemukan");
  return successResponse(result, "Detail album video berhasil diambil");
});
