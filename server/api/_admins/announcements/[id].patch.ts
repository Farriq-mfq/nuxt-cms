import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { announcements } from "~~/server/db/schema/announcements";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateAnnouncementSchema } from "~~/server/validators/announcement";
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
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  const existingAnnouncement = existing[0];

  if (!existingAnnouncement) {
    return errorResponse(404, "Pengumuman tidak ditemukan");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    title: fields.title || undefined,
    content: fields.content || undefined,
    isPublished: fields.isPublished,
  };

  const parsed = updateAnnouncementSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { title, content, isPublished } = parsed.data;

  let thumbnailId: number | undefined;
  if (files.thumbnail) {
    const uploaded = await saveUploadedFile(files.thumbnail, "images", {
      imageProcessing: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
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

    thumbnailId = insertedImage.insertId;
  }

  let publishedAt: Date | null | undefined;
  if (isPublished === true && !existingAnnouncement.isPublished) {
    publishedAt = new Date();
  } else if (isPublished === false) {
    publishedAt = null;
  }

  await db
    .update(announcements)
    .set({
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(isPublished !== undefined && { isPublished }),
      ...(publishedAt !== undefined && { publishedAt }),
      ...(thumbnailId !== undefined && { thumbnailId }),
    })
    .where(eq(announcements.id, id));

  if (thumbnailId !== undefined && existingAnnouncement.thumbnailId) {
    const oldImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingAnnouncement.thumbnailId))
      .limit(1);
    if (oldImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", oldImage[0].path));
      } catch {}
      await db
        .delete(images)
        .where(eq(images.id, existingAnnouncement.thumbnailId));
    }
  }

  return successResponse({ id }, "Pengumuman berhasil diperbarui");
});
