import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateVideoAlbumSchema } from "~~/server/validators/video-album";
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
  if (!parsedParams.success)
    return errorResponse(404, "Album video tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(videoAlbums)
    .where(eq(videoAlbums.id, id))
    .limit(1);
  const existingAlbum = existing[0];
  if (!existingAlbum) return errorResponse(404, "Album video tidak ditemukan");

  const { fields, files } = await parseMultipartBody(event);

  const parsed = updateVideoAlbumSchema.safeParse({
    title: fields.title || undefined,
    description: fields.description || undefined,
    isActive: fields.isActive,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, description, isActive } = parsed.data;

  let coverImageId: number | undefined;
  if (files.cover) {
    const uploaded = await saveUploadedFile(files.cover, "images", {
      imageProcessing: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
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
    coverImageId = inserted.insertId;
  }

  await db
    .update(videoAlbums)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(coverImageId !== undefined && { coverImageId }),
    })
    .where(eq(videoAlbums.id, id));

  if (coverImageId !== undefined && existingAlbum.coverImageId) {
    const oldImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingAlbum.coverImageId))
      .limit(1);
    if (oldImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", oldImage[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, existingAlbum.coverImageId));
    }
  }

  return successResponse({ id }, "Album video berhasil diperbarui");
});
