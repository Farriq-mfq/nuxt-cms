import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createVideoAlbumSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  description: z.string().trim().optional(),
  isActive: booleanFromFormData.default(true),
});

export const updateVideoAlbumSchema = createVideoAlbumSchema.partial();

export const createVideoSchema = z.object({
  title: z.string().trim().min(1, "Judul video tidak boleh kosong").max(255),
  url: z.string().trim().min(1, "URL/ID video tidak boleh kosong"),
});
