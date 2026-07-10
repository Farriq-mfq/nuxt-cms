import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { news } from "~~/server/db/schema/news";
import { z } from "zod";

const paramSlugSchema = z.object({
  slug: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const result = await db.query.news.findFirst({
    where: and(
      eq(news.slug, parsedParams.data.slug),
      eq(news.isPublished, true),
    ),
    with: {
      category: true,
      thumbnail: true,
      author: { columns: { password: false } },
    },
  });

  if (!result) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const related = result.categoryId
    ? await db.query.news.findMany({
        where: and(
          eq(news.isPublished, true),
          eq(news.categoryId, result.categoryId),
          ne(news.id, result.id),
        ),
        orderBy: desc(news.publishedAt),
        limit: 3,
        with: { thumbnail: true, category: true },
      })
    : [];

  return successResponse(
    { ...result, related },
    "Detail berita berhasil diambil",
  );
});
