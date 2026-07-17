import { eq, and } from "drizzle-orm";
import { db } from "~~/server/db";
import { z } from "zod";
import { announcements } from "~~/server/db/schema";

const paramSlugSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Agenda tidak ditemukan");

  const result = await db.query.announcements.findFirst({
    where: and(
      eq(announcements.slug, parsedParams.data.slug),
      eq(announcements.isPublished, true),
    ),
    with: { thumbnail: true },
  });

  if (!result) return errorResponse(404, "Pengumuman tidak ditemukan");
  return successResponse(result, "Detail Pengumuman berhasil diambil");
});
