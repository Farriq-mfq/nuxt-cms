import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema";
import { createMenuSchema } from "~~/server/validators/menu";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = createMenuSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { parentId, title, url, icon, order, target, isActive } = parsed.data;

  if (parentId) {
    const parentExists = await db
      .select({ id: menus.id })
      .from(menus)
      .where(eq(menus.id, parentId))
      .limit(1);

    if (!parentExists[0]) {
      return errorResponse(422, "Validasi gagal", [
        { field: "parentId", message: "Parent menu tidak ditemukan" },
      ]);
    }
  }

  const [result] = await db.insert(menus).values({
    parentId,
    title,
    url,
    icon,
    order,
    target,
    isActive,
  });

  return successResponse({ id: result.insertId }, "Menu berhasil dibuat");
});
