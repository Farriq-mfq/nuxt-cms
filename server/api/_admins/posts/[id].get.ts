import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { posts } from "~~/server/db/schema/posts";
import { z } from "zod";

const paramPostIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramPostIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Post tidak ditemukan");
  }

  const result = await db.query.posts.findFirst({
    where: eq(posts.id, parsedParams.data.id),
    with: {
      category: true,
      thumbnail: true,
      author: { columns: { password: false } },
    },
  });

  if (!result) {
    return errorResponse(404, "Post tidak ditemukan");
  }

  return successResponse(result, "Detail post berhasil diambil");
});
