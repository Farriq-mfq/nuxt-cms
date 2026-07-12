export function useAuth() {
  const { user } = useUserSession();

  function can(resource: "setting" | "menu" | "admin"): boolean {
    if (!user.value) return false;
    const role = user.value.role as "superadmin" | "admin" | "editor";

    const matrix: Record<string, string[]> = {
      superadmin: ["setting", "menu", "admin"],
      admin: ["setting", "menu"],
      editor: [],
    };

    return matrix[role]?.includes(resource) ?? false;
  }

  return { user, can };
}
