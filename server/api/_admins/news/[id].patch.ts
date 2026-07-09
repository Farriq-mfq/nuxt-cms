import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { news } from "~~/server/db/schema/news";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateNewsSchema } from "~~/server/validators/news";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import { z } from "zod";

const paramNewsIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const parsedParams = paramNewsIdSchema.safeParse(getRouterParams(event));

  if (!parsedParams.success) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db.select().from(news).where(eq(news.id, id)).limit(1);
  const existingNews = existing[0];

  if (!existingNews) {
    return errorResponse(404, "Berita tidak ditemukan");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    categoryId: fields.categoryId || undefined,
    title: fields.title || undefined,
    excerpt: fields.excerpt || undefined,
    content: fields.content || undefined,
    isPublished: fields.isPublished,
  };

  const parsed = updateNewsSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { categoryId, title, excerpt, content, isPublished } = parsed.data;

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

    if (existingNews.thumbnailId) {
      const oldImage = await db
        .select()
        .from(images)
        .where(eq(images.id, existingNews.thumbnailId))
        .limit(1);

      if (oldImage[0]) {
        try {
          await unlink(join(process.cwd(), "public", oldImage[0].path));
        } catch {}
        await db.delete(images).where(eq(images.id, existingNews.thumbnailId));
      }
    }
  }

  let publishedAt: Date | null | undefined;
  if (isPublished === true && !existingNews.isPublished) {
    publishedAt = new Date();
  } else if (isPublished === false) {
    publishedAt = null;
  }

  await db
    .update(news)
    .set({
      ...(categoryId !== undefined && { categoryId }),
      ...(title !== undefined && { title }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(thumbnailId !== undefined && { thumbnailId }),
      ...(isPublished !== undefined && { isPublished }),
      ...(publishedAt !== undefined && { publishedAt }),
    })
    .where(eq(news.id, id));

  return successResponse({ id }, "Berita berhasil diperbarui");
});
