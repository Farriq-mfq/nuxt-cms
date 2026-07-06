import { or, like, desc, asc } from "drizzle-orm";
import { news } from "~~/server/db/schema/news";
import { db } from "~~/server/db";
import { paginationQuerySchema } from "~~/server/validators/pagination";

const SORTABLE_COLUMNS = {
  createdAt: news.createdAt,
  publishedAt: news.publishedAt,
  title: news.title,
} as const;

export default defineEventHandler(async (event) => {
  const parsed = paginationQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, sortBy, sortOrder } = parsed.data;
  const sortColumn =
    SORTABLE_COLUMNS[sortBy as keyof typeof SORTABLE_COLUMNS] ?? news.createdAt;
  const orderFn = sortOrder === "asc" ? asc : desc;
  const where = search
    ? or(like(news.title, `%${search}%`), like(news.excerpt, `%${search}%`))
    : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.news,
    table: news,
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
    "news fetched successfully",
    buildPaginationMeta(page, limit, total),
  );
});
