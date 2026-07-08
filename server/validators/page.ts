import { z } from "zod";

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });
export const createPageSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  content: z.string().trim().min(1, "Konten tidak boleh kosong"),
  meta_title: z.string().trim().max(255).optional(),
  meta_description: z.string().trim().max(500).optional(),
  meta_image: z.string().trim().max(500).optional(),
  is_published: booleanFromString.default(false),
});

export const paramPageIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreatePagePayload = z.infer<typeof createPageSchema>;

export const updatePageSchema = createPageSchema.partial();

export type UpdatePagePayload = z.infer<typeof updatePageSchema>;
