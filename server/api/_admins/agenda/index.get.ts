import { like, asc, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { agenda } from "~~/server/db/schema/agenda";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortOrder } = parsed.data;
  const where = search ? like(agenda.title, `%${search}%`) : undefined;
  const orderFn = sortOrder === "asc" ? asc : desc;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.agenda,
    table: agenda,
    where,
    orderBy: orderFn(agenda.startDate),
    with: { thumbnail: true },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar agenda berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
