import { z } from "zod";

const menuTargetEnum: [string, ...string[]] = ["_self", "_blank"];

export const createMenuSchema = z.object({
  parentId: z
    .number({
      error: "Menu Induk harus berupa angka",
    })
    .int()
    .positive()
    .nullable()
    .optional(),
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  url: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(100).optional(),
  order: z
    .number({
      error: "Order harus berupa angka",
    })
    .int()
    .default(0),
  target: z
    .enum(menuTargetEnum, {
      error: "Target tidak valid",
    })
    .default("_self"),
  isActive: z.boolean().default(true),
});

export const updateMenuSchema = createMenuSchema.partial();

export const paramMenuIdSchema = z.object({
  id: z.coerce.number({ error: "ID harus berupa angka" }).int().positive(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
