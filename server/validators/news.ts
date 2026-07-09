import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().int().positive().optional());

export const createNewsSchema = z.object({
  categoryId: optionalNumber,
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  isPublished: booleanFromFormData.default(false),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
