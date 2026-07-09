import { like, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { relatedLinks } from "~~/server/db/schema/related-links";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;

  const where = search ? like(relatedLinks.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.relatedLinks,
    table: relatedLinks,
    where,
    orderBy: asc(relatedLinks.order),
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar related link berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
