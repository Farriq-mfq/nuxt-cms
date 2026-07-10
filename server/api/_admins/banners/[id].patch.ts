import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { banners } from "~~/server/db/schema/banners";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateBannerSchema } from "~~/server/validators/banner";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import { z } from "zod";

const paramIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const parsedParams = paramIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Banner tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);
  const existingBanner = existing[0];

  if (!existingBanner) {
    return errorResponse(404, "Banner tidak ditemukan");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    title: fields.title || undefined,
    description: fields.description || undefined,
    linkUrl: fields.linkUrl || undefined,
    order: fields.order,
    isActive: fields.isActive,
    startDate: fields.startDate || undefined,
    endDate: fields.endDate || undefined,
  };

  const parsed = updateBannerSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { title, description, linkUrl, order, isActive, startDate, endDate } =
    parsed.data;

  let imageId: number | undefined;
  let oldImageToDelete: { id: number; path: string } | null = null;

  if (files.image) {
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

    imageId = insertedImage.insertId;

    if (existingBanner.imageId) {
      const oldImage = await db
        .select()
        .from(images)
        .where(eq(images.id, existingBanner.imageId))
        .limit(1);
      if (oldImage[0]) {
        oldImageToDelete = { id: oldImage[0].id, path: oldImage[0].path };
      }
    }
  }

  await db
    .update(banners)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(linkUrl !== undefined && { linkUrl: linkUrl || null }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(imageId !== undefined && { imageId }),
    })
    .where(eq(banners.id, id));

  if (oldImageToDelete) {
    try {
      await unlink(join(process.cwd(), "public", oldImageToDelete.path));
    } catch {}
    await db.delete(images).where(eq(images.id, oldImageToDelete.id));
  }

  return successResponse({ id }, "Banner berhasil diperbarui");
});
