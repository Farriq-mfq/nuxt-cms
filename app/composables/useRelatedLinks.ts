export function createRelatedLink(payload: Record<string, any>) {
  return $fetch("/api/_admins/related-links", {
    method: "POST",
    body: {
      title: payload.title,
      url: payload.url,
      icon: payload.icon || undefined,
      order: payload.order ?? 0,
      isActive: payload.is_active ?? true,
    },
  });
}

export function updateRelatedLink(payload: {
  id: number;
  data: Record<string, any>;
}) {
  return $fetch(`/api/_admins/related-links/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deleteRelatedLink(id: number) {
  return $fetch(`/api/_admins/related-links/${id}`, { method: "DELETE" });
}
