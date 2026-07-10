import { eq, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { relatedLinks } from "~~/server/db/schema/related-links";

export default defineEventHandler(async () => {
  const items = await db
    .select()
    .from(relatedLinks)
    .where(eq(relatedLinks.isActive, true))
    .orderBy(asc(relatedLinks.order));

  return successResponse(items, "Related links berhasil diambil");
});
