import { asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { postCategories } from "~~/server/db/schema/posts";

export default defineEventHandler(async () => {
  const items = await db
    .select()
    .from(postCategories)
    .orderBy(asc(postCategories.name));
  return successResponse(items, "Kategori berhasil diambil");
});
