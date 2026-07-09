import { z } from "zod";

export const updateImageSchema = z.object({
  altText: z.string().trim().max(255).optional(),
});

export type UpdateImageInput = z.infer<typeof updateImageSchema>;
