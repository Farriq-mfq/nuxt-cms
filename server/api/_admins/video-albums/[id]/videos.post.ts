import { eq, max } from "drizzle-orm";
import { videos, videoAlbums } from "~~/server/db/schema/video-albums";
import { db } from "~~/server/db";
import { createVideoSchema } from "~~/server/validators/video-album";
import { extractYoutubeId } from "~~/server/utils/youtube";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Album video tidak ditemukan");

  const { id: albumId } = parsedParams.data;

  const existingAlbum = await db
    .select({ id: videoAlbums.id })
    .from(videoAlbums)
    .where(eq(videoAlbums.id, albumId))
    .limit(1);
  if (!existingAlbum[0])
    return errorResponse(404, "Album video tidak ditemukan");

  const body = await readBody(event);
  const parsed = createVideoSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, url } = parsed.data;

  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "url",
        message: "URL YouTube tidak valid, pastikan format URL benar",
      },
    ]);
  }

  const [maxOrderResult] = await db
    .select({ maxOrder: max(videos.order) })
    .from(videos)
    .where(eq(videos.albumId, albumId));
  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  const [result] = await db.insert(videos).values({
    albumId,
    title,
    provider: "youtube",
    videoId,
    order: nextOrder,
  });

  return successResponse(
    { id: result.insertId, videoId },
    "Video berhasil ditambahkan",
  );
});
