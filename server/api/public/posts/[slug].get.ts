import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { posts } from "~~/server/db/schema/posts";

const paramSchema = z.object({
  slug: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success) return errorResponse(404, "Post tidak ditemukan");

  const result = await db.query.posts.findFirst({
    where: and(
      eq(posts.slug, parsedParams.data.slug),
      eq(posts.isPublished, true),
    ),
    with: {
      category: true,
      thumbnail: true,
      author: { columns: { password: false } },
    },
  });

  if (!result) return errorResponse(404, "Post tidak ditemukan");

  const related = await db.query.posts.findMany({
    where: and(eq(posts.isPublished, true), ne(posts.id, result.id)),
    orderBy: desc(posts.publishedAt),
    limit: 3,
    with: { thumbnail: true, category: true },
  });

  return successResponse(
    { ...result, related },
    "Detail post berhasil diambil",
  );
});
