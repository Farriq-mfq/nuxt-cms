import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { videoAlbums } from "~~/server/db/schema/video-albums";

const paramSlugSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Album video tidak ditemukan");

  const result = await db.query.videoAlbums.findFirst({
    where: and(
      eq(videoAlbums.slug, parsedParams.data.slug),
      eq(videoAlbums.isActive, true),
    ),
    with: {
      coverImage: true,
      videos: { orderBy: (videos, { asc }) => [asc(videos.order)] },
    },
  });

  if (!result) return errorResponse(404, "Album video tidak ditemukan");
  return successResponse(result, "Detail album video berhasil diambil");
});
