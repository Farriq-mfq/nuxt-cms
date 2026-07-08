import { asc, desc, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { newsCategories } from "~~/server/db/schema";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search
    ? or(like(newsCategories.name, `%${search}%`))
    : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.newsCategories,
    table: newsCategories,
    where,
    orderBy: orderFn(newsCategories.name),
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar Kategori Berita",
    buildPaginationMeta(page, limit, total),
  );
});
