import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { files } from "~~/server/db/schema/files";
import { db } from "~~/server/db";
import { z } from "zod";

const paramFileIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramFileIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "File tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(files)
    .where(eq(files.id, id))
    .limit(1);
  const file = existing[0];

  if (!file) {
    return errorResponse(404, "File tidak ditemukan");
  }

  try {
    await unlink(join(process.cwd(), "public", file.path));
  } catch {
    // diamkan kalau file sudah tidak ada
  }

  await db.delete(files).where(eq(files.id, id));

  return successResponse({ id }, "File berhasil dihapus");
});
