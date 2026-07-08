import { eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "~~/server/db";
import { newsCategories } from "~~/server/db/schema";
import { createNewsCategorySchema } from "~~/server/validators/news-category";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = createNewsCategorySchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { name } = parsed.data;

  const slug = slugify(name);
  const existingSlug = await db
    .select({ id: newsCategories.id })
    .from(newsCategories)
    .where(eq(newsCategories.slug, slug))
    .limit(1);

  if (existingSlug[0]) {
    return errorResponse(422, "Validasi gagal", [
      { field: "name", message: "Kategori sudah ada" },
    ]);
  }

  const [result] = await db.insert(newsCategories).values({
    name,
    slug,
  });

  return successResponse({ id: result.insertId }, "Kategori berhasil dibuat");
});
