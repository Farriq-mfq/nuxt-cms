import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema";
import { paramMenuIdSchema } from "~~/server/validators/menu";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramMenuIdSchema.safeParse(params);
  if (!parsedParams.success) {
    return errorResponse(404, "Menu tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const menuExists = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.id, id))
    .limit(1);

  if (!menuExists[0]) {
    return errorResponse(404, "Menu tidak ditemukan");
  }

  await db.delete(menus).where(eq(menus.id, id));
  return successResponse(200, "Menu berhasil dihapus");
});
