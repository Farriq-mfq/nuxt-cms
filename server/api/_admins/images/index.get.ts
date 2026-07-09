import { like, desc, inArray } from "drizzle-orm";
import { db } from "~~/server/db";
import { images } from "~~/server/db/schema/images";
import { paginationQuerySchema } from "~~/server/validators/pagination";
import { z } from "zod";

const imagesQuerySchema = paginationQuerySchema.extend({
  ids: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const parsed = imagesQuerySchema.safeParse(getQuery(event));
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { page, limit, search, ids } = parsed.data;

  const where = ids
    ? inArray(
        images.id,
        ids
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n)),
      )
    : search
      ? like(images.fileName, `%${search}%`)
      : undefined;

  const { items, total } = await getPaginatedResult({
    queryable: db.query.images,
    table: images,
    where,
    orderBy: desc(images.createdAt),
    with: {
      uploader: { columns: { password: false } },
    },
    page,
    limit,
  });

  return successResponse(
    items,
    "Daftar gambar berhasil diambil",
    buildPaginationMeta(page, limit, total),
  );
});
