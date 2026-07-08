export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  const publicPaths = ["/api/_admins/auth/login", "/api/_admins/auth/logout"];
  const isInternalAuthUtils = path.startsWith("/api/_admins/_auth/");

  if (publicPaths.includes(path) || isInternalAuthUtils) return;

  const isProtectedApi =
    path.startsWith("/api/_admins/") && !path.startsWith("/api/_admins/auth/");

  if (!isProtectedApi) return;

  const session = await getUserSession(event);

  if (!session.user) {
    return errorResponse(401, "Unauthorized");
  }
});
