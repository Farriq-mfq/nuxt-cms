import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { albums } from "~~/server/db/schema/album-gallery";

const paramSlugSchema = z.object({
  slug: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const result = await db.query.albums.findFirst({
    where: and(
      eq(albums.slug, parsedParams.data.slug),
      eq(albums.isActive, true),
    ),
    with: {
      coverImage: true,
      galleries: {
        orderBy: (galleries, { asc }) => [asc(galleries.order)],
        with: { image: true },
      },
    },
  });

  if (!result) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  return successResponse(result, "Detail album berhasil diambil");
});
