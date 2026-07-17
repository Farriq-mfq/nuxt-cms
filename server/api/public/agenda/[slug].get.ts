import { eq, and } from "drizzle-orm";
import { db } from "~~/server/db";
import { agenda } from "~~/server/db/schema/agenda";
import { z } from "zod";

const paramSlugSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const parsedParams = paramSlugSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success)
    return errorResponse(404, "Agenda tidak ditemukan");

  const result = await db.query.agenda.findFirst({
    where: and(
      eq(agenda.slug, parsedParams.data.slug),
      eq(agenda.isPublished, true),
    ),
    with: { thumbnail: true },
  });

  if (!result) return errorResponse(404, "Agenda tidak ditemukan");
  return successResponse(result, "Detail agenda berhasil diambil");
});
