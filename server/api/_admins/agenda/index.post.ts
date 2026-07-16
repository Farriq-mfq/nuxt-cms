import { eq } from "drizzle-orm";
import { agenda } from "~~/server/db/schema/agenda";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { createAgendaSchema } from "~~/server/validators/agenda";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import { saveUploadedFile } from "~~/server/utils/upload";
import slugify from "slugify";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  if (!user)
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");

  const { fields, files } = await parseMultipartBody(event);

  const parsed = createAgendaSchema.safeParse({
    title: fields.title,
    description: fields.description || undefined,
    location: fields.location || undefined,
    startDate: fields.startDate,
    endDate: fields.endDate || undefined,
    isPublished: fields.isPublished,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, description, location, startDate, endDate, isPublished } =
    parsed.data;
  const slug = slugify(title, { lower: true, strict: true });

  const existingSlug = await db
    .select({ id: agenda.id })
    .from(agenda)
    .where(eq(agenda.slug, slug))
    .limit(1);
  if (existingSlug[0]) {
    return errorResponse(422, "Validasi gagal", [
      {
        field: "title",
        message: "Judul ini menghasilkan slug yang sudah digunakan",
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
    const [inserted] = await db.insert(images).values({
      fileName: uploaded.fileName,
      path: uploaded.path,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      width: uploaded.width,
      height: uploaded.height,
      uploadedBy: user.id,
    });
    thumbnailId = inserted.insertId;
  }

  const [result] = await db.insert(agenda).values({
    title,
    slug,
    description,
    location,
    startDate,
    endDate,
    thumbnailId,
    isPublished,
    authorId: user.id,
  });

  return successResponse({ id: result.insertId }, "Agenda berhasil dibuat");
});
