export function createAgenda(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  if (payload.description) formData.append("description", payload.description);
  if (payload.location) formData.append("location", payload.location);
  formData.append("startDate", payload.startDate ?? "");
  if (payload.endDate) formData.append("endDate", payload.endDate);
  formData.append("isPublished", String(payload.is_published ?? true));
  if (payload.thumbnail instanceof File)
    formData.append("thumbnail", payload.thumbnail);

  return $fetch("/api/_admins/agenda", { method: "POST", body: formData });
}

export function updateAgenda(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.description !== undefined)
    formData.append("description", data.description ?? "");
  if (data.location !== undefined)
    formData.append("location", data.location ?? "");
  if (data.startDate) formData.append("startDate", data.startDate);
  if (data.endDate) formData.append("endDate", data.endDate);
  if (data.is_published !== undefined)
    formData.append("isPublished", String(data.is_published));
  if (data.thumbnail instanceof File)
    formData.append("thumbnail", data.thumbnail);

  return $fetch(`/api/_admins/agenda/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteAgenda(id: number) {
  return $fetch(`/api/_admins/agenda/${id}`, { method: "DELETE" });
}
