import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { postCategories } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const paramId = Number(getRouterParam(event, "id"));

  if (!paramId || Number.isNaN(paramId)) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "ID kategori tidak valid" },
    ]);
  }

  const existingCategory = await db
    .select({ id: postCategories.id })
    .from(postCategories)
    .where(eq(postCategories.id, paramId))
    .limit(1);

  if (!existingCategory[0]) {
    return errorResponse(404, "Kategori tidak ditemukan");
  }

  await db.delete(postCategories).where(eq(postCategories.id, paramId));

  return successResponse({ id: paramId }, "Kategori berhasil dihapus");
});
