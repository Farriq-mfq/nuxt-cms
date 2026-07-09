import { eq, max } from "drizzle-orm";
import { galleries, albums } from "~~/server/db/schema/album-gallery";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
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

  const { id: albumId } = parsedParams.data;

  const existingAlbum = await db
    .select({ id: albums.id })
    .from(albums)
    .where(eq(albums.id, albumId))
    .limit(1);

  if (!existingAlbum[0]) {
    return errorResponse(404, "Album tidak ditemukan");
  }

  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    return errorResponse(400, "Tidak ada gambar yang diupload");
  }

  const fileParts = form.filter((f) => f.name === "images" && f.filename);

  if (!fileParts.length) {
    return errorResponse(400, "Field 'images' tidak ditemukan");
  }

  const [maxOrderResult] = await db
    .select({ maxOrder: max(galleries.order) })
    .from(galleries)
    .where(eq(galleries.albumId, albumId));

  let nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  const insertedResults = [];

  for (const filePart of fileParts) {
    const uploaded = await saveUploadedFile(filePart, "images", {
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

    const [insertedGallery] = await db.insert(galleries).values({
      albumId,
      imageId: insertedImage.insertId,
      order: nextOrder,
    });

    insertedResults.push({
      id: insertedGallery.insertId,
      imageId: insertedImage.insertId,
      path: uploaded.path,
    });
    nextOrder++;
  }

  return successResponse(
    insertedResults,
    `${insertedResults.length} gambar berhasil ditambahkan ke album`,
  );
});
