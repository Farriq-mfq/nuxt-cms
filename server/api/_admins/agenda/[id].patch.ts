import { eq } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { agenda } from "~~/server/db/schema/agenda";
import { images } from "~~/server/db/schema/images";
import { db } from "~~/server/db";
import { updateAgendaSchema } from "~~/server/validators/agenda";
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
    return errorResponse(404, "Agenda tidak ditemukan");

  const { id } = parsedParams.data;
  const existing = await db
    .select()
    .from(agenda)
    .where(eq(agenda.id, id))
    .limit(1);
  const existingAgenda = existing[0];
  if (!existingAgenda) return errorResponse(404, "Agenda tidak ditemukan");

  const { fields, files } = await parseMultipartBody(event);

  const parsed = updateAgendaSchema.safeParse({
    title: fields.title || undefined,
    description: fields.description || undefined,
    location: fields.location || undefined,
    startDate: fields.startDate || undefined,
    endDate: fields.endDate || undefined,
    isPublished: fields.isPublished,
  });

  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { title, description, location, startDate, endDate, isPublished } =
    parsed.data;

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

  await db
    .update(agenda)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(isPublished !== undefined && { isPublished }),
      ...(thumbnailId !== undefined && { thumbnailId }),
    })
    .where(eq(agenda.id, id));

  if (thumbnailId !== undefined && existingAgenda.thumbnailId) {
    const oldImage = await db
      .select()
      .from(images)
      .where(eq(images.id, existingAgenda.thumbnailId))
      .limit(1);
    if (oldImage[0]) {
      try {
        await unlink(join(process.cwd(), "public", oldImage[0].path));
      } catch {}
      await db.delete(images).where(eq(images.id, existingAgenda.thumbnailId));
    }
  }

  return successResponse({ id }, "Agenda berhasil diperbarui");
});
