import { z } from "zod";

export const setupSettingSchema = z.object({
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
});

export const setupAdminSchema = z
  .object({
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const setupSchema = z.object({
  setting: setupSettingSchema,
  admin: setupAdminSchema,
});

export type SetupInput = z.infer<typeof setupSchema>;
