import { and, eq, or, like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { news, newsCategories } from "~~/server/db/schema/news";
import { z } from "zod";

const publicNewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(6),
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = publicNewsQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, categorySlug } = parsed.data;
  const offset = (page - 1) * limit;

  let categoryId: number | undefined;
  if (categorySlug) {
    const category = await db
      .select({ id: newsCategories.id })
      .from(newsCategories)
      .where(eq(newsCategories.slug, categorySlug))
      .limit(1);
    categoryId = category[0]?.id;
  }

  const searchCondition = search
    ? or(like(news.title, `%${search}%`), like(news.excerpt, `%${search}%`))
    : undefined;

  const where = and(
    eq(news.isPublished, true),
    searchCondition,
    categoryId !== undefined ? eq(news.categoryId, categoryId) : undefined,
  );

  const items = await db.query.news.findMany({
    where,
    orderBy: desc(news.publishedAt),
    limit,
    offset,
    with: { category: true, thumbnail: true },
  });

  const totalResult = await db.query.news.findMany({ where });
  const total = totalResult.length;

  return successResponse(
    items,
    "Daftar berita berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
