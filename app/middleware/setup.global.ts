export default defineNuxtRouteMiddleware(async (to) => {
  const isExempt =
    to.path.startsWith("/api") ||
    to.path.startsWith("/_") ||
    to.path === "/setup" ||
    to.path === "/maintenance" ||
    to.path.startsWith("/_admins");

  if (isExempt) return;

  const setupStatus = useState<{ isComplete: boolean } | null>(
    "setup-status",
    () => null,
  );

  if (setupStatus.value === null) {
    try {
      const res = await $fetch<{
        success: boolean;
        data: { isComplete: boolean };
      }>("/api/setup/status");
      setupStatus.value = { isComplete: res.data.isComplete };
    } catch {
      setupStatus.value = { isComplete: true };
    }
  }

  const isSetupComplete = setupStatus.value.isComplete;

  if (!isSetupComplete && to.path !== "/setup") {
    return navigateTo("/setup");
  }

  if (isSetupComplete && to.path === "/setup") {
    return navigateTo("/");
  }
});
