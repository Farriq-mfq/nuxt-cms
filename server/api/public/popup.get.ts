import { and, eq, or, isNull, lte, gte } from "drizzle-orm";
import { db } from "~~/server/db";
import { popups } from "~~/server/db/schema/popups";

export default defineEventHandler(async () => {
  const now = new Date();

  const result = await db.query.popups.findFirst({
    where: and(
      eq(popups.isActive, true),
      or(isNull(popups.startDate), lte(popups.startDate, now)),
      or(isNull(popups.endDate), gte(popups.endDate, now)),
    ),
    orderBy: (popups, { desc }) => [desc(popups.createdAt)],
    with: { image: true },
  });

  return successResponse(result ?? null, "Popup berhasil diambil");
});
