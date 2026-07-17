import { z } from "zod";

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().int().positive().optional());

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createPostSchema = z.object({
  categoryId: optionalNumber,
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  isPublished: booleanFromFormData.default(false),
});

export const updatePostSchema = createPostSchema.partial();
