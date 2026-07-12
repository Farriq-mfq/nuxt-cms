import { canAccess, type Resource } from "./permissions";

export async function requirePermission(event: any, resource: Resource) {
  const { user } = await getUserSession(event);

  if (!user) {
    return {
      error: errorResponse(401, "Sesi tidak valid, silakan login kembali"),
    };
  }

  if (!canAccess(user.role, resource)) {
    return {
      error: errorResponse(403, "Kamu tidak memiliki akses ke fitur ini"),
    };
  }

  return { user };
}
