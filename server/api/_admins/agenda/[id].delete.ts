import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { agenda } from "~~/server/db/schema/agenda";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Agenda tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(agenda)
    .where(eq(agenda.id, id))
    .limit(1);
  const item = existing[0];
  if (!item) return errorResponse(404, "Agenda tidak ditemukan");

  await db.delete(agenda).where(eq(agenda.id, id));

  if (item.thumbnailId) {
    const thumb = await db
      .select()
      .from(images)
      .where(eq(images.id, item.thumbnailId))
      .limit(1);
    if (thumb[0]) {
      try {
        await unlink(join(process.cwd(), "public", thumb[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, item.thumbnailId));
    }
  }

  return successResponse({ id }, "Agenda berhasil dihapus");
});
