import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 2MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_FILE_TYPES = ["application/pdf"];

export const imageUploadSchema = z.object({
  filename: z.string().min(1, "Nama file tidak boleh kosong"),
  type: z.enum(ALLOWED_IMAGE_TYPES, {
    error: "Tipe gambar tidak diizinkan (hanya JPEG/PNG/WEBP/GIF)",
  }),
  size: z
    .number()
    .max(MAX_SIZE, `Ukuran gambar melebihi batas ${MAX_SIZE / 1024 / 1024}MB`)
    .positive("File kosong tidak valid"),
  altText: z.string().max(255).optional(),
});

export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Nama file tidak boleh kosong"),
  type: z.enum(ALLOWED_FILE_TYPES, {
    error: "Tipe file tidak diizinkan (hanya PDF)",
  }),
  size: z
    .number()
    .max(MAX_SIZE, `Ukuran file melebihi batas ${MAX_SIZE / 1024 / 1024}MB`)
    .positive("File kosong tidak valid"),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
