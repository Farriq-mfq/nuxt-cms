import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { pages } from "~~/server/db/schema/pages";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import { paramPageIdSchema, updatePageSchema } from "~~/server/validators/page";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const parsedParams = paramPageIdSchema.safeParse(params);

  if (!parsedParams.success) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  const { id } = parsedParams.data;

  const existing = await db
    .select()
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  const existingPage = existing[0];

  if (!existingPage) {
    return errorResponse(404, "Halaman tidak ditemukan");
  }

  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    title: fields.title || undefined,
    content: fields.content || undefined,
    meta_title: fields.meta_title || undefined,
    meta_description: fields.meta_description || undefined,
    is_published: fields.is_published,
  };

  const parsed = updatePageSchema.omit({ meta_image: true }).safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { title, content, meta_title, meta_description, is_published } =
    parsed.data;

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

    if (existingPage.metaImage) {
      try {
        const { unlink } = await import("node:fs/promises");
        const { join } = await import("node:path");
        await unlink(join(process.cwd(), "public", existingPage.metaImage));
      } catch {}
    }
  }

  await db
    .update(pages)
    .set({
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(meta_title !== undefined && { metaTitle: meta_title }),
      ...(meta_description !== undefined && {
        metaDescription: meta_description,
      }),
      ...(metaImagePath !== undefined && { metaImage: metaImagePath }),
      ...(is_published !== undefined && { isPublished: is_published }),
    })
    .where(eq(pages.id, id));

  return successResponse({ id }, "Halaman berhasil diperbarui");
});
