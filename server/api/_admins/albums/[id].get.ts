import { eq, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { albums } from "~~/server/db/schema/album-gallery";
import { z } from "zod";

const paramAlbumIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramAlbumIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const result = await db.query.albums.findFirst({
    where: eq(albums.id, parsedParams.data.id),
    with: {
      coverImage: true,
      galleries: {
        orderBy: (galleries, { asc }) => [asc(galleries.order)],
        with: {
          image: true,
        },
      },
    },
  });

  if (!result) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  return successResponse(result, "Detail album berhasil diambil");
});
