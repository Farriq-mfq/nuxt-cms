import { eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "~~/server/db";
import { postCategories } from "~~/server/db/schema";
import { updatePostsCategorySchema } from "~~/server/validators/posts-category";

export default defineEventHandler(async (event) => {
  const paramId = Number(getRouterParam(event, "id"));

  if (!paramId || Number.isNaN(paramId)) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "ID kategori tidak valid" },
    ]);
  }

  const body = await readBody(event);
  const parsed = updatePostsCategorySchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { name } = parsed.data;

  const existingCategory = await db
    .select({ id: postCategories.id })
    .from(postCategories)
    .where(eq(postCategories.id, paramId))
    .limit(1);

  if (!existingCategory[0]) {
    return errorResponse(404, "Kategori tidak ditemukan");
  }

  let slug: string | undefined;

  if (name !== undefined) {
    slug = slugify(name);

    const existingSlug = await db
      .select({ id: postCategories.id })
      .from(postCategories)
      .where(eq(postCategories.slug, slug))
      .limit(1);

    if (existingSlug[0] && existingSlug[0].id !== paramId) {
      return errorResponse(422, "Validasi gagal", [
        { field: "name", message: "Kategori sudah ada" },
      ]);
    }
  }

  await db
    .update(postCategories)
    .set({
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
    })
    .where(eq(postCategories.id, paramId));

  return successResponse({ id: paramId }, "Kategori berhasil diperbarui");
});
