export function createPopup(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  if (payload.linkUrl) formData.append("linkUrl", payload.linkUrl);
  formData.append("isActive", String(payload.is_active ?? false));
  if (payload.startDate) formData.append("startDate", payload.startDate);
  if (payload.endDate) formData.append("endDate", payload.endDate);
  if (payload.image instanceof File) formData.append("image", payload.image);

  return $fetch("/api/_admins/popups", { method: "POST", body: formData });
}

export function updatePopup(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.linkUrl !== undefined)
    formData.append("linkUrl", data.linkUrl ?? "");
  if (data.is_active !== undefined)
    formData.append("isActive", String(data.is_active));
  if (data.startDate) formData.append("startDate", data.startDate);
  if (data.endDate) formData.append("endDate", data.endDate);
  if (data.image instanceof File) formData.append("image", data.image);

  return $fetch(`/api/_admins/popups/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deletePopup(id: number) {
  return $fetch(`/api/_admins/popups/${id}`, { method: "DELETE" });
}
