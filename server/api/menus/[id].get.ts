import { and, asc, desc, eq, isNull, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema";
import { paramMenuIdSchema } from "~~/server/validators/menu";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  name: menus.title,
  createdAt: menus.createdAt,
  order: menus.order,
} as const;

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramMenuIdSchema.safeParse(params);
  if (!parsedParams.success) {
    return errorResponse(404, "Menu tidak ditemukan");
  }
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ??
    menus.createdAt;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const parentId = Number(params.id);

  const where = search
    ? and(like(menus.title, `%${search}%`), eq(menus.parentId, parentId))
    : eq(menus.parentId, parentId);

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
