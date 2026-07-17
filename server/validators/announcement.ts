import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  isPublished: booleanFromFormData.default(false),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
