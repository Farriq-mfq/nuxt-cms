export function createNews(payload: Record<string, any>) {
  const formData = new FormData();

  formData.append("title", payload.title ?? "");
  formData.append("content", payload.content ?? "");

  const categoryId = payload.category?.id ?? payload.category;
  if (categoryId) formData.append("categoryId", String(categoryId));

  if (payload.excerpt) formData.append("excerpt", payload.excerpt);
  formData.append("isPublished", String(payload.is_published ?? false));

  if (payload.thumbnail instanceof File) {
    formData.append("thumbnail", payload.thumbnail);
  }

  return $fetch("/api/_admins/news", { method: "POST", body: formData });
}

export function updateNews(payload: Record<string, any>) {
  const { id, ...data } = payload;

  const formData = new FormData();

  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.content !== undefined)
    formData.append("content", data.content ?? "");

  const categoryId = data.category?.id ?? data.category;
  if (categoryId) formData.append("categoryId", String(categoryId));

  if (data.excerpt) formData.append("excerpt", data.excerpt);
  if (data.is_published !== undefined)
    formData.append("isPublished", String(data.is_published));

  if (data.thumbnail instanceof File) {
    formData.append("thumbnail", data.thumbnail);
  }

  return $fetch(`/api/_admins/news/${id}`, { method: "PATCH", body: formData });
}

export function deleteNews(id: number) {
  return $fetch(`/api/_admins/news/${id}`, { method: "DELETE" });
}
