import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username tidak boleh kosong").max(255),
  password: z.string().trim().min(1, "Password tidak boleh kosong").max(255),
});
