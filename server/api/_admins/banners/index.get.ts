import { like, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { banners } from "~~/server/db/schema/banners";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;

  const where = search ? like(banners.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.banners,
    table: banners,
    where,
    orderBy: asc(banners.order),
    with: {
      image: true,
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar banner berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
