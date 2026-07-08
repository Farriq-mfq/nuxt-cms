export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  const publicPaths = ["/api/auth/login", "/api/auth/logout"];
  const isInternalAuthUtils = path.startsWith("/api/_auth/");

  if (publicPaths.includes(path) || isInternalAuthUtils) return;

  const isProtectedApi =
    path.startsWith("/api/") && !path.startsWith("/api/auth/");

  if (!isProtectedApi) return;

  const session = await getUserSession(event);

  if (!session.user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }
});
