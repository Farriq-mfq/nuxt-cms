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
