import { and, asc, desc, isNull, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { pages } from "~~/server/db/schema";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  name: pages.title,
  createdAt: pages.createdAt,
} as const;

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ??
    pages.createdAt;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search ? and(or(like(pages.title, `%${search}%`))) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.pages,
    with: {},
    table: pages,
    where,
    orderBy: orderFn(sortColumn),
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar halaman",
    buildPaginationMeta(page, limit, total),
  );
});
