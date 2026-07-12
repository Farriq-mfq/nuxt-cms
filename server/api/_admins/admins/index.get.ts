import { notEqual } from "assert";
import { like, desc, and, ne } from "drizzle-orm";
import { db } from "~~/server/db";
import { _admins } from "~~/server/db/schema/auth";
import { paginationQuerySchema } from "~~/server/validators/pagination";

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;

  const where = search
    ? and(like(_admins.name, `%${search}%`), ne(_admins.role, "superadmin"))
    : ne(_admins.role, "superadmin");

  const { items, total } = await getPaginatedResult({
    queryable: db.query._admins,
    table: _admins,
    where,
    orderBy: desc(_admins.createdAt),
    page,
    limit,
  });

  const sanitized = items.map(({ password, ...rest }) => rest);

  return successResponse(
    sanitized,
    "Daftar admin berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
