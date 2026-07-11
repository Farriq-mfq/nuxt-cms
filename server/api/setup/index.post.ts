import { eq } from "drizzle-orm";
import { setting } from "~~/server/db/schema/setting";
import { _admins } from "~~/server/db/schema/auth";
import { db } from "~~/server/db";
import { setupSchema } from "~~/server/validators/setup";

export default defineEventHandler(async (event) => {
  const existingSetting = await db
    .select({ id: setting.id })
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  const existingAdminAny = await db
    .select({ id: _admins.id })
    .from(_admins)
    .limit(1);

  if (existingSetting[0] && existingAdminAny.length > 0) {
    return errorResponse(403, "Setup sudah pernah diselesaikan sebelumnya");
  }

  const body = await readBody(event);
  const parsed = setupSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { setting: settingData, admin: adminData } = parsed.data;

  if (!existingSetting[0]) {
    await db.insert(setting).values({
      id: 1,
      appName: settingData.app_name,
      appDescription: settingData.app_description,
      appTheme: "default",
      maintenanceMode: false,
    });
  }

  const existingUsername = await db
    .select({ id: _admins.id })
    .from(_admins)
    .where(eq(_admins.username, adminData.username))
    .limit(1);

  if (!existingUsername[0] && existingAdminAny.length === 0) {
    const hashedPassword = await hashPassword(adminData.password);

    await db.insert(_admins).values({
      name: adminData.name,
      username: adminData.username,
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
    });
  }

  return successResponse({ done: true }, "Setup berhasil diselesaikan");
});
