export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/_admins")) return;

  const { setting } = useSetting();
  if (setting.value?.maintenanceMode && to.path !== "/maintenance") {
    return abortNavigation();
  }

  if (!setting.value?.maintenanceMode && to.path === "/maintenance") {
    return abortNavigation();
  }
});
