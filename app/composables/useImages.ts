export function uploadImage(payload: Record<string, any>) {
  const formData = new FormData();

  if (payload.file instanceof File) {
    formData.append("file", payload.file);
  }
  if (payload.altText) {
    formData.append("altText", payload.altText);
  }

  return $fetch("/api/_admins/images", { method: "POST", body: formData });
}

export function updateImage(payload: {
  id: number;
  data: { altText?: string };
}) {
  return $fetch(`/api/_admins/images/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deleteImage(id: number) {
  return $fetch(`/api/_admins/images/${id}`, { method: "DELETE" });
}
