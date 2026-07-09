import { files } from "~~/server/db/schema/files";
import { db } from "~~/server/db";
import { saveUploadedFile } from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) {
    return errorResponse(401, "Sesi tidak valid, silakan login kembali");
  }

  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    return errorResponse(400, "Tidak ada file yang diupload");
  }

  const filePart = form.find((f) => f.name === "file");

  if (!filePart) {
    return errorResponse(400, "Field 'file' tidak ditemukan");
  }

  // Files (PDF/DOC/dll) tidak diproses Sharp — langsung disimpan raw
  const uploaded = await saveUploadedFile(filePart, "files");

  const [result] = await db.insert(files).values({
    fileName: uploaded.fileName,
    originalName: uploaded.originalName,
    path: uploaded.path,
    mimeType: uploaded.mimeType,
    size: uploaded.size,
    uploadedBy: user.id,
  });

  return successResponse(
    { id: result.insertId, path: uploaded.path },
    "File berhasil diupload",
  );
});
