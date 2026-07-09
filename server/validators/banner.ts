import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

const optionalDateFromFormData = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  return val;
}, z.coerce.date().optional());

export const createBannerSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
  order: z.coerce.number().int().default(0),
  isActive: booleanFromFormData.default(true),
  startDate: optionalDateFromFormData,
  endDate: optionalDateFromFormData,
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
