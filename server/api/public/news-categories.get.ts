import { asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { newsCategories } from "~~/server/db/schema/news";

export default defineEventHandler(async () => {
  const items = await db
    .select()
    .from(newsCategories)
    .orderBy(asc(newsCategories.name));
  return successResponse(items, "Kategori berhasil diambil");
});
