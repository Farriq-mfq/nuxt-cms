import { z } from "zod";
import { BASE_THEMES } from "../utils/theme";

const VALID_BASE_THEMES = BASE_THEMES.map((t) => t.name) as [
  string,
  ...string[],
];

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

function jsonFromFormData<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema);
}

const socialLinksSchema = z.object({
  facebook: z.string().trim().max(255).optional(),
  instagram: z.string().trim().max(255).optional(),
  twitter: z.string().trim().max(255).optional(),
  youtube: z.string().trim().max(255).optional(),
  linkedin: z.string().trim().max(255).optional(),
  tiktok: z.string().trim().max(255).optional(),
});

export const updateSettingSchema = z.object({
  app_name: z
    .string()
    .trim()
    .min(1, "Nama aplikasi tidak boleh kosong")
    .max(255),
  app_description: z
    .string()
    .trim()
    .min(1, "Deskripsi tidak boleh kosong")
    .max(500),
  app_keywords: jsonFromFormData(z.array(z.string())).optional(),
  app_theme: z.enum(VALID_BASE_THEMES).optional(),

  social_links: jsonFromFormData(socialLinksSchema).optional(),

  address: z.string().trim().max(500).optional(),

  contact_email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(255)
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().trim().max(50).optional(),
  contact_whatsapp: z.string().trim().max(50).optional(),

  footer_text: z.string().trim().max(500).optional(),

  meta_title: z.string().trim().max(255).optional(),
  meta_description: z.string().trim().max(500).optional(),
  meta_url: z.string().trim().max(255).optional(),

  map_embed_url: z.string().trim().max(500).optional(),

  maintenance_mode: booleanFromFormData.default(false),
  maintenance_message: z.string().trim().max(500).optional(),

  google_analytics_id: z.string().trim().max(100).optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
