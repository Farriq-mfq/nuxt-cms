import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { nanoid } from "nanoid";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  fileName: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
}

export async function saveUploadedFile(
  file: { filename?: string; type?: string; data: Buffer },
  category: "images" | "files",
): Promise<UploadResult> {
  const allowedTypes =
    category === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;

  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tipe file tidak diizinkan: ${file.type}`,
    });
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ukuran file melebihi 5MB",
    });
  }

  const ext = extname(file.filename || "");
  const uniqueName = `${nanoid()}${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", category);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, uniqueName), file.data);

  return {
    fileName: uniqueName,
    originalName: file.filename || uniqueName,
    path: `/uploads/${category}/${uniqueName}`,
    mimeType: file.type,
    size: file.data.length,
  };
}
