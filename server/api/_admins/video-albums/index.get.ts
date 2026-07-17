import { like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;
  const where = search ? like(videoAlbums.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.videoAlbums,
    table: videoAlbums,
    where,
    orderBy: desc(videoAlbums.createdAt),
    with: { coverImage: true },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar album video berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
