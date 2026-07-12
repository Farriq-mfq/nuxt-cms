import { eq, and, ne } from "drizzle-orm";
import { _admins } from "~~/server/db/schema/auth";
import { db } from "~~/server/db";
import { updateAdminSchema } from "~~/server/validators/admin";
import { z } from "zod";
import { requireSuperadmin } from "~~/server/utils/require-superadmin";

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

  const existing = await db
    .select()
    .from(_admins)
    .where(eq(_admins.id, id))
    .limit(1);
  const existingAdmin = existing[0];

  if (!existingAdmin) {
    return errorResponse(404, "Admin tidak ditemukan");
  }

  const body = await readBody(event);
  const parsed = updateAdminSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { name, username, password, role, isActive } = parsed.data;

  if (existingAdmin.role === "superadmin") {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "role",
        message:
          "Admin dengan role superadmin tidak bisa diubah lewat form ini",
      },
    ]);
  }

  if (username) {
    const existingUsername = await db
      .select({ id: _admins.id })
      .from(_admins)
      .where(and(eq(_admins.username, username), ne(_admins.id, id)))
      .limit(1);

    if (existingUsername[0]) {
      return errorResponse(422, "Validasi gagal", [
        { field: "username", message: "Username sudah digunakan" },
      ]);
    }
  }

  if (id === user!.id && isActive === false) {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "isActive",
        message: "Kamu tidak bisa menonaktifkan akunmu sendiri",
      },
    ]);
  }

  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  await db
    .update(_admins)
    .set({
      ...(name !== undefined && { name }),
      ...(username !== undefined && { username }),
      ...(hashedPassword !== undefined && { password: hashedPassword }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    })
    .where(eq(_admins.id, id));

  return successResponse({ id }, "Admin berhasil diperbarui");
});
