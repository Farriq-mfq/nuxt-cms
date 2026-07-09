import { eq } from "drizzle-orm";
import { news } from "~~/server/db/schema/news";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { createNewsSchema } from "~~/server/validators/news";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import slugify from "slugify";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    categoryId: fields.categoryId || undefined,
    title: fields.title,
    excerpt: fields.excerpt || undefined,
    content: fields.content,
    isPublished: fields.isPublished,
  };

  const parsed = createNewsSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { categoryId, title, excerpt, content, isPublished } = parsed.data;

  const slug = slugify(title, { lower: true, strict: true });

  const existingSlug = await db
    .select({ id: news.id })
    .from(news)
    .where(eq(news.slug, slug))
    .limit(1);

  if (existingSlug[0]) {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "title",
        message:
          "Judul ini menghasilkan slug yang sudah digunakan, gunakan judul lain",
      },
    ]);
  }

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

  const [result] = await db.insert(news).values({
    categoryId,
    title,
    slug,
    excerpt,
    content,
    thumbnailId,
    isPublished,
    publishedAt: isPublished ? new Date() : null,
    authorId: user.id,
  });

  return successResponse({ id: result.insertId }, "Berita berhasil dibuat");
});
