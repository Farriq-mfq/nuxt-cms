import { eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "~~/server/db";
import { newsCategories } from "~~/server/db/schema";
import { updateNewsCategorySchema } from "~~/server/validators/news-category";

export default defineEventHandler(async (event) => {
  const paramId = Number(getRouterParam(event, "id"));

  if (!paramId || Number.isNaN(paramId)) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "ID kategori tidak valid" },
    ]);
  }

  const body = await readBody(event);
  const parsed = updateNewsCategorySchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { name } = parsed.data;

  const existingCategory = await db
    .select({ id: newsCategories.id })
    .from(newsCategories)
    .where(eq(newsCategories.id, paramId))
    .limit(1);

  if (!existingCategory[0]) {
    return errorResponse(404, "Kategori tidak ditemukan");
  }

  let slug: string | undefined;

  if (name !== undefined) {
    slug = slugify(name);

    const existingSlug = await db
      .select({ id: newsCategories.id })
      .from(newsCategories)
      .where(eq(newsCategories.slug, slug))
      .limit(1);

    if (existingSlug[0] && existingSlug[0].id !== paramId) {
      return errorResponse(422, "Validasi gagal", [
        { field: "name", message: "Kategori sudah ada" },
      ]);
    }
  }

  await db
    .update(newsCategories)
    .set({
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
    })
    .where(eq(newsCategories.id, paramId));

  return successResponse({ id: paramId }, "Kategori berhasil diperbarui");
});
