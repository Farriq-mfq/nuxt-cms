import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { popups } from "~~/server/db/schema/popups";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updatePopupSchema } from "~~/server/validators/popup";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  if (!user)
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");

  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));
  if (!parsedParams.success) return errorResponse(404, "Popup tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(popups)
    .where(eq(popups.id, id))
    .limit(1);
  const existingPopup = existing[0];
  if (!existingPopup) return errorResponse(404, "Popup tidak ditemukan");

  const { fields, files } = await parseMultipartBody(event);

  const parsed = updatePopupSchema.safeParse({
    title: fields.title || undefined,
    linkUrl: fields.linkUrl || undefined,
    isActive: fields.isActive,
    startDate: fields.startDate || undefined,
    endDate: fields.endDate || undefined,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, linkUrl, isActive, startDate, endDate } = parsed.data;

  let imageId: number | undefined;
  if (files.image) {
    const uploaded = await saveUploadedFile(files.image, "images", {
      imageProcessing: {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 85,
        convertToWebp: true,
      },
    });
    const [inserted] = await db.insert(images).values({
      fileName: uploaded.fileName,
      path: uploaded.path,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      width: uploaded.width,
      height: uploaded.height,
      uploadedBy: user.id,
    });
    imageId = inserted.insertId;
  }

  await db
    .update(popups)
    .set({
      ...(title !== undefined && { title }),
      ...(linkUrl !== undefined && { linkUrl: linkUrl || null }),
      ...(isActive !== undefined && { isActive }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(imageId !== undefined && { imageId }),
    })
    .where(eq(popups.id, id));

  if (imageId !== undefined && existingPopup.imageId) {
    const oldImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingPopup.imageId))
      .limit(1);
    if (oldImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", oldImage[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, existingPopup.imageId));
    }
  }

  return successResponse({ id }, "Popup berhasil diperbarui");
});
