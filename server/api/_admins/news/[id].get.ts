import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { news } from "~~/server/db/schema/news";
import { z } from "zod";

const paramNewsIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramNewsIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const result = await db.query.news.findFirst({
    where: eq(news.id, parsedParams.data.id),
    with: {
      category: true,
      thumbnail: true,
      author: { columns: { password: false } },
    },
  });

  if (!result) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  return successResponse(result, "Detail berita berhasil diambil");
});
