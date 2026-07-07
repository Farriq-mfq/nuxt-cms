type MenuTarget = "_self" | "_blank";
interface CreateMenuPayload {
  parent_id: number;
  title: string;
  icon: string;
  url: string;
  order: number;
  target: MenuTarget;
  is_active: boolean;
}

interface UpdateMenuPayload {
  id: number;
  data: Partial<CreateMenuPayload>;
}

export function createMenu(payload: CreateMenuPayload) {
  return $fetch("/api/menus", {
    method: "POST",
    body: payload,
  });
}

export function updateMenu(payload: UpdateMenuPayload) {
  return $fetch(`/api/menus/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deleteMenu(id: number) {
  return $fetch(`/api/menus/${id}`, {
    method: "DELETE",
  });
}
