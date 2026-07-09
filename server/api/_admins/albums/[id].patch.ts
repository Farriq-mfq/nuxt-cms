import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { albums } from "~~/server/db/schema/album-gallery";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateAlbumSchema } from "~~/server/validators/album";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import { z } from "zod";

const paramAlbumIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const parsedParams = paramAlbumIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(albums)
    .where(eq(albums.id, id))
    .limit(1);
  const existingAlbum = existing[0];

  if (!existingAlbum) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    title: fields.title || undefined,
    description: fields.description || undefined,
    isActive: fields.isActive,
  };

  const parsed = updateAlbumSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

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

    const [insertedImage] = await db.insert(images).values({
      fileName: uploaded.fileName,
      path: uploaded.path,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      width: uploaded.width,
      height: uploaded.height,
      uploadedBy: user.id,
    });

    coverImageId = insertedImage.insertId;

    if (existingAlbum.coverImageId) {
      const oldCover = await db
        .select()
        .from(images)
        .where(eq(images.id, existingAlbum.coverImageId))
        .limit(1);
      if (oldCover[0]) {
        try {
          await unlink(join(process.cwd(), "public", oldCover[0].path));
        } catch {}
        await db
          .delete(images)
          .where(eq(images.id, existingAlbum.coverImageId));
      }
    }
  }

  await db
    .update(albums)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(coverImageId !== undefined && { coverImageId }),
    })
    .where(eq(albums.id, id));

  return successResponse({ id }, "Album berhasil diperbarui");
});
