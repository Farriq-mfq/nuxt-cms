import { z } from "zod";

export const createNewsCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori tidak boleh kosong").max(255),
});

export const updateNewsCategorySchema = createNewsCategorySchema.partial();

export type CreateNewsCategorySchema = z.infer<typeof createNewsCategorySchema>;
export type UpdateNewsCategorySchema = z.infer<typeof updateNewsCategorySchema>;
