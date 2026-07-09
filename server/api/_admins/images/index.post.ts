import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { saveUploadedFile } from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    return errorResponse(400, "Tidak ada file yang diupload");
  }

  const filePart = form.find((f) => f.name === "file");
  const altTextPart = form.find((f) => f.name === "altText");

  if (!filePart) {
    return errorResponse(400, "Field 'file' tidak ditemukan");
  }

  const uploaded = await saveUploadedFile(filePart, "images", {
    imageProcessing: {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 80,
      convertToWebp: true,
    },
  });

  const [result] = await db.insert(images).values({
    fileName: uploaded.fileName,
    path: uploaded.path,
    altText: altTextPart ? altTextPart.data.toString("utf-8") : undefined,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    width: uploaded.width,
    height: uploaded.height,
    uploadedBy: user.id,
  });

  return successResponse(
    { id: result.insertId, path: uploaded.path },
    "Gambar berhasil diupload",
  );
});
