export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (
    to.path.startsWith("/_admins") &&
    to.path == "/_admins/login" &&
    loggedIn.value
  ) {
    return navigateTo("/_admins");
  }
});
