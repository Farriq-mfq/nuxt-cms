import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { _admins } from "~~/server/db/schema";
import { loginSchema } from "~~/server/validators/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { username, password } = parsed.data;

  const result = await db
    .select()
    .from(_admins)
    .where(eq(_admins.username, username))
    .limit(1);

  const admin = result[0];

  if (!admin) {
    return errorResponse(401, "Validasi gagal", [
      { field: "username", message: "Username atau password salah" },
    ]);
  }

  if (!admin.isActive) {
    return errorResponse(403, "Akun tidak aktif, hubungi superadmin");
  }

  const isValid = await verifyPassword(admin.password, password);

  if (!isValid) {
    return errorResponse(401, "Validasi gagal", [
      { field: "username", message: "Username atau password salah" },
    ]);
  }

  await db
    .update(_admins)
    .set({ lastLoginAt: new Date() })
    .where(eq(_admins.id, admin.id));

  await setUserSession(event, {
    user: {
      id: admin.id,
      name: admin.name,
      username: admin.username,
      role: admin.role,
    },
  });

  return successResponse(
    { id: admin.id, name: admin.name, role: admin.role },
    "Login berhasil",
  );
});
