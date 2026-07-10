import { eq, desc, sql } from "drizzle-orm";
import { db } from "~~/server/db";
import { albums, galleries } from "~~/server/db/schema/album-gallery";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(5),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const items = await db.query.albums.findMany({
    where: eq(albums.isActive, true),
    orderBy: desc(albums.createdAt),
    limit: parsed.data.limit,
    with: {
      coverImage: true,
    },
  });

  const withCount = await Promise.all(
    items.map(async (album) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(galleries)
        .where(eq(galleries.albumId, album.id));

      return { ...album, photoCount: Number(countResult?.count ?? 0) };
    }),
  );

  return successResponse(withCount, "Album berhasil diambil");
});
