export function uploadFile(payload: Record<string, any>) {
  const formData = new FormData();

  if (payload.file instanceof File) {
    formData.append("file", payload.file);
  }

  return $fetch("/api/_admins/files", { method: "POST", body: formData });
}

export function deleteFile(id: number) {
  return $fetch(`/api/_admins/files/${id}`, { method: "DELETE" });
}
