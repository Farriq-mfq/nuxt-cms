import { popups } from "~~/server/db/schema/popups";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { createPopupSchema } from "~~/server/validators/popup";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  if (!user)
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");

  const { fields, files } = await parseMultipartBody(event);

  if (!files.image) {
    return errorResponse(422, "Validasi gagal", [
      { field: "image", message: "Gambar popup wajib diupload" },
    ]);
  }

  const parsed = createPopupSchema.safeParse({
    title: fields.title,
    linkUrl: fields.linkUrl || undefined,
    isActive: fields.isActive,
    startDate: fields.startDate || undefined,
    endDate: fields.endDate || undefined,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, linkUrl, isActive, startDate, endDate } = parsed.data;

  const uploaded = await saveUploadedFile(files.image, "images", {
    imageProcessing: {
      maxWidth: 1200,
      maxHeight: 1600,
      quality: 85,
      convertToWebp: true,
    },
  });

  const [insertedImage] = await db.insert(images).values({
    fileName: uploaded.fileName,
    path: uploaded.path,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    width: uploaded.width,
    height: uploaded.height,
    uploadedBy: user.id,
  });

  const [result] = await db.insert(popups).values({
    title,
    imageId: insertedImage.insertId,
    linkUrl: linkUrl || undefined,
    isActive,
    startDate,
    endDate,
  });

  return successResponse({ id: result.insertId }, "Popup berhasil dibuat");
});
