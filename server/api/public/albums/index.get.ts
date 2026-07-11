import { eq, like, desc, sql, and } from "drizzle-orm";
import { db } from "~~/server/db";
import { albums, galleries } from "~~/server/db/schema/album-gallery";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;
  const offset = (page - 1) * limit;

  const where = and(
    eq(albums.isActive, true),
    search ? like(albums.title, `%${search}%`) : undefined,
  );

  const items = await db.query.albums.findMany({
    where,
    orderBy: desc(albums.createdAt),
    limit,
    offset,
    with: { coverImage: true },
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

  const totalResult = await db.query.albums.findMany({ where });
  const total = totalResult.length;

  return successResponse(
    withCount,
    "Daftar album berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
