export function createAlbum(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  if (payload.description) formData.append("description", payload.description);
  formData.append("isActive", String(payload.is_active ?? true));
  if (payload.cover instanceof File) formData.append("cover", payload.cover);

  return $fetch("/api/_admins/albums", { method: "POST", body: formData });
}

export function updateAlbum(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.description !== undefined)
    formData.append("description", data.description ?? "");
  if (data.is_active !== undefined)
    formData.append("isActive", String(data.is_active));
  if (data.cover instanceof File) formData.append("cover", data.cover);

  return $fetch(`/api/_admins/albums/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteAlbum(id: number) {
  return $fetch(`/api/_admins/albums/${id}`, { method: "DELETE" });
}

export function uploadGalleryImages(albumId: number, fileList: File[]) {
  const formData = new FormData();
  fileList.forEach((file) => formData.append("images", file));

  return $fetch(`/api/_admins/albums/${albumId}/galleries`, {
    method: "POST",
    body: formData,
  });
}

export function updateGalleryItem(payload: {
  id: number;
  caption?: string;
  order?: number;
}) {
  const { id, ...data } = payload;
  return $fetch(`/api/_admins/galleries/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteGalleryItem(id: number) {
  return $fetch(`/api/_admins/galleries/${id}`, { method: "DELETE" });
}
