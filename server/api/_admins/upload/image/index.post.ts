import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { imageUploadSchema } from "~~/server/validators/upload";
import { saveUploadedFile } from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  const filePart = formData?.find((p) => p.name === "file");

  if (!filePart || !filePart.data) {
    return errorResponse(422, "Validasi gagal", [
      { field: "file", message: "File tidak ditemukan" },
    ]);
  }

  const parsed = imageUploadSchema.safeParse({
    filename: filePart.filename,
    type: filePart.type,
    size: filePart.data.length,
  });

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const uploaded = await saveUploadedFile(
    { filename: filePart.filename, type: filePart.type, data: filePart.data },
    "images",
    {
      imageProcessing: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
        convertToWebp: true,
      },
      generateThumbnail: true,
      thumbnailSize: 300,
    },
  );

  const [result] = await db.insert(images).values({
    fileName: uploaded.fileName,
    path: uploaded.path,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    width: uploaded.width,
    height: uploaded.height,
  });

  return successResponse(
    {
      id: result.insertId,
      path: uploaded.path,
      thumbnailPath: uploaded.thumbnailPath,
    },
    "Gambar berhasil diunggah",
  );
});
