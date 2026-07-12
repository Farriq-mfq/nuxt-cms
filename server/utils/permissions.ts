export const RESTRICTED_RESOURCES = ["setting", "menu", "admin"] as const;

export type Resource = (typeof RESTRICTED_RESOURCES)[number];

export type Role = "superadmin" | "admin" | "editor";

const PERMISSION_MATRIX: Record<Role, Resource[]> = {
  superadmin: ["setting", "menu", "admin"],
  admin: ["setting", "menu"],
  editor: [],
};

export function canAccess(role: Role, resource: Resource): boolean {
  return PERMISSION_MATRIX[role]?.includes(resource) ?? false;
}
