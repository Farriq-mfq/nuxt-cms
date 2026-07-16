import { and, eq, or, like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { posts, postCategories } from "~~/server/db/schema/posts";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(9),
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, categorySlug } = parsed.data;
  const offset = (page - 1) * limit;

  let categoryId: number | undefined;
  if (categorySlug) {
    const cat = await db
      .select({ id: postCategories.id })
      .from(postCategories)
      .where(eq(postCategories.slug, categorySlug))
      .limit(1);
    categoryId = cat[0]?.id;
  }

  const searchCondition = search
    ? or(like(posts.title, `%${search}%`), like(posts.excerpt, `%${search}%`))
    : undefined;
  const where = and(
    eq(posts.isPublished, true),
    searchCondition,
    categoryId !== undefined ? eq(posts.categoryId, categoryId) : undefined,
  );

  const items = await db.query.posts.findMany({
    where,
    orderBy: desc(posts.publishedAt),
    limit,
    offset,
    with: { category: true, thumbnail: true },
  });

  const totalResult = await db.query.posts.findMany({ where });
  return successResponse(
    items,
    "Daftar post berhasil diambil",
    buildPaginationMeta(page, limit, totalResult.length),
  );
});
