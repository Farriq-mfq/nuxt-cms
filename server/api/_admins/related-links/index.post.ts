import { relatedLinks } from "~~/server/db/schema/related-links";
import { db } from "~~/server/db";
import { createRelatedLinkSchema } from "~~/server/validators/related-link";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = createRelatedLinkSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const [result] = await db.insert(relatedLinks).values(parsed.data);

  return successResponse(
    { id: result.insertId },
    "Related link berhasil dibuat",
  );
});
