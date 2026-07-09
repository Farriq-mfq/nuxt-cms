import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createRelatedLinkSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  url: z
    .string()
    .trim()
    .min(1, "URL tidak boleh kosong")
    .max(500)
    .url("Format URL tidak valid"),
  icon: z.string().trim().max(100).optional(),
  order: z.coerce.number().int().default(0),
  isActive: booleanFromFormData.default(true),
});

export const updateRelatedLinkSchema = createRelatedLinkSchema.partial();

export type CreateRelatedLinkInput = z.infer<typeof createRelatedLinkSchema>;
export type UpdateRelatedLinkInput = z.infer<typeof updateRelatedLinkSchema>;
