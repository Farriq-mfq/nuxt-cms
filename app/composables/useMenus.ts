import {
  type CreateMenuPayload,
  type UpdateMenuPayload,
} from "~~/server/validators/menu";
interface UpdateMenuPayloadWithId {
  id: number;
  data: UpdateMenuPayload;
}

export function createMenu(payload: CreateMenuPayload) {
  return $fetch("/api/_admins/menus", {
    method: "POST",
    body: payload,
  });
}

export function updateMenu(payload: UpdateMenuPayloadWithId) {
  return $fetch(`/api/_admins/menus/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deleteMenu(id: number) {
  return $fetch(`/api/_admins/menus/${id}`, {
    method: "DELETE",
  });
}
