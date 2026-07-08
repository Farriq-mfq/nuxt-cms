import { and, asc, desc, isNull, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  name: menus.title,
  createdAt: menus.createdAt,
  order: menus.order,
} as const;

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ??
    menus.createdAt;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search
    ? and(or(like(menus.title, `%${search}%`)), isNull(menus.parentId))
    : isNull(menus.parentId);

  const { items, total } = await getPaginatedResult({
    queryable: db.query.menus,
    with: {
      parent: true,
      children: true,
    },
    table: menus,
    where,
    orderBy: orderFn(sortColumn),
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar menu",
    buildPaginationMeta(page, limit, total),
  );
});
