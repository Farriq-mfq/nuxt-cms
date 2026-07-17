import { asc, desc, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { postCategories } from "~~/server/db/schema";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search
    ? or(like(postCategories.name, `%${search}%`))
    : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.postCategories,
    table: postCategories,
    where,
    orderBy: orderFn(postCategories.name),
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar Kategori Post",
    buildPaginationMeta(page, limit, total),
  );
});
