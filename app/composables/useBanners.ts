// composables/useBanners.ts
export function createBanner(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  if (payload.description) formData.append("description", payload.description); // ← baru
  if (payload.linkUrl) formData.append("linkUrl", payload.linkUrl);
  formData.append("order", String(payload.order ?? 0));
  formData.append("isActive", String(payload.is_active ?? true));
  if (payload.startDate) formData.append("startDate", payload.startDate);
  if (payload.endDate) formData.append("endDate", payload.endDate);
  if (payload.image instanceof File) formData.append("image", payload.image);

  return $fetch("/api/_admins/banners", { method: "POST", body: formData });
}

export function updateBanner(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.description !== undefined)
    formData.append("description", data.description ?? ""); // ← baru
  if (data.linkUrl !== undefined)
    formData.append("linkUrl", data.linkUrl ?? "");
  if (data.order !== undefined) formData.append("order", String(data.order));
  if (data.is_active !== undefined)
    formData.append("isActive", String(data.is_active));
  if (data.startDate) formData.append("startDate", data.startDate);
  if (data.endDate) formData.append("endDate", data.endDate);
  if (data.image instanceof File) formData.append("image", data.image);

  return $fetch(`/api/_admins/banners/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteBanner(id: number) {
  return $fetch(`/api/_admins/banners/${id}`, { method: "DELETE" });
}
