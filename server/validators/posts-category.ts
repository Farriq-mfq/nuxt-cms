import { z } from "zod";

export const createPostsCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori tidak boleh kosong").max(255),
});

export const updatePostsCategorySchema = createPostsCategorySchema.partial();

export type CreatePostsCategorySchema = z.infer<
  typeof createPostsCategorySchema
>;
export type UpdatePostsCategorySchema = z.infer<
  typeof updatePostsCategorySchema
>;
