interface CreateNewsPayload {
  categoryId: number;
  title: string;
  excerpt?: string;
  content: string;
  thumbnailId?: number;
  isPublished: boolean;
}

interface UpdateNewsPayload {
  id: number;
  data: Partial<CreateNewsPayload>;
}

export function createNews(payload: CreateNewsPayload) {
  return $fetch("/api/news", {
    method: "POST",
    body: payload,
  });
}

// export function updateNews(payload: UpdateNewsPayload) {
//   return $fetch(`/api/news/${payload.id}`, {
//     method: "PATCH",
//     body: payload.data,
//   });
// }

// export function deleteNews(id: number) {
//   return $fetch(`/api/news/${id}`, {
//     method: "DELETE",
//   });
// }
