import type {
  CreateNewsCategorySchema,
  UpdateNewsCategorySchema,
} from "~~/server/validators/news-category";

export function createNewsCategories(payload: CreateNewsCategorySchema) {
  return $fetch("/api/news-categories", {
    method: "POST",
    body: payload,
  });
}

export function updateNewsCategories(payload: {
  id: number;
  data: UpdateNewsCategorySchema;
}) {
  console.log(payload);
  return $fetch(`/api/news-categories/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deleteNewsCategories(id: number) {
  return $fetch(`/api/news-categories/${id}`, {
    method: "DELETE",
  });
}
