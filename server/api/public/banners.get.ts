import { and, eq, or, isNull, lte, gte, asc } from "drizzle-orm";
import { db } from "~~/server/db";
import { banners } from "~~/server/db/schema/banners";

export default defineEventHandler(async () => {
  const now = new Date();

  const rows = await db.query.banners.findMany({
    where: and(
      eq(banners.isActive, true),
      or(isNull(banners.startDate), lte(banners.startDate, now)),
      or(isNull(banners.endDate), gte(banners.endDate, now)),
    ),
    orderBy: asc(banners.order),
    with: {
      image: true,
    },
  });

  return successResponse(rows, "Banner berhasil diambil");
});
