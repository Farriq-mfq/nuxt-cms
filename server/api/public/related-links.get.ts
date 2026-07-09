import { asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { relatedLinks } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  const links = await db
    .select()
    .from(relatedLinks)
    .orderBy(asc(relatedLinks.order));
  return successResponse(links, "Related link berhasil diambil");
});
