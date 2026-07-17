export function createVideoAlbum(payload: Record<string, any>) {
  const formData = new FormData();
  formData.append("title", payload.title ?? "");
  if (payload.description) formData.append("description", payload.description);
  formData.append("isActive", String(payload.is_active ?? true));
  if (payload.cover instanceof File) formData.append("cover", payload.cover);

  return $fetch("/api/_admins/video-albums", {
    method: "POST",
    body: formData,
  });
}

export function updateVideoAlbum(payload: Record<string, any>) {
  const { id, ...data } = payload;
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title ?? "");
  if (data.description !== undefined)
    formData.append("description", data.description ?? "");
  if (data.is_active !== undefined)
    formData.append("isActive", String(data.is_active));
  if (data.cover instanceof File) formData.append("cover", data.cover);

  return $fetch(`/api/_admins/video-albums/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteVideoAlbum(id: number) {
  return $fetch(`/api/_admins/video-albums/${id}`, { method: "DELETE" });
}

export function addVideo(
  albumId: number,
  payload: { title: string; url: string },
) {
  return $fetch(`/api/_admins/video-albums/${albumId}/videos`, {
    method: "POST",
    body: payload,
  });
}

export function deleteVideo(id: number) {
  return $fetch(`/api/_admins/videos/${id}`, { method: "DELETE" });
}
