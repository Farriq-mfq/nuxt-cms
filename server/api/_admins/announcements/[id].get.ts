import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { announcements } from "~~/server/db/schema/announcements";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  const result = await db.query.announcements.findFirst({
    where: eq(announcements.id, parsedParams.data.id),
    with: {
      thumbnail: true,
      author: { columns: { password: false } },
    },
  });

  if (!result) {
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  return successResponse(result, "Detail pengumuman berhasil diambil");
});
