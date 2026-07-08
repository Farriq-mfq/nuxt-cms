import { eq } from "drizzle-orm";
import { setting } from "~~/server/db/schema/setting";
import { db } from "~~/server/db";

export default defineEventHandler(async () => {
  const result = await db
    .select()
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  return successResponse(result[0] ?? null, "Pengaturan berhasil diambil");
});
