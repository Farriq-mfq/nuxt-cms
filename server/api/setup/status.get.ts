import { eq } from "drizzle-orm";
import { setting } from "~~/server/db/schema/setting";
import { _admins } from "~~/server/db/schema/auth";
import { db } from "~~/server/db";

export default defineEventHandler(async () => {
  const existingSetting = await db
    .select({ id: setting.id })
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  const existingAdmin = await db
    .select({ id: _admins.id })
    .from(_admins)
    .limit(1);

  const isSettingComplete = !!existingSetting[0];
  const isAdminComplete = existingAdmin.length > 0;

  return successResponse(
    {
      isComplete: isSettingComplete && isAdminComplete,
      isSettingComplete,
      isAdminComplete,
    },
    "Status setup berhasil diambil",
  );
});
