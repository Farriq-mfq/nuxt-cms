import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPasswordLocal(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPasswordLocal(
  hashed: string,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}
