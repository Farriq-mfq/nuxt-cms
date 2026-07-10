import { banners } from "~~/server/db/schema/banners";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { createBannerSchema } from "~~/server/validators/banner";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const { fields, files } = await parseMultipartBody(event);

  if (!files.image) {
    return errorResponse(422, "Validasi gagal", [
      { field: "image", message: "Gambar banner wajib diupload" },
    ]);
  }

  const rawBody = {
    title: fields.title,
    description: fields.description || undefined,
    linkUrl: fields.linkUrl || undefined,
    order: fields.order,
    isActive: fields.isActive,
    startDate: fields.startDate || undefined,
    endDate: fields.endDate || undefined,
  };

  const parsed = createBannerSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { title, description, linkUrl, order, isActive, startDate, endDate } =
    parsed.data;

  const uploaded = await saveUploadedFile(files.image, "images", {
    imageProcessing: {
      maxWidth: 1920,
      maxHeight: 1080,
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

  const [result] = await db.insert(banners).values({
    title,
    description,
    imageId: insertedImage.insertId,
    linkUrl: linkUrl || undefined,
    order,
    isActive,
    startDate,
    endDate,
  });

  return successResponse({ id: result.insertId }, "Banner berhasil dibuat");
});
