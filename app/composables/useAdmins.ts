export function createAdmin(payload: Record<string, any>) {
  return $fetch("/api/_admins/admins", {
    method: "POST",
    body: {
      name: payload.name,
      username: payload.username,
      password: payload.password,
      role: payload.role,
      isActive: payload.is_active ?? true,
    },
  });
}

export function updateAdmin(payload: {
  id: number;
  data: Record<string, any>;
}) {
  const { password, ...rest } = payload.data;
  return $fetch(`/api/_admins/admins/${payload.id}`, {
    method: "PATCH",
    body: {
      ...rest,
      ...(password && { password }),
    },
  });
}

export function deleteAdmin(id: number) {
  return $fetch(`/api/_admins/admins/${id}`, { method: "DELETE" });
}
