import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import { nanoid } from "nanoid";
import {
  processImage,
  generateThumbnail,
  type ImageProcessOptions,
} from "./image-processor";
import sharp from "sharp";

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

interface AssetUploadResult {
  path: string;
}

const ALLOWED_ICON_TYPES = [
  "image/x-icon",
  "image/png",
  "image/vnd.microsoft.icon",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  fileName: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnailPath?: string;
}

interface SaveFileOptions {
  imageProcessing?: ImageProcessOptions;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export async function saveUploadedFile(
  file: { filename?: string; type?: string; data: Buffer },
  category: "images" | "files",
  options: SaveFileOptions = {},
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

  const uploadDir = join(process.cwd(), "public", "uploads", category);
  await mkdir(uploadDir, { recursive: true });

  if (category === "images") {
    return saveImage(file, uploadDir, options);
  }

  return saveRawFile(file, uploadDir);
}

async function saveImage(
  file: { filename?: string; type?: string; data: Buffer },
  uploadDir: string,
  options: SaveFileOptions,
): Promise<UploadResult> {
  const processed = await processImage(file.data, options.imageProcessing);

  const uniqueName = `${nanoid()}${processed.extension}`;
  await writeFile(join(uploadDir, uniqueName), processed.buffer);

  const result: UploadResult = {
    fileName: uniqueName,
    originalName: file.filename || uniqueName,
    path: `/uploads/images/${uniqueName}`,
    mimeType: processed.mimeType,
    size: processed.buffer.length,
    width: processed.width,
    height: processed.height,
  };

  if (options.generateThumbnail) {
    const thumbBuffer = await generateThumbnail(
      file.data,
      options.thumbnailSize,
    );
    const thumbName = `${nanoid()}-thumb.webp`;
    await writeFile(join(uploadDir, thumbName), thumbBuffer);
    result.thumbnailPath = `/uploads/images/${thumbName}`;
  }

  return result;
}

async function saveRawFile(
  file: { filename?: string; type?: string; data: Buffer },
  uploadDir: string,
): Promise<UploadResult> {
  const ext = extname(file.filename || "");
  const uniqueName = `${nanoid()}${ext}`;
  await writeFile(join(uploadDir, uniqueName), file.data);

  return {
    fileName: uniqueName,
    originalName: file.filename || uniqueName,
    path: `/uploads/files/${uniqueName}`,
    mimeType: file.type!,
    size: file.data.length,
  };
}

export async function saveAssetImage(
  file: { filename?: string; type?: string; data: Buffer },
  subDir: string = "images",
): Promise<AssetUploadResult> {
  if (!file.type || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tipe gambar tidak diizinkan: ${file.type}`,
    });
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ukuran gambar melebihi batas 5MB",
    });
  }

  const processed = await sharp(file.data)
    .rotate() // auto-orient + strip EXIF
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const uniqueName = `${nanoid()}.webp`;
  const uploadDir = join(process.cwd(), "public", "assets", subDir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, uniqueName), processed);

  return { path: `/assets/${subDir}/${uniqueName}` };
}

export async function saveAssetRaw(
  file: { filename?: string; type?: string; data: Buffer },
  subDir: string = "favicon",
): Promise<AssetUploadResult> {
  if (!file.type || !ALLOWED_ICON_TYPES.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tipe favicon tidak diizinkan: ${file.type}`,
    });
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ukuran favicon melebihi batas 5MB",
    });
  }

  const ext = extname(file.filename || "") || ".ico";
  const uniqueName = `${nanoid()}${ext}`;
  const uploadDir = join(process.cwd(), "public", "assets", subDir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, uniqueName), file.data);

  return { path: `/assets/${subDir}/${uniqueName}` };
}

export async function deleteAssetFile(path: string) {
  try {
    await unlink(join(process.cwd(), "public", path));
  } catch {}
}
