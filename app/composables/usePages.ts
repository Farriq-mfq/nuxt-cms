export function createPage(payload: Record<string, any>) {
  const formData = new FormData();

  formData.append("title", payload.title ?? "");
  formData.append("content", payload.content ?? "");
  if (payload.meta_title) formData.append("meta_title", payload.meta_title);
  if (payload.meta_description)
    formData.append("meta_description", payload.meta_description);
  formData.append("is_published", String(payload.is_published ?? false));

  if (payload.meta_image instanceof File) {
    formData.append("meta_image", payload.meta_image);
  }

  return $fetch("/api/pages", {
    method: "POST",
    body: formData,
  });
}

export function updatePage(payload: Record<string, any>) {
  const { id, ...data } = payload;

  const formData = new FormData();

  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.content !== undefined)
    formData.append("content", data.content ?? "");
  if (data.meta_title) formData.append("meta_title", data.meta_title);
  if (data.meta_description)
    formData.append("meta_description", data.meta_description);
  if (data.is_published !== undefined)
    formData.append("is_published", String(data.is_published));

  if (data.meta_image instanceof File) {
    formData.append("meta_image", data.meta_image);
  }

  return $fetch(`/api/pages/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deletePage(id: number) {
  return $fetch(`/api/pages/${id}`, { method: "DELETE" });
}
