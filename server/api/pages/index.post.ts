import { eq } from "drizzle-orm";
import { pages } from "~~/server/db/schema/pages";
import { db } from "~~/server/db";
import { createPageSchema } from "~~/server/validators/page";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import slugify from "slugify";

export default defineEventHandler(async (event) => {
  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    title: fields.title,
    content: fields.content,
    meta_title: fields.meta_title || undefined,
    meta_description: fields.meta_description || undefined,
    is_published: fields.is_published,
  };

  const parsed = createPageSchema.omit({ meta_image: true }).safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { title, content, meta_title, meta_description, is_published } =
    parsed.data;

  const slug = slugify(title);

  const existingSlug = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
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

  let metaImagePath: string | undefined;
  if (files.meta_image) {
    const uploaded = await saveUploadedFile(files.meta_image, "images", {
      imageProcessing: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
        convertToWebp: true,
      },
    });
    metaImagePath = uploaded.path;
  }

  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const [result] = await db.insert(pages).values({
    title,
    slug,
    content,
    metaTitle: meta_title,
    metaDescription: meta_description,
    metaImage: metaImagePath,
    isPublished: is_published,
    authorId: user.id,
  });

  return successResponse({ id: result.insertId }, "Page berhasil dibuat");
});
