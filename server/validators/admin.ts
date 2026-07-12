import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createAdminSchema = z.object({
  name: z.string().trim().min(1, "Nama tidak boleh kosong").max(255),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(255)
    .regex(
      /^[a-z0-9_.]+$/,
      "Username hanya boleh huruf kecil, angka, titik, underscore",
    ),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z
    .enum(["admin", "editor"], {
      error: "Role hanya boleh admin atau editor",
    })
    .default("admin"),
  isActive: booleanFromFormData.default(true),
});

export const updateAdminSchema = z.object({
  name: z.string().trim().min(1, "Nama tidak boleh kosong").max(255).optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(255)
    .regex(
      /^[a-z0-9_.]+$/,
      "Username hanya boleh huruf kecil, angka, titik, underscore",
    )
    .optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .optional()
    .or(z.literal("")),
  role: z
    .enum(["admin", "editor"], {
      error: "Role hanya boleh admin atau editor",
    })
    .optional(),
  isActive: booleanFromFormData.optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
