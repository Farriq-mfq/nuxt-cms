export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    return successResponse(null, "Sudah logout sebelumnya");
  }

  await clearUserSession(event);

  return successResponse(null, "Logout berhasil");
});
