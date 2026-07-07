import { eq } from "drizzle-orm";
import { menus } from "~~/server/db/schema/menu";
import { db } from "~~/server/db";
import { updateMenuSchema } from "~~/server/validators/menu";

async function isDescendant(
  targetId: number,
  potentialAncestorId: number,
  visited: Set<number> = new Set(),
): Promise<boolean> {
  if (visited.has(potentialAncestorId)) return false;
  visited.add(potentialAncestorId);

  const current = await db
    .select({ parentId: menus.parentId })
    .from(menus)
    .where(eq(menus.id, potentialAncestorId))
    .limit(1);

  const parent = current[0]?.parentId;
  if (parent === null || parent === undefined) return false;

  const parentNum = Number(parent);
  if (parentNum === targetId) return true;

  return isDescendant(targetId, parentNum, visited);
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const param = getRouterParams(event);

  if (!param.id) {
    return errorResponse(404, "Menu tidak ditemukan");
  }

  const paramId = parseInt(param.id);

  if (isNaN(paramId)) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "ID menu tidak valid" },
    ]);
  }

  const parsed = updateMenuSchema.safeParse(body);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { parentId, title, url, icon, order, target, isActive } = parsed.data;

  const existingMenu = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.id, paramId))
    .limit(1);

  if (!existingMenu[0]) {
    return errorResponse(404, "Menu tidak ditemukan");
  }

  if (parentId !== undefined && parentId !== null) {
    const normalizedParentId = Number(parentId);

    if (normalizedParentId === paramId) {
      return errorResponse(422, "Validasi gagal", [
        {
          field: "parentId",
          message: "Menu tidak bisa menjadi parent dari dirinya sendiri",
        },
      ]);
    }

    const parentExists = await db
      .select({ id: menus.id })
      .from(menus)
      .where(eq(menus.id, normalizedParentId))
      .limit(1);

    if (!parentExists[0]) {
      return errorResponse(422, "Validasi gagal", [
        { field: "parentId", message: "Parent menu tidak ditemukan" },
      ]);
    }

    const wouldCreateCycle = await isDescendant(paramId, normalizedParentId);
    if (wouldCreateCycle) {
      return errorResponse(422, "Validasi gagal", [
        {
          field: "parentId",
          message:
            "Menu induk yang dipilih adalah submenu dari menu ini — tidak diperbolehkan untuk mencegah referensi melingkar",
        },
      ]);
    }
  }

  await db
    .update(menus)
    .set({
      ...(parentId !== undefined && { parentId }),
      ...(title !== undefined && { title }),
      ...(url !== undefined && { url }),
      ...(icon !== undefined && { icon }),
      ...(order !== undefined && { order }),
      ...(target !== undefined && { target }),
      ...(isActive !== undefined && { isActive }),
    })
    .where(eq(menus.id, paramId));

  return successResponse({ id: paramId }, "Menu berhasil diperbarui");
});
