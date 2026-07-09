import { like, desc, inArray } from "drizzle-orm";
import { db } from "~~/server/db";
import { files } from "~~/server/db/schema/files";
import { paginationQuerySchema } from "~~/server/validators/pagination";
import { z } from "zod";

const filesQuerySchema = paginationQuerySchema.extend({
  ids: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = filesQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, ids } = parsed.data;

  const where = ids
    ? inArray(
        files.id,
        ids
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n)),
      )
    : search
      ? like(files.originalName, `%${search}%`)
      : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.files,
    table: files,
    where,
    orderBy: desc(files.createdAt),
    with: {
      uploader: { columns: { password: false } },
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar file berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
