import { or, like, asc, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { posts } from "~~/server/db/schema/posts";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  createdAt: posts.createdAt,
  publishedAt: posts.publishedAt,
  title: posts.title,
} as const;

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;
  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ??
    posts.createdAt;
  const orderFn = sortOrder === "asc" ? asc : desc;

  const where = search
    ? or(like(posts.title, `%${search}%`), like(posts.excerpt, `%${search}%`))
    : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.posts,
    table: posts,
    where,
    orderBy: orderFn(sortColumn),
    with: {
      category: true,
      thumbnail: true,
      author: { columns: { password: false } },
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar post berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
