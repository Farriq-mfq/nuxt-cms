import { and, eq, gte, desc, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { agenda } from "~~/server/db/schema/agenda";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
  upcoming: z.coerce.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { limit, upcoming } = parsed.data;
  const now = new Date();

  const where = and(
    eq(agenda.isPublished, true),
    upcoming ? gte(agenda.startDate, now) : undefined,
  );

  const items = await db.query.agenda.findMany({
    where,
    orderBy: upcoming ? asc(agenda.startDate) : desc(agenda.startDate),
    limit,
    with: { thumbnail: true },
  });

  return successResponse(items, "Daftar agenda berhasil diambil");
});
