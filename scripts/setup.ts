import "dotenv/config";
import { eq } from "drizzle-orm";
import * as p from "@clack/prompts";
import { hashPasswordLocal } from "../server/utils/password";
import { db } from "../server/db";
import { _admins } from "../server/db/schema";

async function main() {
  p.intro("Setup Admin Panel");

  const name = await p.text({
    message: "Nama lengkap admin",
    placeholder: "John Doe",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Nama tidak boleh kosong";
    },
  });
  if (p.isCancel(name)) {
    p.cancel("Setup dibatalkan");
    process.exit(0);
  }

  const username = await p.text({
    message: "Username",
    placeholder: "admin",
    validate: (value) => {
      if (!value || value.trim().length === 0)
        return "Username tidak boleh kosong";
      if (value.includes(" ")) return "Username tidak boleh mengandung spasi";
    },
  });
  if (p.isCancel(username)) {
    p.cancel("Setup dibatalkan");
    process.exit(0);
  }

  const existing = await db
    .select({ id: _admins.id })
    .from(_admins)
    .where(eq(_admins.username, username as string))
    .limit(1);

  if (existing[0]) {
    p.cancel(`Username "${username}" sudah digunakan.`);
    process.exit(1);
  }

  const password = await p.password({
    message: "Password",
    validate: (value) => {
      if (!value || value.length < 8) return "Password minimal 8 karakter";
    },
  });
  if (p.isCancel(password)) {
    p.cancel("Setup dibatalkan");
    process.exit(0);
  }

  const confirmPassword = await p.password({
    message: "Konfirmasi password",
    validate: (value) => {
      if (value !== password) return "Password tidak sama";
    },
  });
  if (p.isCancel(confirmPassword)) {
    p.cancel("Setup dibatalkan");
    process.exit(0);
  }

  const role = await p.select({
    message: "Role",
    options: [
      { value: "superadmin", label: "Superadmin" },
      { value: "admin", label: "Admin" },
      { value: "editor", label: "Editor" },
    ],
    initialValue: "superadmin",
  });
  if (p.isCancel(role)) {
    p.cancel("Setup dibatalkan");
    process.exit(0);
  }

  const s = p.spinner();
  s.start("Membuat akun admin...");

  const hashedPassword = await hashPasswordLocal(password as string);

  const [result] = await db.insert(_admins).values({
    name: name as string,
    username: username as string,
    password: hashedPassword,
    role: role as "admin" | "superadmin" | "editor",
    isActive: true,
  });

  s.stop("Akun admin berhasil dibuat.");
  p.outro(
    `Admin "${username}" (${role}) siap digunakan — ID: ${result.insertId}`,
  );
  process.exit(0);
}

main().catch((err) => {
  p.log.error("Terjadi kesalahan:");
  console.error(err);
  process.exit(1);
});
