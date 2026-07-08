import { asc, desc, like, or } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;

  const where = search ? or(like(menus.title, `%${search}%`)) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.menus,
    with: {
      parent: true,
      children: true,
    },
    table: menus,
    where,
    orderBy: asc(menus.title),
    page,
    limit,
  });

  return successResponse(
    items,
    "List of menus",
    buildPaginationMeta(page, limit, total),
  );
});
