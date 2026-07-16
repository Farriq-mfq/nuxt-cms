import { or, like, asc, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { announcements } from "~~/server/db/schema/announcements";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  createdAt: announcements.createdAt,
  publishedAt: announcements.publishedAt,
  title: announcements.title,
} as const;

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;

  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ??
    announcements.createdAt;
  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search ? like(announcements.title, `%${search}%`) : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.announcements,
    table: announcements,
    where,
    orderBy: orderFn(sortColumn),
    with: {
      thumbnail: true,
      author: { columns: { password: false } },
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar pengumuman berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
