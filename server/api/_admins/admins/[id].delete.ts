// server/api/admins/[id].delete.ts
import { eq } from "drizzle-orm";
import { _admins } from "~~/server/db/schema/auth";
import { db } from "~~/server/db";
import { requireSuperadmin } from "~~/server/utils/require-superadmin";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const { user, error } = await requireSuperadmin(event);
  if (error) return error;

  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Admin tidak ditemukan");
  }

  const { id } = parsedParams.data;

  if (id === user!.id) {
    return errorResponse(422, "Validasi gagal", [
      { field: "id", message: "Kamu tidak bisa menghapus akunmu sendiri" },
    ]);
  }

  const existing = await db
    .select()
    .from(_admins)
    .where(eq(_admins.id, id))
    .limit(1);
  const existingAdmin = existing[0];

  if (!existingAdmin) {
    return errorResponse(404, "Admin tidak ditemukan");
  }

  if (existingAdmin.role === "superadmin") {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "id",
        message:
          "Admin dengan role superadmin tidak bisa dihapus lewat form ini",
      },
    ]);
  }

  await db.delete(_admins).where(eq(_admins.id, id));

  return successResponse({ id }, "Admin berhasil dihapus");
});
