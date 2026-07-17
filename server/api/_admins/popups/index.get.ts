import { like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { popups } from "~~/server/db/schema/popups";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;
  const where = search ? like(popups.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.popups,
    table: popups,
    where,
    orderBy: desc(popups.createdAt),
    with: { image: true },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar popup berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
