import type {
  CreatePostsCategorySchema,
  UpdatePostsCategorySchema,
} from "~~/server/validators/posts-category";

export function createPostCategories(payload: CreatePostsCategorySchema) {
  return $fetch("/api/_admins/posts-categories", {
    method: "POST",
    body: payload,
  });
}

export function updatePostCategories(payload: {
  id: number;
  data: UpdatePostsCategorySchema;
}) {
  console.log(payload);
  return $fetch(`/api/_admins/posts-categories/${payload.id}`, {
    method: "PATCH",
    body: payload.data,
  });
}

export function deletePostCategories(id: number) {
  return $fetch(`/api/_admins/posts-categories/${id}`, {
    method: "DELETE",
  });
}
