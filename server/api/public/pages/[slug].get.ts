import { eq, and } from "drizzle-orm";
import { db } from "~~/server/db";
import { pages } from "~~/server/db/schema/pages";
import { z } from "zod";

const paramSlugSchema = z.object({
  slug: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  const result = await db
    .select()
    .from(pages)
    .where(
      and(eq(pages.slug, parsedParams.data.slug), eq(pages.isPublished, true)),
    )
    .limit(1);

  if (!result[0]) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  return successResponse(result[0], "Halaman berhasil diambil");
});
