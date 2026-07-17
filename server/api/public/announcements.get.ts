import { and, eq, like, desc } from "drizzle-orm";
import { db } from "~~/server/db";
import { announcements } from "~~/server/db/schema/announcements";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().trim().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search } = parsed.data;
  const offset = (page - 1) * limit;

  const where = and(
    eq(announcements.isPublished, true),
    search ? like(announcements.title, `%${search}%`) : undefined,
  );

  const items = await db.query.announcements.findMany({
    where,
    orderBy: desc(announcements.publishedAt),
    limit,
    offset,
    with: { thumbnail: true },
  });

  const totalResult = await db.query.announcements.findMany({ where });

  return successResponse(
    items,
    "Daftar pengumuman berhasil diambil",
    buildPaginationMeta(page, limit, totalResult.length),
  );
});
