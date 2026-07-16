export function createAnnouncement(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  formData.append("content", payload.content ?? "");
  formData.append("isPublished", String(payload.is_published ?? false));
  if (payload.thumbnail instanceof File)
    formData.append("thumbnail", payload.thumbnail);

  return $fetch("/api/_admins/announcements", {
    method: "POST",
    body: formData,
  });
}

export function updateAnnouncement(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.content !== undefined)
    formData.append("content", data.content ?? "");
  if (data.is_published !== undefined)
    formData.append("isPublished", String(data.is_published));
  if (data.thumbnail instanceof File)
    formData.append("thumbnail", data.thumbnail);

  return $fetch(`/api/_admins/announcements/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteAnnouncement(id: number) {
  return $fetch(`/api/_admins/announcements/${id}`, { method: "DELETE" });
}
