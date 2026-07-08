import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { db } from "~~/server/db";
import { pages } from "~~/server/db/schema/pages";
import { paramPageIdSchema } from "~~/server/validators/page";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramPageIdSchema.safeParse(params);

  if (!parsedParams.success) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  const existingPage = existing[0];

  if (!existingPage) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  if (existingPage.metaImage) {
    try {
      await unlink(join(process.cwd(), "public", existingPage.metaImage));
    } catch {}
  }

  await db.delete(pages).where(eq(pages.id, id));

  return successResponse({ id }, "Halaman berhasil dihapus");
});
