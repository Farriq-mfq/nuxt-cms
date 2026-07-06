import { db } from "../../db";
import { imageUploadSchema } from "../../validators/upload";

import { images } from "../../db/schema";
import { errorResponse, zodErrorResponse } from "../../utils/response";
import { saveUploadedFile } from "../../utils/upload";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    errorResponse(400, "Tidak ada file yang diupload");
  }

  const filePart = form!.find((f) => f.name === "file");
  const altTextPart = form!.find((f) => f.name === "altText");

  if (!filePart) {
    errorResponse(400, 'Field "file" tidak ditemukan');
  }

  const validation = imageUploadSchema.safeParse({
    filename: filePart!.filename,
    type: filePart!.type,
    size: filePart!.data.length,
    altText: altTextPart ? altTextPart.data.toString("utf-8") : undefined,
  });

  if (!validation.success) {
    zodErrorResponse(validation.error);
  }

  const validated = validation.data!;
  const result = await saveUploadedFile(filePart!, "images");

  const [inserted] = await db.insert(images).values({
    fileName: result.fileName,
    path: result.path,
    mimeType: result.mimeType,
    size: result.size,
    altText: validated.altText,
  });

  return successResponse(result, "Gambar berhasil diupload");
});
