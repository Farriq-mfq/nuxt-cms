import { eq } from "drizzle-orm";
import { relatedLinks } from "~~/server/db/schema/related-links";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Related link tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select({ id: relatedLinks.id })
    .from(relatedLinks)
    .where(eq(relatedLinks.id, id))
    .limit(1);

  if (!existing[0]) {
    return errorResponse(404, "Related link tidak ditemukan");
  }

  await db.delete(relatedLinks).where(eq(relatedLinks.id, id));

  return successResponse({ id }, "Related link berhasil dihapus");
});
