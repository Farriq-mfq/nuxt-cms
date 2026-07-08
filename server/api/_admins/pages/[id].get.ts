import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { pages } from "~~/server/db/schema";
import { paramPageIdSchema } from "~~/server/validators/page";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramPageIdSchema.safeParse(params);
  if (!parsedParams.success) {
    return errorResponse(404, "Page tidak ditemukan");
  }
  const { id } = parsedParams.data;
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!page[0]) return errorResponse(404, "Page tidak ditemukan");
  return successResponse(page[0], "Page berhasil ditemukan");
});
