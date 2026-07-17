import { z } from "zod";

const booleanFromFormData = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1";
  });

export const createAgendaSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong").max(255),
  description: z.string().trim().optional(),
  location: z.string().trim().max(500).optional(),
  startDate: z.coerce.date({ error: "Tanggal mulai tidak valid" }),
  endDate: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.coerce.date().optional(),
  ),
  isPublished: booleanFromFormData.default(true),
});

export const updateAgendaSchema = createAgendaSchema.partial();
