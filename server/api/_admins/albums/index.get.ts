import { like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { albums } from "~~/server/db/schema/album-gallery";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;

  const where = search ? like(albums.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.albums,
    table: albums,
    where,
    orderBy: desc(albums.createdAt),
    with: {
      coverImage: true,
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar album berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
