import { eq } from "drizzle-orm";
import { db } from "../db";
import { setting } from "../db/schema";

export default defineEventHandler(async (event) => {
  const path = event.path;

  const isWhitelisted =
    path.startsWith("/_admins") ||
    path.startsWith("/api/_admins") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/_auth") ||
    path.startsWith("/api/setting") ||
    path.startsWith("/api/setup") ||
    path.startsWith("/_nuxt/") ||
    path.startsWith("/__nuxt") ||
    path === "/maintenance" ||
    path === "/favicon.ico";

  if (isWhitelisted) return;

  const result = await db
    .select({
      maintenanceMode: setting.maintenanceMode,
      maintenanceMessage: setting.maintenanceMessage,
    })
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);

  const settingData = result[0];

  if (!settingData?.maintenanceMode) return;

  if (path.startsWith("/api/")) {
    return errorResponse(
      503,
      settingData.maintenanceMessage || "Situs sedang dalam pemeliharaan",
    );
  }

  setResponseStatus(event, 503);
  return sendRedirect(event, "/maintenance");
});
