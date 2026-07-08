import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { newsCategories } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const paramId = Number(getRouterParam(event, "id"));

  if (!paramId || Number.isNaN(paramId)) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "ID kategori tidak valid" },
    ]);
  }

  const existingCategory = await db
    .select({ id: newsCategories.id })
    .from(newsCategories)
    .where(eq(newsCategories.id, paramId))
    .limit(1);

  if (!existingCategory[0]) {
    return errorResponse(404, "Kategori tidak ditemukan");
  }

  await db.delete(newsCategories).where(eq(newsCategories.id, paramId));

  return successResponse({ id: paramId }, "Kategori berhasil dihapus");
});
