import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createAlbumSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  description: z.string().trim().optional(),
  isActive: booleanFromFormData.default(true),
});

export const updateAlbumSchema = createAlbumSchema.partial();

export const updateGallerySchema = z.object({
  caption: z.string().trim().max(255).optional(),
  order: z.coerce.number().int().default(0),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
