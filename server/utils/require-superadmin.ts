export async function requireSuperadmin(event: any) {
  const { user } = await getUserSession(event);

  if (!user) {
    return {
      error: errorResponse(401, "Sesi tidak valid, silakan login kembali"),
    };
  }

  if (user.role !== "superadmin") {
    return {
      error: errorResponse(
        403,
        "Hanya superadmin yang bisa mengelola data admin",
      ),
    };
  }

  return { user };
}
