import { eq } from "drizzle-orm";
import { _admins } from "~~/server/db/schema/auth";
import { db } from "~~/server/db";
import { createAdminSchema } from "~~/server/validators/admin";
import { requireSuperadmin } from "~~/server/utils/require-superadmin";

export default defineEventHandler(async (event) => {
  const { error } = await requireSuperadmin(event);
  if (error) return error;

  const body = await readBody(event);
  const parsed = createAdminSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { name, username, password, role, isActive } = parsed.data;

  const existingUsername = await db
    .select({ id: _admins.id })
    .from(_admins)
    .where(eq(_admins.username, username))
    .limit(1);

  if (existingUsername[0]) {
    return errorResponse(422, "Validasi gagal", [
      { field: "username", message: "Username sudah digunakan" },
    ]);
  }

  const hashedPassword = await hashPassword(password);

  const [result] = await db.insert(_admins).values({
    name,
    username,
    password: hashedPassword,
    role,
    isActive,
  });

  return successResponse({ id: result.insertId }, "Admin berhasil dibuat");
});
