// server/api/_admins/video-albums/index.post.ts
import { eq } from "drizzle-orm";
import { videoAlbums } from "~~/server/db/schema/video-albums";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { createVideoAlbumSchema } from "~~/server/validators/video-album";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import slugify from "slugify";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  if (!user)
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");

  const { fields, files } = await parseMultipartBody(event);

  const parsed = createVideoAlbumSchema.safeParse({
    title: fields.title,
    description: fields.description || undefined,
    isActive: fields.isActive,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, description, isActive } = parsed.data;
  const slug = slugify(title, { lower: true, strict: true });

  const existingSlug = await db
    .select({ id: videoAlbums.id })
    .from(videoAlbums)
    .where(eq(videoAlbums.slug, slug))
    .limit(1);
  if (existingSlug[0]) {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "title",
        message: "Judul ini menghasilkan slug yang sudah digunakan",
      },
    ]);
  }

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

  const [result] = await db
    .insert(videoAlbums)
    .values({ title, slug, description, coverImageId, isActive });

  return successResponse(
    { id: result.insertId },
    "Album video berhasil dibuat",
  );
});
